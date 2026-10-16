import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'
import type {
  CompleteOnboardingResponse,
  OnboardingService,
  OnboardingStatusResponse,
  StartOnboardingResponse,
} from './types/onboarding'

const startResponse: StartOnboardingResponse = {
  requestId: 'opaque-request-id',
  trackingToken: 'ephemeral-tracking-token',
  status: 'OTP_PENDING',
  message: 'Ingresa el código enviado a tu correo.',
}

const verifiedResponse: OnboardingStatusResponse = {
  requestId: startResponse.requestId,
  status: 'OTP_VERIFIED',
  nextStep: 'CREATE_PIN',
  message: null,
}

const activeResponse: CompleteOnboardingResponse = {
  requestId: startResponse.requestId,
  status: 'ACTIVE',
  customer: { firstName: 'Persona', lastName: 'Sintética' },
  wallet: { currency: 'PEN', balanceMinorUnits: 10000 },
}

function createService() {
  const start = vi.fn<OnboardingService['start']>().mockResolvedValue(startResponse)
  const getStatus = vi.fn<OnboardingService['getStatus']>().mockResolvedValue({
    requestId: startResponse.requestId,
    status: 'OTP_PENDING',
    nextStep: 'ENTER_OTP',
    message: null,
  })
  const verifyOtp = vi.fn<OnboardingService['verifyOtp']>().mockResolvedValue(verifiedResponse)
  const complete = vi.fn<OnboardingService['complete']>().mockResolvedValue(activeResponse)
  const service = { start, getStatus, verifyOtp, complete } satisfies OnboardingService
  return { service, start, verifyOtp, complete }
}

function fillAndSubmitData() {
  fireEvent.change(screen.getByLabelText('Número de documento'), {
    target: { value: '00000000' },
  })
  fireEvent.change(screen.getByLabelText('Correo'), {
    target: { value: 'persona@example.test' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
}

async function reachPinStep(service: OnboardingService) {
  render(<App service={service} />)
  fillAndSubmitData()
  await screen.findByRole('heading', { name: 'Verifica tu correo' })
  fireEvent.change(screen.getByLabelText('Código OTP'), {
    target: { value: '1234' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Verificar código' }))
  await screen.findByRole('heading', { name: 'Crea tu PIN' })
}

describe('onboarding screens', () => {
  it('blocks empty or invalid data and gives actionable validation messages', () => {
    const { service, start } = createService()
    render(<App service={service} />)

    fireEvent.change(screen.getByLabelText('Correo'), {
      target: { value: 'correo-invalido' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByText('Ingresa tu número de documento.')).toBeInTheDocument()
    expect(screen.getByText('Revisa el formato de tu correo.')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Progreso del onboarding' })).toHaveAttribute(
      'aria-live',
      'polite',
    )
    const documentNumber = screen.getByLabelText('Número de documento')
    expect(documentNumber).toHaveAttribute('aria-invalid', 'true')
    expect(documentNumber).toHaveAttribute('aria-describedby', 'documentNumber-error')
    expect(screen.getByText('Ingresa tu número de documento.')).toHaveAttribute(
      'role',
      'alert',
    )
    expect(start).not.toHaveBeenCalled()
  })

  it('starts with valid data and only advances to PIN after authoritative OTP verification', async () => {
    const { service, start, verifyOtp } = createService()
    verifyOtp
      .mockResolvedValueOnce({
        requestId: startResponse.requestId,
        status: 'OTP_PENDING',
        nextStep: 'ENTER_OTP',
        message: 'El código no es válido.',
      })
      .mockResolvedValueOnce(verifiedResponse)
    render(<App service={service} />)

    fillAndSubmitData()
    await screen.findByRole('heading', { name: 'Verifica tu correo' })

    expect(start).toHaveBeenCalledWith({
      documentType: 'DNI',
      documentNumber: '00000000',
      email: 'persona@example.test',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Verificar código' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ingresa el código de cuatro dígitos.',
    )
    expect(verifyOtp).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Código OTP'), {
      target: { value: '1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verificar código' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Verifica tu correo' })).toBeInTheDocument(),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('El código no es válido.')

    fireEvent.change(screen.getByLabelText('Código OTP'), {
      target: { value: '9876' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verificar código' }))
    await screen.findByRole('heading', { name: 'Crea tu PIN' })
    expect(verifyOtp).toHaveBeenLastCalledWith(
      startResponse.requestId,
      startResponse.trackingToken,
      '9876',
    )
  })

  it('blocks an invalid PIN and completes only with a four-digit PIN', async () => {
    const { service, complete } = createService()
    await reachPinStep(service)

    expect(
      screen.queryByRole('heading', { name: 'Hola, Persona Sintética' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Completar registro' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Crea un PIN numérico de cuatro dígitos.',
    )
    expect(complete).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('PIN'), {
      target: { value: '2468' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Completar registro' }))
    await screen.findByRole('heading', { name: 'Registro completado' })

    expect(complete).toHaveBeenCalledWith(
      startResponse.requestId,
      startResponse.trackingToken,
      '2468',
    )
    expect(screen.getByRole('heading', { name: 'Hola, Persona Sintética' })).toBeInTheDocument()
    expect(screen.getByText(/S\/ 100.00\s+PEN/)).toBeInTheDocument()
    expect(screen.getByText('Pagos de bajo monto')).toBeInTheDocument()
    expect(screen.getByText('Próximamente. Esta demo no procesa pagos.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pago|transfer|retiro/i })).not.toBeInTheDocument()
  })
})
