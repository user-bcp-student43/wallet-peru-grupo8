// Propuesta local para la demo; no es un contrato backend aprobado.
export type DemoOperation = 'activation' | 'payment' | 'history'

export type TechnicalErrorKind = 'timeout' | 'unavailable' | 'unexpected'

export interface WalletDemoErrorDetails {
  operation: DemoOperation
  kind: TechnicalErrorKind
}

export interface DemoPayment {
  reference: string
  recipient: 'María Demo'
  amountMinor: 500
  currency: 'PEN'
  createdAt: string
}

export type PaymentResult =
  | { status: 'confirmed'; payment: DemoPayment }
  | { status: 'unconfirmed' }

export type ActivationStatus =
  | 'idle'
  | 'pending'
  | 'active'
  | 'technical-error'

export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'confirmed'
  | 'unconfirmed'
  | 'technical-error'

export type HistoryStatus =
  | 'idle'
  | 'loading'
  | 'empty'
  | 'loaded'
  | 'technical-error'
