import { eq, and, desc, count } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { tasks } from '../../db/schema/index.js'
import { NotFoundError } from '../../lib/errors.js'
import type { CreateTaskInput, UpdateTaskInput, ListTasksQuery } from './tasks.schema.js'

// ──────────────────────────────────────────────────
// List tasks with filters
// ──────────────────────────────────────────────────
export async function listTasks(workspaceId: string, query: ListTasksQuery) {
  const { page, limit, caseId, assignedTo, status } = query
  const offset = (page - 1) * limit

  const conditions: ReturnType<typeof eq>[] = [eq(tasks.workspaceId, workspaceId)]
  if (caseId) conditions.push(eq(tasks.caseId, caseId))
  if (assignedTo) conditions.push(eq(tasks.assignedTo, assignedTo))
  if (status) conditions.push(eq(tasks.status, status))

  const where = and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db.select().from(tasks).where(where).orderBy(desc(tasks.createdAt)).limit(limit).offset(offset),
    db.select({ value: count() }).from(tasks).where(where),
  ])

  return { rows, total: Number(total) }
}

// ──────────────────────────────────────────────────
// Get single task
// ──────────────────────────────────────────────────
export async function getTask(workspaceId: string, taskId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .limit(1)

  if (!task) throw new NotFoundError('Task')
  return task
}

// ──────────────────────────────────────────────────
// Create task
// ──────────────────────────────────────────────────
export async function createTask(workspaceId: string, userId: string, data: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({
      workspaceId,
      caseId: data.caseId,
      title: data.title,
      description: data.description,
      type: data.type,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      createdBy: userId,
    })
    .returning()

  return task
}

// ──────────────────────────────────────────────────
// Update task
// ──────────────────────────────────────────────────
export async function updateTask(workspaceId: string, taskId: string, data: UpdateTaskInput) {
  await getTask(workspaceId, taskId)

  let completedFields: { completedAt?: Date | null } = {}
  if (data.status === 'done') {
    completedFields = { completedAt: new Date() }
  } else if (data.status) {
    completedFields = { completedAt: null }
  }

  const [updated] = await db
    .update(tasks)
    .set({ ...data, ...completedFields, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ──────────────────────────────────────────────────
// Delete task
// ──────────────────────────────────────────────────
export async function deleteTask(workspaceId: string, taskId: string) {
  await getTask(workspaceId, taskId)
  await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)))
}
