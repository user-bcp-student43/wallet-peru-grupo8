export type DocumentType = 'DNI' | 'PASSPORT'

export type OnboardingStatus = 'OTP_PENDING' | 'OTP_VERIFIED' | 'ACTIVE'

export interface StartOnboardingInput {
  documentType: DocumentType
  documentNumber: string
  email: string
}

export interface StartOnboardingResponse {
  requestId: string
  trackingToken: string
  status: 'OTP_PENDING'
  message: string
}

export interface OnboardingStatusResponse {
  requestId: string
  status: 'OTP_PENDING' | 'OTP_VERIFIED'
  nextStep: 'ENTER_OTP' | 'CREATE_PIN'
  message: string | null
}

export interface CompleteOnboardingResponse {
  requestId: string
  status: 'ACTIVE'
  customer: {
    firstName: string
    lastName: string
  }
  wallet: {
    currency: 'PEN'
    balanceMinorUnits: number
  }
}

export interface OnboardingService {
  start(input: StartOnboardingInput): Promise<StartOnboardingResponse>
  getStatus(
    requestId: string,
    trackingToken: string,
  ): Promise<OnboardingStatusResponse>
  verifyOtp(
    requestId: string,
    trackingToken: string,
    code: string,
  ): Promise<OnboardingStatusResponse>
  complete(
    requestId: string,
    trackingToken: string,
    pin: string,
  ): Promise<CompleteOnboardingResponse>
}
