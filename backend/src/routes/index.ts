import { Hono } from 'hono'
import { authRoutes } from '../modules/auth/auth.routes.js'
import { workspaceRoutes } from '../modules/workspace/workspace.routes.js'
import { clientRoutes } from '../modules/clients/clients.routes.js'
import { caseRoutes } from '../modules/cases/cases.routes.js'
import { documentRoutes } from '../modules/documents/documents.routes.js'
import { taskRoutes } from '../modules/tasks/tasks.routes.js'
import { invoiceRoutes } from '../modules/invoices/invoices.routes.js'
import { portalRoutes } from '../modules/portal/portal.routes.js'
import { notificationRoutes } from '../modules/notifications/notifications.routes.js'
import { deadlineRoutes } from '../modules/deadlines/deadlines.routes.js'

export const router = new Hono()

router.route('/auth', authRoutes)
router.route('/workspaces', workspaceRoutes)
router.route('/clients', clientRoutes)
router.route('/cases', caseRoutes)
router.route('/documents', documentRoutes)
router.route('/tasks', taskRoutes)
router.route('/invoices', invoiceRoutes)
router.route('/portal', portalRoutes)
router.route('/notifications', notificationRoutes)
router.route('/deadlines', deadlineRoutes)
