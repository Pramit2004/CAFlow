import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles, managerAndAbove } from '../../middleware/rbac.middleware.js'
import {
  listCasesHandler, getKanbanHandler, getCaseHandler,
  createCaseHandler, updateCaseHandler, moveCaseHandler, deleteCaseHandler,
  createTaskHandler, updateTaskHandler, deleteTaskHandler,
} from './cases.controller.js'

export const caseRoutes = new Hono()

caseRoutes.use('*', requireAuth)

// Cases
caseRoutes.get('/',           allRoles,         listCasesHandler)
caseRoutes.get('/kanban',     allRoles,         getKanbanHandler)
caseRoutes.get('/:id',        allRoles,         getCaseHandler)
caseRoutes.post('/',          managerAndAbove,  createCaseHandler)
caseRoutes.patch('/:id',      managerAndAbove,  updateCaseHandler)
caseRoutes.patch('/:id/move', allRoles,         moveCaseHandler)
caseRoutes.delete('/:id',     managerAndAbove,  deleteCaseHandler)

// Tasks (nested under case)
caseRoutes.post('/:id/tasks',             allRoles, createTaskHandler)
caseRoutes.patch('/:id/tasks/:taskId',    allRoles, updateTaskHandler)
caseRoutes.delete('/:id/tasks/:taskId',   allRoles, deleteTaskHandler)
