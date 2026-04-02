import { Hono } from 'hono'
import {
  getPortalDataHandler,
  portalPresignUploadHandler,
  portalConfirmUploadHandler,
  portalDownloadUrlHandler,
} from './portal.controller.js'

// No auth middleware — token IS the auth
export const portalRoutes = new Hono()

portalRoutes.get('/:token',                          getPortalDataHandler)
portalRoutes.post('/:token/presign',                 portalPresignUploadHandler)
portalRoutes.post('/:token/confirm',                 portalConfirmUploadHandler)
portalRoutes.get('/:token/download/:documentId',     portalDownloadUrlHandler)

