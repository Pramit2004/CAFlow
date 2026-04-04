import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles, managerAndAbove } from '../../middleware/rbac.middleware.js'
import {
  listTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from './tasks.controller.js'

export const taskRoutes = new Hono()

taskRoutes.use('*', requireAuth)

taskRoutes.get('/', allRoles, listTasksHandler)
taskRoutes.get('/:id', allRoles, getTaskHandler)
taskRoutes.post('/', allRoles, createTaskHandler)
taskRoutes.patch('/:id', allRoles, updateTaskHandler)
taskRoutes.delete('/:id', managerAndAbove, deleteTaskHandler)
