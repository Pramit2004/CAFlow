import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles, managerAndAbove } from '../../middleware/rbac.middleware.js'
import {
  listClientsHandler,
  getClientHandler,
  createClientHandler,
  updateClientHandler,
  deleteClientHandler,
  getClientCasesHandler,
  exportClientsHandler,
} from './clients.controller.js'

export const clientRoutes = new Hono()

// All routes require auth
clientRoutes.use('*', requireAuth)

// Listing + reading — all roles
clientRoutes.get('/', allRoles, listClientsHandler)
clientRoutes.get('/export/csv', managerAndAbove, exportClientsHandler)
clientRoutes.get('/:id', allRoles, getClientHandler)
clientRoutes.get('/:id/cases', allRoles, getClientCasesHandler)

// Mutations — manager and above
clientRoutes.post('/', managerAndAbove, createClientHandler)
clientRoutes.patch('/:id', managerAndAbove, updateClientHandler)
clientRoutes.delete('/:id', managerAndAbove, deleteClientHandler)
