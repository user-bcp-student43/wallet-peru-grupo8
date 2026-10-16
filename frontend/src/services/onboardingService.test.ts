import { afterEach, describe, expect, it, vi } from 'vitest'
import { createOnboardingService } from './onboardingService'

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('onboarding API client', () => {
  it('sends typed requests and follows authoritative response states', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            requestId: 'opaque-id',
            trackingToken: 'temporary-token',
            status: 'OTP_PENDING',
            message: 'Ingresa el código enviado a tu correo.',
          },
          202,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            requestId: 'opaque-id',
            status: 'OTP_PENDING',
            nextStep: 'ENTER_OTP',
            message: null,
          },
          200,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { requestId: 'opaque-id', status: 'OTP_VERIFIED' },
          200,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            requestId: 'opaque-id',
            status: 'ACTIVE',
            customer: { firstName: 'Persona', lastName: 'Sintética' },
            wallet: { currency: 'PEN', balanceMinorUnits: 10000 },
          },
          201,
        ),
      )
    vi.stubGlobal('fetch', fetchMock)
    const service = createOnboardingService('http://api.test/api/v1/')

    const started = await service.start({
      documentType: 'PASSPORT',
      documentNumber: 'P0000001',
      email: 'persona@example.test',
    })
    expect(started.status).toBe('OTP_PENDING')
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/onboarding-requests')
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST')
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      JSON.stringify({
        documentType: 'PASSPORT',
        documentNumber: 'P0000001',
        email: 'persona@example.test',
      }),
    )
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Authorization')).toBeNull()

    const pending = await service.getStatus(started.requestId, started.trackingToken)
    expect(pending.status).toBe('OTP_PENDING')
    expect(fetchMock.mock.calls[1][0]).toBe(
      'http://api.test/api/v1/onboarding-requests/opaque-id/status',
    )
    expect(new Headers(fetchMock.mock.calls[1][1]?.headers).get('Authorization')).toBe(
      'Bearer temporary-token',
    )

    const verified = await service.verifyOtp(
      started.requestId,
      started.trackingToken,
      '1234',
    )
    expect(verified.status).toBe('OTP_VERIFIED')
    expect(verified.nextStep).toBe('CREATE_PIN')
    expect(fetchMock.mock.calls[2][0]).toBe(
      'http://api.test/api/v1/onboarding-requests/opaque-id/otp/verify',
    )
    expect(fetchMock.mock.calls[2][1]?.body).toBe(JSON.stringify({ code: '1234' }))

    const completed = await service.complete(
      started.requestId,
      started.trackingToken,
      '2468',
    )
    expect(completed.wallet.balanceMinorUnits).toBe(10000)
    expect(fetchMock.mock.calls[3][0]).toBe(
      'http://api.test/api/v1/onboarding-requests/opaque-id/complete',
    )
    expect(fetchMock.mock.calls[3][1]?.body).toBe(JSON.stringify({ pin: '2468' }))
    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).not.toContain('temporary-token')
    }
  })

  it('maps API errors to safe messages without echoing backend text', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        { code: 'INVALID_OTP', message: 'El código 1234 no coincide.' },
        422,
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const service = createOnboardingService('http://api.test/api/v1')

    const error = await service
      .verifyOtp('opaque-id', 'temporary-token', '1234')
      .catch((caught: unknown) => caught)
    expect(error).toMatchObject({
      name: 'OnboardingServiceError',
      code: 'INVALID_OTP',
      message: 'El código no es válido o venció. Revisa el código e inténtalo nuevamente.',
    })
    if (error instanceof Error) {
      expect(error.message).not.toContain('1234')
      expect(error.message).not.toContain('no coincide')
    }
  })

  it('rejects malformed successful responses instead of fabricating a state', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        {
          requestId: 'opaque-id',
          status: 'OTP_PENDING',
        },
        200,
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const service = createOnboardingService('http://api.test/api/v1')

    await expect(
      service.verifyOtp('opaque-id', 'temporary-token', '1234'),
    ).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })

  it('rejects an authoritative status that belongs to a different request', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        {
          requestId: 'different-id',
          status: 'OTP_VERIFIED',
          nextStep: 'CREATE_PIN',
          message: null,
        },
        200,
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const service = createOnboardingService('http://api.test/api/v1')

    await expect(
      service.getStatus('expected-id', 'temporary-token'),
    ).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })

  it('rejects a completion balance that differs from the approved demo credit', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        {
          requestId: 'opaque-id',
          status: 'ACTIVE',
          customer: { firstName: 'Persona', lastName: 'Sintética' },
          wallet: { currency: 'PEN', balanceMinorUnits: 20000 },
        },
        201,
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const service = createOnboardingService('http://api.test/api/v1')

    await expect(
      service.complete('opaque-id', 'temporary-token', '2468'),
    ).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })
})
