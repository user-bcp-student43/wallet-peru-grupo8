import type {
  DemoPayment,
  WalletDemoErrorDetails,
  PaymentResult,
} from '../types/walletDemo'

export interface WalletDemoService {
  activate(alias: string): Promise<void>
  pay(): Promise<PaymentResult>
  getHistory(): Promise<DemoPayment[]>
}

export class WalletDemoServiceError extends Error {
  readonly details: WalletDemoErrorDetails

  constructor(details: WalletDemoErrorDetails, message: string) {
    super(message)
    this.name = 'WalletDemoServiceError'
    this.details = details
  }
}

export function isWalletDemoServiceError(
  error: unknown,
): error is WalletDemoServiceError {
  if (!(error instanceof Error) || error.name !== 'WalletDemoServiceError') {
    return false
  }
  if (!('details' in error) || typeof error.details !== 'object' || error.details === null) {
    return false
  }
  return (
    'operation' in error.details &&
    ['activation', 'payment', 'history'].includes(String(error.details.operation)) &&
    'kind' in error.details &&
    ['timeout', 'unavailable', 'unexpected'].includes(String(error.details.kind))
  )
}

export function isValidDemoAlias(alias: string): boolean {
  return /^[A-Za-z0-9_]{3,20}$/.exec(alias)?.[0] === alias
}

export function createWalletDemoService(): WalletDemoService {
  let activated = false
  let nextReference = 1
  const payments: DemoPayment[] = []

  return {
    async activate(alias) {
      if (!isValidDemoAlias(alias)) {
        throw new WalletDemoServiceError(
          { operation: 'activation', kind: 'unexpected' },
          'No se pudo activar la wallet de demo.',
        )
      }
      activated = true
    },

    async pay() {
      if (!activated) {
        throw new WalletDemoServiceError(
          { operation: 'payment', kind: 'unexpected' },
          'La wallet de demo todavía no está activa.',
        )
      }

      const payment: DemoPayment = {
        reference: `DEMO-${String(nextReference++).padStart(6, '0')}`,
        recipient: 'María Demo',
        amountMinor: 500,
        currency: 'PEN',
        createdAt: new Date().toISOString(),
      }
      payments.push(payment)
      return { status: 'confirmed', payment }
    },

    async getHistory() {
      if (!activated) {
        throw new WalletDemoServiceError(
          { operation: 'history', kind: 'unexpected' },
          'La wallet de demo todavía no está activa.',
        )
      }
      return payments.map((payment) => ({ ...payment }))
    },
  }
}
