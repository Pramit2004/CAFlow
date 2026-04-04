import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles, managerAndAbove } from '../../middleware/rbac.middleware.js'
import {
  listInvoicesHandler,
  getInvoiceHandler,
  createInvoiceHandler,
  updateInvoiceHandler,
  deleteInvoiceHandler,
} from './invoices.controller.js'

export const invoiceRoutes = new Hono()

invoiceRoutes.use('*', requireAuth)

invoiceRoutes.get('/', allRoles, listInvoicesHandler)
invoiceRoutes.get('/:id', allRoles, getInvoiceHandler)
invoiceRoutes.post('/', managerAndAbove, createInvoiceHandler)
invoiceRoutes.patch('/:id', managerAndAbove, updateInvoiceHandler)
invoiceRoutes.delete('/:id', managerAndAbove, deleteInvoiceHandler)
