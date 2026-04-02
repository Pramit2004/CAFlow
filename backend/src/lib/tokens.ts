import { randomBytes } from 'crypto'
import { TOKEN_EXPIRY } from '../config/constants.js'

export type TokenPurpose = 'upload' | 'download' | 'onboarding'

export const generateToken = (length = 32): string => {
  return randomBytes(length).toString('hex')
}

export const getTokenExpiry = (purpose: TokenPurpose): Date => {
  const expirySeconds = {
    upload: TOKEN_EXPIRY.DOCUMENT_REQUEST,
    download: TOKEN_EXPIRY.DOCUMENT_DOWNLOAD,
    onboarding: TOKEN_EXPIRY.CLIENT_ONBOARDING,
  }[purpose]

  return new Date(Date.now() + expirySeconds * 1000)
}

export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt)
}
