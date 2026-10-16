import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  CompleteOnboardingResponse,
  DocumentType,
  OnboardingService,
  OnboardingStatus,
} from './types/onboarding'
import './App.css'

type OnboardingStep = 'data' | 'otp' | 'pin' | 'complete'
type FormField = 'documentNumber' | 'email' | 'otp' | 'pin'

interface RequestContext {
  requestId: string
  trackingToken: string
}

export interface AppProps {
  service?: OnboardingService
}

const stepLabels = ['Tus datos', 'Verifica tu correo', 'Crea tu PIN']

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : 'No se pudo completar la solicitud. Inténtalo nuevamente.'
}

function Progress({ step }: { step: OnboardingStep }) {
  const activeIndex = step === 'data' ? 0 : step === 'otp' ? 1 : step === 'pin' ? 2 : 3

  return (
    <ol className="step-list" aria-label="Progreso del onboarding" aria-live="polite">
      {stepLabels.map((label, index) => {
        const completed = index < activeIndex
        const current = index === activeIndex

        return (
          <li
            className={completed ? 'step-complete' : undefined}
            aria-current={current ? 'step' : undefined}
            key={label}
          >
            <span className="step-number" aria-hidden="true">
              {completed ? '✓' : index + 1}
            </span>
            <span className="step-copy">
              <span>{label}</span>
              {!completed && !current && <small>Pendiente</small>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function App({ service }: AppProps = {}) {
  const [step, setStep] = useState<OnboardingStep>('data')
  const [documentType, setDocumentType] = useState<DocumentType>('DNI')
  const [documentNumber, setDocumentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [pin, setPin] = useState('')
  const [request, setRequest] = useState<RequestContext | null>(null)
  const [authoritativeStatus, setAuthoritativeStatus] =
    useState<OnboardingStatus | null>(null)
  const [completion, setCompletion] =
    useState<CompleteOnboardingResponse | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (
      !service ||
      !request ||
      step !== 'otp' ||
      authoritativeStatus !== 'OTP_PENDING'
    ) {
      return
    }

    let active = true
    let polling = false
    const intervalId = window.setInterval(() => {
      if (polling) return
      polling = true

      void service
        .getStatus(request.requestId, request.trackingToken)
        .then((status) => {
          if (!active) return
          setAuthoritativeStatus(status.status)
          if (status.status === 'OTP_VERIFIED') {
            setOtp('')
            setStep('pin')
          }
        })
        .catch((error: unknown) => {
          if (!active) return
          setFormError(getErrorMessage(error))
          window.clearInterval(intervalId)
        })
        .finally(() => {
          polling = false
        })
    }, 3000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [authoritativeStatus, request, service, step])

  function updateFieldError(field: FormField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  async function startOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors: Partial<Record<FormField, string>> = {}
    const normalizedDocumentNumber = documentNumber.trim()
    const normalizedEmail = email.trim()

    if (!normalizedDocumentNumber) {
      errors.documentNumber = 'Ingresa tu número de documento.'
    }
    if (!normalizedEmail) {
      errors.email = 'Ingresa tu correo.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = 'Revisa el formato de tu correo.'
    }

    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) return
    if (!service) {
      setFormError('La integración con el servicio de onboarding no está configurada.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await service.start({
        documentType,
        documentNumber: normalizedDocumentNumber,
        email: normalizedEmail,
      })
      if (result.status !== 'OTP_PENDING') {
        setFormError('El servicio no confirmó el inicio de la solicitud.')
        return
      }
      setRequest({
        requestId: result.requestId,
        trackingToken: result.trackingToken,
      })
      setAuthoritativeStatus(result.status)
      setDocumentNumber('')
      setEmail('')
      setStep('otp')
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{4}$/.test(otp)) {
      setFieldErrors((current) => ({
        ...current,
        otp: 'Ingresa el código de cuatro dígitos.',
      }))
      return
    }
    if (!service || !request) {
      setFormError('No hay una solicitud activa. Inicia nuevamente el onboarding.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setFieldErrors((current) => ({ ...current, otp: undefined }))
    try {
      const result = await service.verifyOtp(
        request.requestId,
        request.trackingToken,
        otp,
      )
      setAuthoritativeStatus(result.status)
      if (result.status !== 'OTP_VERIFIED') {
        setFormError(result.message ?? 'El código aún no fue verificado.')
        setOtp('')
        return
      }
      setOtp('')
      setStep('pin')
    } catch (error) {
      setOtp('')
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function completeOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{4}$/.test(pin)) {
      setFieldErrors((current) => ({
        ...current,
        pin: 'Crea un PIN numérico de cuatro dígitos.',
      }))
      return
    }
    if (
      !service ||
      !request ||
      authoritativeStatus !== 'OTP_VERIFIED'
    ) {
      setFormError('Verifica el correo antes de crear el PIN.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setFieldErrors((current) => ({ ...current, pin: undefined }))
    try {
      const result = await service.complete(
        request.requestId,
        request.trackingToken,
        pin,
      )
      if (result.status !== 'ACTIVE') {
        setFormError('El servicio no confirmó la activación de la wallet.')
        return
      }
      setCompletion(result)
      setAuthoritativeStatus(result.status)
      setPin('')
      setRequest(null)
      setStep('complete')
    } catch (error) {
      setPin('')
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Billetera Demo, inicio">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>Billetera Demo</span>
        </a>
        <span className="demo-pill">DEMO · datos sintéticos</span>
      </header>

      <section className="content onboarding" aria-labelledby="onboarding-title">
        <p className="eyebrow">PRIMEROS PASOS</p>
        <h1 id="onboarding-title">
          {step === 'complete' ? 'Registro completado' : 'Activa tu wallet'}
        </h1>
        <p className="intro">
          Usa datos ficticios para esta demostración. No es una cuenta real ni
          una verificación de identidad productiva.
        </p>

        <Progress step={step} />

        <section className="card onboarding-card" aria-live="polite">
          {step === 'data' && (
            <form onSubmit={(event) => void startOnboarding(event)} noValidate>
              <h2>Ingresa tus datos</h2>
              <p className="field-description">
                El backend iniciará la verificación por correo. Solo utiliza
                información sintética.
              </p>

              <div className="field">
                <label htmlFor="documentType">Tipo de documento</label>
                <select
                  id="documentType"
                  name="documentType"
                  value={documentType}
                  onChange={(event) => {
                    if (event.target.value === 'DNI' || event.target.value === 'PASSPORT') {
                      setDocumentType(event.target.value)
                    }
                  }}
                >
                  <option value="DNI">DNI</option>
                  <option value="PASSPORT">Pasaporte</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="documentNumber">Número de documento</label>
                <input
                  autoComplete="off"
                  id="documentNumber"
                  name="documentNumber"
                  value={documentNumber}
                  aria-invalid={Boolean(fieldErrors.documentNumber)}
                  aria-describedby={
                    fieldErrors.documentNumber ? 'documentNumber-error' : undefined
                  }
                  onChange={(event) => {
                    setDocumentNumber(event.target.value)
                    updateFieldError('documentNumber')
                  }}
                />
                {fieldErrors.documentNumber && (
                  <p className="field-error" id="documentNumber-error" role="alert">
                    {fieldErrors.documentNumber}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="email">Correo</label>
                <input
                  autoComplete="off"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    updateFieldError('email')
                  }}
                />
                {fieldErrors.email && (
                  <p className="field-error" id="email-error" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="button button-primary button-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando…' : 'Continuar'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={(event) => void verifyOtp(event)} noValidate>
              <h2>Verifica tu correo</h2>
              <p className="field-description">
                Ingresa el código de cuatro dígitos recibido en el buzón de
                prueba. El código vence en cinco minutos; no se puede reenviar.
              </p>
              <div className="field">
                <label htmlFor="otp">Código OTP</label>
                <input
                  autoComplete="one-time-code"
                  id="otp"
                  inputMode="numeric"
                  maxLength={4}
                  name="otp"
                  pattern="[0-9]{4}"
                  value={otp}
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? 'otp-error' : 'otp-help'}
                  onChange={(event) => {
                    setOtp(event.target.value)
                    updateFieldError('otp')
                  }}
                />
                <span className="field-description" id="otp-help">
                  Se permiten tres intentos por código.
                </span>
                {fieldErrors.otp && (
                  <p className="field-error" id="otp-error" role="alert">
                    {fieldErrors.otp}
                  </p>
                )}
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="button button-primary button-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verificando…' : 'Verificar código'}
              </button>
              {authoritativeStatus === 'OTP_PENDING' && (
                <p className="status-message" role="status">
                  Esperando la verificación del servicio…
                </p>
              )}
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={(event) => void completeOnboarding(event)} noValidate>
              <h2>Crea tu PIN</h2>
              <p className="field-description">
                El correo fue verificado. Crea un PIN numérico de cuatro
                dígitos para completar el registro de demo.
              </p>
              <div className="field">
                <label htmlFor="pin">PIN</label>
                <input
                  autoComplete="new-password"
                  id="pin"
                  inputMode="numeric"
                  maxLength={4}
                  name="pin"
                  pattern="[0-9]{4}"
                  type="password"
                  value={pin}
                  aria-invalid={Boolean(fieldErrors.pin)}
                  aria-describedby={fieldErrors.pin ? 'pin-error' : 'pin-help'}
                  onChange={(event) => {
                    setPin(event.target.value)
                    updateFieldError('pin')
                  }}
                />
                <span className="field-description" id="pin-help">
                  El PIN solo se mantiene en memoria durante este paso.
                </span>
                {fieldErrors.pin && (
                  <p className="field-error" id="pin-error" role="alert">
                    {fieldErrors.pin}
                  </p>
                )}
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button
                className="button button-primary button-full"
                disabled={isSubmitting || authoritativeStatus !== 'OTP_VERIFIED'}
              >
                {isSubmitting ? 'Completando…' : 'Completar registro'}
              </button>
            </form>
          )}

          {step === 'complete' && (
            <div className="success-state">
              <span className="success-icon" aria-hidden="true">✓</span>
              {completion && (
                <>
                  <h2>Hola, {completion.customer.firstName} {completion.customer.lastName}</h2>
                  <p>Tu wallet está activa. La confirmación proviene del servicio de onboarding.</p>
                </>
              )}
              {completion && (
                <div className="wallet-balance" aria-label="Saldo ficticio de la wallet">
                  <span>Saldo ficticio</span>
                  <strong>
                    S/ {(completion.wallet.balanceMinorUnits / 100).toFixed(2)}{' '}
                    {completion.wallet.currency}
                  </strong>
                  <p>No se procesan pagos, transferencias ni retiros.</p>
                </div>
              )}
              <div className="payment-preview">
                <span aria-hidden="true">↗</span>
                <div>
                  <strong>Pagos de bajo monto</strong>
                  <p>Próximamente. Esta demo no procesa pagos.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <p className="fine-print">
          Los datos ingresados y las credenciales no se guardan en almacenamiento
          persistente del navegador.
        </p>
      </section>
    </main>
  )
}

export default App
