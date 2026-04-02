import { eq, and, ilike, or, sql, count, desc, asc } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { cases, tasks, clients, caseDocuments } from '../../db/schema/index.js'
import { NotFoundError } from '../../lib/errors.js'
import type {
  CreateCaseInput, UpdateCaseInput, MoveCaseInput,
  ListCasesQuery, CreateTaskInput, UpdateTaskInput,
} from './cases.schema.js'

// ── List cases ─────────────────────────────────────────────────────────────

export async function listCases(workspaceId: string, query: ListCasesQuery) {
  const { page, limit, status, serviceType, clientId, assignedTo, search, financialYear } = query
  const offset = (page - 1) * limit

  const conditions = [eq(cases.workspaceId, workspaceId)]

  if (status)       conditions.push(eq(cases.status, status))
  if (serviceType)  conditions.push(eq(cases.serviceType, serviceType))
  if (clientId)     conditions.push(eq(cases.clientId, clientId))
  if (assignedTo)   conditions.push(eq(cases.assignedTo, assignedTo))
  if (financialYear) conditions.push(eq(cases.financialYear, financialYear))

  if (search) {
    conditions.push(
      or(
        ilike(cases.title, `%${search}%`),
        ilike(cases.description, `%${search}%`),
      )!,
    )
  }

  const where = and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select({
        case: cases,
        clientName: clients.name,
        clientPhone: clients.phone,
        clientPan: clients.pan,
      })
      .from(cases)
      .leftJoin(clients, eq(cases.clientId, clients.id))
      .where(where)
      .orderBy(asc(cases.deadline), desc(cases.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(cases).where(where),
  ])

  return {
    rows: rows.map(({ case: c, clientName, clientPhone, clientPan }) => ({
      ...c,
      client: { name: clientName, phone: clientPhone, pan: clientPan },
    })),
    total: Number(total),
  }
}

// ── Get all for kanban (no pagination, grouped by status) ──────────────────

export async function getKanbanCases(workspaceId: string, financialYear?: string) {
  const conditions = [eq(cases.workspaceId, workspaceId)]
  if (financialYear) conditions.push(eq(cases.financialYear, financialYear))

  const rows = await db
    .select({
      case: cases,
      clientName: clients.name,
      clientPhone: clients.phone,
      clientEntityType: clients.entityType,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(asc(cases.deadline), desc(cases.createdAt))

  // Enrich with task counts and doc counts in one query
  const caseIds = rows.map((r) => r.case.id)

  let taskCounts: Record<string, { total: number; done: number }> = {}
  let docCounts: Record<string, { pending: number; total: number }> = {}

  if (caseIds.length > 0) {
    const [taskRows, docRows] = await Promise.all([
      db
        .select({
          caseId: tasks.caseId,
          total: count(),
          done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
        })
        .from(tasks)
        .where(sql`${tasks.caseId} = ANY(${sql.raw(`ARRAY[${caseIds.map(id => `'${id}'`).join(',')}]::uuid[]`)})`)
        .groupBy(tasks.caseId),
      db
        .select({
          caseId: caseDocuments.caseId,
          total: count(),
          pending: sql<number>`count(*) filter (where ${caseDocuments.status} = 'PENDING')`,
        })
        .from(caseDocuments)
        .where(sql`${caseDocuments.caseId} = ANY(${sql.raw(`ARRAY[${caseIds.map(id => `'${id}'`).join(',')}]::uuid[]`)})`)
        .groupBy(caseDocuments.caseId),
    ])

    taskCounts = Object.fromEntries(
      taskRows.map((r) => [r.caseId, { total: Number(r.total), done: Number(r.done) }]),
    )
    docCounts = Object.fromEntries(
      docRows.map((r) => [r.caseId, { pending: Number(r.pending), total: Number(r.total) }]),
    )
  }

  const enriched = rows.map(({ case: c, clientName, clientPhone, clientEntityType }) => ({
    ...c,
    client: { name: clientName, phone: clientPhone, entityType: clientEntityType },
    tasks: taskCounts[c.id] ?? { total: 0, done: 0 },
    docs: docCounts[c.id] ?? { pending: 0, total: 0 },
  }))

  // Group by status
  const STATUSES = [
    'DOCUMENTS_PENDING', 'DOCS_RECEIVED', 'UNDER_PREPARATION', 'FILED', 'COMPLETE',
  ] as const

  return Object.fromEntries(
    STATUSES.map((s) => [s, enriched.filter((c) => c.status === s)]),
  )
}

// ── Get single case with enriched data ────────────────────────────────────

export async function getCase(workspaceId: string, caseId: string) {
  const [row] = await db
    .select({
      case: cases,
      clientName: clients.name,
      clientPhone: clients.phone,
      clientPan: clients.pan,
      clientEmail: clients.email,
      clientEntityType: clients.entityType,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(and(eq(cases.id, caseId), eq(cases.workspaceId, workspaceId)))
    .limit(1)

  if (!row) throw new NotFoundError('Case not found')

  const [taskList, docList] = await Promise.all([
    db.select().from(tasks)
      .where(and(eq(tasks.caseId, caseId), eq(tasks.workspaceId, workspaceId)))
      .orderBy(asc(tasks.createdAt)),
    db.select().from(caseDocuments)
      .where(and(eq(caseDocuments.caseId, caseId), eq(caseDocuments.workspaceId, workspaceId)))
      .orderBy(asc(caseDocuments.sortOrder)),
  ])

  return {
    ...row.case,
    client: {
      name: row.clientName,
      phone: row.clientPhone,
      pan: row.clientPan,
      email: row.clientEmail,
      entityType: row.clientEntityType,
    },
    tasks: taskList,
    documents: docList,
  }
}

// ── Create case ────────────────────────────────────────────────────────────

export async function createCase(workspaceId: string, data: CreateCaseInput) {
  const [created] = await db.insert(cases).values({
    workspaceId,
    clientId: data.clientId,
    title: data.title,
    serviceType: data.serviceType,
    financialYear: data.financialYear,
    deadline: data.deadline,
    description: data.description,
    assignedTo: data.assignedTo,
    feeQuoted: data.feeQuoted?.toString(),
    status: 'DOCUMENTS_PENDING',
  }).returning()

  return created
}

// ── Update case ────────────────────────────────────────────────────────────

export async function updateCase(workspaceId: string, caseId: string, data: UpdateCaseInput) {
  await getCase(workspaceId, caseId)

  const completedAt = data.status === 'COMPLETE' ? new Date() : undefined

  const [updated] = await db.update(cases)
    .set({
      ...data,
      feeQuoted:   data.feeQuoted?.toString(),
      feeBilled:   data.feeBilled?.toString(),
      feeReceived: data.feeReceived?.toString(),
      completedAt,
      updatedAt: new Date(),
    })
    .where(and(eq(cases.id, caseId), eq(cases.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ── Move case (kanban drag) ────────────────────────────────────────────────

export async function moveCase(workspaceId: string, caseId: string, data: MoveCaseInput) {
  await getCase(workspaceId, caseId)

  const completedAt = data.status === 'COMPLETE' ? new Date() : sql`NULL`

  const [updated] = await db.update(cases)
    .set({ status: data.status, completedAt: completedAt as any, updatedAt: new Date() })
    .where(and(eq(cases.id, caseId), eq(cases.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ── Delete case ────────────────────────────────────────────────────────────

export async function deleteCase(workspaceId: string, caseId: string) {
  await getCase(workspaceId, caseId)
  await db.delete(cases).where(and(eq(cases.id, caseId), eq(cases.workspaceId, workspaceId)))
}

// ── Tasks CRUD ─────────────────────────────────────────────────────────────

export async function createTask(
  workspaceId: string, caseId: string, data: CreateTaskInput, createdBy: string,
) {
  await getCase(workspaceId, caseId)

  const [task] = await db.insert(tasks).values({
    workspaceId, caseId,
    title: data.title,
    description: data.description,
    type: data.type,
    assignedTo: data.assignedTo,
    dueDate: data.dueDate,
    createdBy,
  }).returning()

  return task
}

export async function updateTask(
  workspaceId: string, caseId: string, taskId: string, data: UpdateTaskInput, userId: string,
) {
  const completedAt = data.status === 'done' ? new Date() : undefined
  const completedBy = data.status === 'done' ? userId : undefined

  const [updated] = await db.update(tasks)
    .set({ ...data, completedAt, completedBy, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.caseId, caseId), eq(tasks.workspaceId, workspaceId)))
    .returning()

  if (!updated) throw new NotFoundError('Task not found')
  return updated
}

export async function deleteTask(workspaceId: string, caseId: string, taskId: string) {
  await db.delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.caseId, caseId), eq(tasks.workspaceId, workspaceId)))
}
