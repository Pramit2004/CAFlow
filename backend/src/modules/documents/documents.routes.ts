import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles, managerAndAbove } from '../../middleware/rbac.middleware.js'
import {
  getCaseDocumentsHandler, addDocumentSlotsHandler,
  requestPresignedUploadHandler, confirmUploadHandler,
  getDownloadUrlHandler, reviewDocumentHandler,
  deleteDocumentSlotHandler, generatePortalTokenHandler,
  getDocumentInboxHandler,
} from './documents.controller.js'

export const documentRoutes = new Hono()

documentRoutes.use('*', requireAuth)

// Inbox
documentRoutes.get('/inbox',                         allRoles,        getDocumentInboxHandler)

// Portal token generation
documentRoutes.post('/portal-token',                 managerAndAbove, generatePortalTokenHandler)

// Case documents
documentRoutes.get('/cases/:caseId',                 allRoles,        getCaseDocumentsHandler)
documentRoutes.post('/cases/:caseId/slots',          managerAndAbove, addDocumentSlotsHandler)

// Individual document actions
documentRoutes.post('/:id/presign-upload',           allRoles,        requestPresignedUploadHandler)
documentRoutes.post('/:id/confirm-upload',           allRoles,        confirmUploadHandler)
documentRoutes.get('/:id/download-url',              allRoles,        getDownloadUrlHandler)
documentRoutes.post('/:id/review',                   managerAndAbove, reviewDocumentHandler)
documentRoutes.delete('/:id',                        managerAndAbove, deleteDocumentSlotHandler)

