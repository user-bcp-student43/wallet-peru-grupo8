import type {
  CompleteOnboardingResponse,
  OnboardingService,
  OnboardingStatusResponse,
  StartOnboardingInput,
  StartOnboardingResponse,
} from '../types/onboarding'

type ServiceErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'REQUEST_NOT_FOUND'
  | 'INVALID_STATE'
  | 'ONBOARDING_NOT_COMPLETABLE'
  | 'INVALID_OTP'
  | 'ATTEMPTS_EXHAUSTED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'

const errorMessages: Record<ServiceErrorCode, string> = {
  INVALID_INPUT: 'Revisa los datos ingresados.',
  UNAUTHORIZED: 'La solicitud venció o no está disponible. Inicia nuevamente.',
  REQUEST_NOT_FOUND: 'No se encontró una solicitud disponible.',
  INVALID_STATE: 'La solicitud no puede continuar desde este paso.',
  ONBOARDING_NOT_COMPLETABLE: 'No se pudo completar el registro.',
  INVALID_OTP: 'El código no es válido o venció. Revisa el código e inténtalo nuevamente.',
  ATTEMPTS_EXHAUSTED: 'Agotaste tus intentos permitidos.',
  INTERNAL_ERROR: 'No se pudo completar la solicitud. Inténtalo nuevamente.',
  NETWORK_ERROR: 'No se pudo conectar con el servicio. Revisa tu conexión e inténtalo nuevamente.',
  INVALID_RESPONSE: 'El servicio devolvió una respuesta que no se pudo procesar.',
}

export class OnboardingServiceError extends Error {
  readonly code: ServiceErrorCode

  constructor(code: ServiceErrorCode) {
    super(errorMessages[code])
    this.name = 'OnboardingServiceError'
    this.code = code
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isStatusResponse(value: unknown): value is OnboardingStatusResponse {
  if (!isRecord(value)) return false
  if (!hasNonEmptyString(value.requestId)) return false
  if (value.status !== 'OTP_PENDING' && value.status !== 'OTP_VERIFIED') return false
  if (value.nextStep !== 'ENTER_OTP' && value.nextStep !== 'CREATE_PIN') return false
  if (value.message !== null && typeof value.message !== 'string') return false
  return (
    (value.status === 'OTP_PENDING' && value.nextStep === 'ENTER_OTP') ||
    (value.status === 'OTP_VERIFIED' && value.nextStep === 'CREATE_PIN')
  )
}

function parseStartResponse(value: unknown): StartOnboardingResponse {
  if (
    !isRecord(value) ||
    !hasNonEmptyString(value.requestId) ||
    !hasNonEmptyString(value.trackingToken) ||
    value.status !== 'OTP_PENDING' ||
    typeof value.message !== 'string'
  ) {
    throw new OnboardingServiceError('INVALID_RESPONSE')
  }
  return {
    requestId: value.requestId,
    trackingToken: value.trackingToken,
    status: value.status,
    message: value.message,
  }
}

function parseStatusResponse(value: unknown): OnboardingStatusResponse {
  if (!isStatusResponse(value)) throw new OnboardingServiceError('INVALID_RESPONSE')
  return {
    requestId: value.requestId,
    status: value.status,
    nextStep: value.nextStep,
    message: value.message,
  }
}

function parseCompletionResponse(value: unknown): CompleteOnboardingResponse {
  if (
    !isRecord(value) ||
    !hasNonEmptyString(value.requestId) ||
    value.status !== 'ACTIVE' ||
    !isRecord(value.customer) ||
    !hasNonEmptyString(value.customer.firstName) ||
    !hasNonEmptyString(value.customer.lastName) ||
    !isRecord(value.wallet) ||
    value.wallet.currency !== 'PEN' ||
    typeof value.wallet.balanceMinorUnits !== 'number' ||
    !Number.isSafeInteger(value.wallet.balanceMinorUnits) ||
    value.wallet.balanceMinorUnits !== 10000
  ) {
    throw new OnboardingServiceError('INVALID_RESPONSE')
  }
  return {
    requestId: value.requestId,
    status: value.status,
    customer: {
      firstName: value.customer.firstName,
      lastName: value.customer.lastName,
    },
    wallet: {
      currency: value.wallet.currency,
      balanceMinorUnits: value.wallet.balanceMinorUnits,
    },
  }
}

function mapErrorCode(value: unknown): ServiceErrorCode {
  if (!isRecord(value)) return 'INTERNAL_ERROR'
  switch (value.code) {
    case 'INVALID_INPUT':
    case 'UNAUTHORIZED':
    case 'REQUEST_NOT_FOUND':
    case 'INVALID_STATE':
    case 'ONBOARDING_NOT_COMPLETABLE':
    case 'INVALID_OTP':
    case 'ATTEMPTS_EXHAUSTED':
      return value.code
    default:
      return 'INTERNAL_ERROR'
  }
}

async function readResponse(response: Response, expectedStatus: number): Promise<unknown> {
  if (response.status !== expectedStatus) {
    let errorBody: unknown
    try {
      errorBody = await response.json()
    } catch {
      throw new OnboardingServiceError('INTERNAL_ERROR')
    }
    throw new OnboardingServiceError(mapErrorCode(errorBody))
  }

  try {
    return await response.json()
  } catch {
    throw new OnboardingServiceError('INVALID_RESPONSE')
  }
}

export function createOnboardingService(
  baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
): OnboardingService {
  const apiBase = baseUrl.replace(/\/+$/, '')

  async function request(
    path: string,
    init: RequestInit,
    expectedStatus: number,
  ): Promise<unknown> {
    let response: Response
    try {
      const headers = new Headers(init.headers)
      headers.set('Accept', 'application/json')
      response = await fetch(`${apiBase}${path}`, {
        ...init,
        headers,
      })
    } catch {
      throw new OnboardingServiceError('NETWORK_ERROR')
    }
    return readResponse(response, expectedStatus)
  }

  function authorizedHeaders(trackingToken: string): HeadersInit {
    return { Authorization: `Bearer ${trackingToken}` }
  }

  return {
    async start(input: StartOnboardingInput) {
      const response = await request(
        '/onboarding-requests',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
        202,
      )
      return parseStartResponse(response)
    },

    async getStatus(requestId, trackingToken) {
      const response = await request(
        `/onboarding-requests/${encodeURIComponent(requestId)}/status`,
        {
          method: 'GET',
          headers: authorizedHeaders(trackingToken),
        },
        200,
      )
      const status = parseStatusResponse(response)
      if (status.requestId !== requestId) {
        throw new OnboardingServiceError('INVALID_RESPONSE')
      }
      return status
    },

    async verifyOtp(requestId, trackingToken, code) {
      const response = await request(
        `/onboarding-requests/${encodeURIComponent(requestId)}/otp/verify`,
        {
          method: 'POST',
          headers: {
            ...authorizedHeaders(trackingToken),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        },
        200,
      )
      if (
        !isRecord(response) ||
        !hasNonEmptyString(response.requestId) ||
        response.requestId !== requestId ||
        response.status !== 'OTP_VERIFIED'
      ) {
        throw new OnboardingServiceError('INVALID_RESPONSE')
      }
      return {
        requestId: response.requestId,
        status: 'OTP_VERIFIED',
        nextStep: 'CREATE_PIN',
        message: null,
      }
    },

    async complete(requestId, trackingToken, pin) {
      const response = await request(
        `/onboarding-requests/${encodeURIComponent(requestId)}/complete`,
        {
          method: 'POST',
          headers: {
            ...authorizedHeaders(trackingToken),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pin }),
        },
        201,
      )
      const completed = parseCompletionResponse(response)
      if (completed.requestId !== requestId) {
        throw new OnboardingServiceError('INVALID_RESPONSE')
      }
      return completed
    },
  }
}
