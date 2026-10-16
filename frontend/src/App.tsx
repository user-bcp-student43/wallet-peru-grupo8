import { useState } from 'react'
import {
  createWalletDemoService,
  isWalletDemoServiceError,
  isValidDemoAlias,
} from './services/walletDemoService'
import type {
  ActivationStatus,
  DemoPayment,
  HistoryStatus,
  PaymentStatus,
} from './types/walletDemo'
import type { WalletDemoService } from './services/walletDemoService'
import './App.css'

type WalletPage = 'wallet' | 'transfer' | 'history'

export interface AppProps {
  service?: WalletDemoService
}

const recipient = 'María Demo'
const amountLabel = 'S/ 5.00'

export function App({ service: providedService }: AppProps = {}) {
  const [service] = useState(
    () => providedService ?? createWalletDemoService(),
  )
  const [alias, setAlias] = useState('')
  const [aliasError, setAliasError] = useState('')
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1)
  const [activationStatus, setActivationStatus] =
    useState<ActivationStatus>('idle')
  const [activationError, setActivationError] = useState('')
  const [page, setPage] = useState<WalletPage>('wallet')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [payment, setPayment] = useState<DemoPayment | null>(null)
  const [paymentError, setPaymentError] = useState('')
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>('idle')
  const [history, setHistory] = useState<DemoPayment[]>([])
  const [historyError, setHistoryError] = useState('')

  function continueToReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidDemoAlias(alias)) {
      setAliasError('Usa entre 3 y 20 letras, números o guion bajo.')
      return
    }
    setAliasError('')
    setOnboardingStep(2)
  }

  async function activateWallet() {
    setActivationStatus('pending')
    setActivationError('')
    try {
      await service.activate(alias)
      setActivationStatus('active')
    } catch (error) {
      if (!isWalletDemoServiceError(error)) throw error
      setActivationStatus('technical-error')
      setActivationError(error.message)
    }
  }

  async function confirmPayment() {
    setPaymentStatus('pending')
    setPayment(null)
    setPaymentError('')
    try {
      const result = await service.pay()
      if (result.status === 'unconfirmed') {
        setPaymentStatus('unconfirmed')
        return
      }
      if (!result.payment.reference.startsWith('DEMO-')) {
        setPaymentStatus('technical-error')
        setPaymentError('La respuesta no incluye una referencia de demo válida.')
        return
      }
      setPayment(result.payment)
      setPaymentStatus('confirmed')
    } catch (error) {
      if (!isWalletDemoServiceError(error)) throw error
      if (
        error.details.operation === 'payment' &&
        error.details.kind === 'timeout'
      ) {
        setPaymentStatus('unconfirmed')
        return
      }
      setPaymentStatus('technical-error')
      setPaymentError(error.message)
    }
  }

  async function openHistory() {
    setPage('history')
    setHistoryStatus('loading')
    setHistoryError('')
    try {
      const payments = await service.getHistory()
      setHistory(payments)
      setHistoryStatus(payments.length === 0 ? 'empty' : 'loaded')
    } catch (error) {
      if (!isWalletDemoServiceError(error)) throw error
      setHistoryStatus('technical-error')
      setHistoryError(error.message)
    }
  }

  function navigate(nextPage: WalletPage) {
    if (nextPage === 'history') {
      void openHistory()
      return
    }
    setPage(nextPage)
  }

  if (activationStatus !== 'active') {
    return (
      <main className="app-shell">
        <header className="topbar">
          <a className="brand" href="/" aria-label="Billetera Demo, inicio">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>Billetera Demo</span>
          </a>
          <span className="demo-pill">DEMO · solo frontend</span>
        </header>

        <section className="content onboarding" aria-labelledby="onboarding-title">
          <p className="eyebrow">PRIMEROS PASOS</p>
          <h1 id="onboarding-title">Activa tu wallet</h1>
          <p className="intro">
            Recorre una experiencia de prueba con datos ficticios. No es una
            cuenta real ni un proceso de verificación de identidad.
          </p>

          <ol className="step-list" aria-label="Pasos de activación">
            <li aria-current={onboardingStep === 1 ? 'step' : undefined}>
              <span className="step-number">1</span>
              <span>Ingresar alias</span>
            </li>
            <li aria-current={onboardingStep === 2 ? 'step' : undefined}>
              <span className="step-number">2</span>
              <span>Revisar y activar</span>
            </li>
          </ol>

          <section className="card onboarding-card">
            {onboardingStep === 1 ? (
              <form onSubmit={continueToReview} noValidate>
                <h2>Elige tu alias de demo</h2>
                <p className="field-description" id="alias-help">
                  De 3 a 20 caracteres: letras sin acento, números o guion
                  bajo. No uses espacios ni guiones.
                </p>
                <label htmlFor="alias">Alias</label>
                <input
                  autoComplete="off"
                  id="alias"
                  name="alias"
                  value={alias}
                  aria-invalid={Boolean(aliasError)}
                  aria-describedby={aliasError ? 'alias-help alias-error' : 'alias-help'}
                  onChange={(event) => {
                    setAlias(event.target.value)
                    setAliasError('')
                  }}
                />
                {aliasError && (
                  <p className="field-error" id="alias-error" role="alert">
                    {aliasError}
                  </p>
                )}
                <button className="button button-primary" type="submit">
                  Continuar
                </button>
              </form>
            ) : (
              <div>
                <h2>Revisa tus datos</h2>
                <dl className="summary-list">
                  <div>
                    <dt>Alias de demo</dt>
                    <dd>{alias}</dd>
                  </div>
                  <div>
                    <dt>Tipo de cuenta</dt>
                    <dd>Wallet de prueba</dd>
                  </div>
                </dl>
                <p className="notice">
                  Al activar, se creará una wallet simulada solo para esta
                  sesión en el navegador.
                </p>
                {activationError && (
                  <p className="field-error" role="alert">{activationError}</p>
                )}
                <div className="button-row">
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={activationStatus === 'pending'}
                    onClick={() => setOnboardingStep(1)}
                  >
                    Volver
                  </button>
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={activationStatus === 'pending'}
                    onClick={() => void activateWallet()}
                  >
                    {activationStatus === 'pending' ? 'Activando…' : 'Activar wallet'}
                  </button>
                </div>
                {activationStatus === 'pending' && (
                  <p className="status-message" role="status">Activando tu wallet de demo…</p>
                )}
              </div>
            )}
          </section>
          <p className="fine-print">
            Estado temporal de demostración. Recargar la página reinicia el
            recorrido.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Billetera Demo, inicio">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>Billetera Demo</span>
        </a>
        <span className="demo-pill">DEMO · solo frontend</span>
      </header>

      <div className="wallet-layout">
        <aside className="sidebar">
          <p className="sidebar-caption">TU CUENTA</p>
          <p className="account-name">{alias}</p>
          <span className="active-label">
            <span aria-hidden="true" /> Wallet activa (demo)
          </span>
          <nav className="side-nav" aria-label="Secciones de la wallet">
            <button
              type="button"
              aria-current={page === 'wallet' ? 'page' : undefined}
              onClick={() => navigate('wallet')}
            >
              <span aria-hidden="true">⌂</span> Inicio
            </button>
            <button
              type="button"
              aria-current={page === 'transfer' ? 'page' : undefined}
              onClick={() => navigate('transfer')}
            >
              <span aria-hidden="true">↗</span> Transferir
            </button>
            <button
              type="button"
              aria-current={page === 'history' ? 'page' : undefined}
              onClick={() => navigate('history')}
            >
              <span aria-hidden="true">◷</span> Historial
            </button>
          </nav>
          <p className="sidebar-note">
            Solo simulación local. Los datos no se guardan al recargar.
          </p>
        </aside>

        <section className="main-content" aria-live="polite">
          {page === 'wallet' && (
            <>
              <p className="eyebrow">RESUMEN</p>
              <h1>Hola, {alias}</h1>
              <p className="intro">Tu wallet de demo está lista para probar.</p>
              <div className="wallet-ready-card">
                <span className="wallet-ready-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>Wallet de demo activa</strong>
                  <p>Ya puedes recorrer una transferencia de prueba.</p>
                </div>
              </div>
              <div className="section-heading">
                <h2>¿Qué quieres hacer?</h2>
              </div>
              <button
                className="action-card"
                type="button"
                onClick={() => navigate('transfer')}
              >
                <span className="action-icon" aria-hidden="true">↗</span>
                <span>
                  <strong>Hacer una transferencia</strong>
                  <small>Prueba un pago simulado de S/ 5.00</small>
                </span>
                <span className="action-arrow" aria-hidden="true">→</span>
              </button>
            </>
          )}

          {page === 'transfer' && (
            <>
              <p className="eyebrow">TRANSFERENCIA DE DEMO</p>
              <h1>
                {paymentStatus === 'confirmed'
                  ? 'Pago realizado'
                  : paymentStatus === 'unconfirmed'
                    ? 'Resultado sin confirmar'
                    : paymentStatus === 'technical-error'
                      ? 'No se pudo completar'
                      : 'Revisa tu transferencia'}
              </h1>
              {paymentStatus === 'idle' && (
                <>
                  <p className="intro">
                    Confirma los datos antes de iniciar el pago simulado.
                  </p>
                  <section className="card transfer-card" aria-label="Detalle de transferencia">
                    <div className="recipient-avatar" aria-hidden="true">MD</div>
                    <h2>{recipient}</h2>
                    <p className="muted">Destinataria</p>
                    <div className="amount">{amountLabel}</div>
                    <p className="muted">Importe fijo de la demo</p>
                    <dl className="transfer-details">
                      <div><dt>Se enviará a</dt><dd>{recipient}</dd></div>
                      <div><dt>Importe</dt><dd>{amountLabel}</dd></div>
                      <div><dt>Moneda</dt><dd>PEN</dd></div>
                    </dl>
                    <button
                      className="button button-primary button-full"
                      type="button"
                      onClick={() => void confirmPayment()}
                    >
                      Confirmar pago
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => navigate('wallet')}
                    >
                      Volver a inicio
                    </button>
                  </section>
                </>
              )}
              {paymentStatus === 'pending' && (
                <p className="status-message" role="status">
                  Procesando la transferencia de demo…
                </p>
              )}
              {paymentStatus === 'confirmed' && payment && (
                <section className="card result-card">
                  <div className="result-icon success" aria-hidden="true">✓</div>
                  <h2>Tu pago fue confirmado</h2>
                  <p>
                    Se simuló el envío de <strong>{amountLabel}</strong> a{' '}
                    <strong>{recipient}</strong>.
                  </p>
                  <div className="reference">
                    <span>Referencia de demo</span>
                    <strong>{payment.reference}</strong>
                  </div>
                  <p className="notice">Este resultado existe solo en esta sesión del navegador.</p>
                  <button
                    className="button button-primary button-full"
                    type="button"
                    onClick={() => navigate('history')}
                  >
                    Ver historial
                  </button>
                </section>
              )}
              {paymentStatus === 'unconfirmed' && (
                <section className="card result-card">
                  <div className="result-icon pending" aria-hidden="true">?</div>
                  <h2>No pudimos confirmar el resultado</h2>
                  <p>
                    La solicitud no tiene una respuesta confirmada. Esto no
                    significa que el pago haya fallado.
                  </p>
                  <p className="notice">
                    No se iniciará otro pago automáticamente. Esta demo no
                    permite consultar el estado en un backend.
                  </p>
                  <button
                    className="button button-secondary button-full"
                    type="button"
                    onClick={() => navigate('wallet')}
                  >
                    Volver a inicio
                  </button>
                </section>
              )}
              {paymentStatus === 'technical-error' && (
                <section className="card result-card">
                  <div className="result-icon error" aria-hidden="true">!</div>
                  <h2>Error técnico</h2>
                  <p role="alert">{paymentError}</p>
                  <p className="notice">
                    No se confirmó un pago ni se generó una referencia.
                  </p>
                  <button
                    className="button button-secondary button-full"
                    type="button"
                    onClick={() => navigate('wallet')}
                  >
                    Volver a inicio
                  </button>
                </section>
              )}
            </>
          )}

          {page === 'history' && (
            <>
              <p className="eyebrow">TU ACTIVIDAD</p>
              <h1>Historial</h1>
              <p className="intro">Pagos exitosos registrados durante esta sesión de demo.</p>
              {historyStatus === 'loading' && (
                <p className="status-message" role="status">Cargando historial…</p>
              )}
              {historyStatus === 'empty' && (
                <section className="card empty-state">
                  <div className="empty-icon" aria-hidden="true">◷</div>
                  <h2>Aún no hay movimientos</h2>
                  <p>Cuando completes un pago simulado exitoso, aparecerá aquí.</p>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => navigate('transfer')}
                  >
                    Hacer una transferencia
                  </button>
                </section>
              )}
              {historyStatus === 'loaded' && (
                <ul className="history-list">
                  {history.map((item) => (
                    <li className="card history-item" key={item.reference}>
                      <div className="history-icon" aria-hidden="true">↗</div>
                      <div className="history-copy">
                        <strong>Pago a {item.recipient}</strong>
                        <span>{new Date(item.createdAt).toLocaleString('es-PE')}</span>
                        <span className="reference-label">{item.reference}</span>
                      </div>
                      <strong className="history-amount">− S/ {(item.amountMinor / 100).toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
              )}
              {historyStatus === 'technical-error' && (
                <section className="card error-state">
                  <h2>No se pudo cargar el historial</h2>
                  <p role="alert">{historyError}</p>
                  <p>Es un problema técnico; no significa que el historial esté vacío.</p>
                </section>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
