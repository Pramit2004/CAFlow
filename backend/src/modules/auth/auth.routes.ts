import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { handleSendOtp, handleVerifyOtp, handleOnboarding, handleGetMe } from './auth.controller.js'

export const authRoutes = new Hono()

// Public
authRoutes.post('/send-otp', handleSendOtp)
authRoutes.post('/verify-otp', handleVerifyOtp)
authRoutes.post('/onboarding', handleOnboarding)

// Protected
authRoutes.get('/me', authMiddleware, handleGetMe)
