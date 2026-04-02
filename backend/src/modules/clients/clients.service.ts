import { eq, and, ilike, or, sql, count, desc, inArray } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { clients, cases, caseDocuments } from '../../db/schema/index.js'
import { NotFoundError, ConflictError, PlanLimitError } from '../../lib/errors.js'
import { PLAN_LIMITS } from '../../config/constants.js'
import type { CreateClientInput, UpdateClientInput, ListClientsQuery } from './clients.schema.js'

// ──────────────────────────────────────────────────
// List clients with search + pagination
// ──────────────────────────────────────────────────
export async function listClients(workspaceId: string, query: ListClientsQuery) {
  const { page, limit, search, tag, assignedTo, city } = query
  const offset = (page - 1) * limit

  const conditions = [eq(clients.workspaceId, workspaceId), eq(clients.isActive, 'true')]

  if (search) {
    conditions.push(
      or(
        ilike(clients.name, `%${search}%`),
        ilike(clients.phone, `%${search}%`),
        ilike(clients.pan, `%${search}%`),
        ilike(clients.email, `%${search}%`),
        ilike(clients.businessName, `%${search}%`),
      )!,
    )
  }

  if (assignedTo) {
    conditions.push(eq(clients.assignedTo, assignedTo))
  }

  if (city) {
    conditions.push(ilike(clients.city, `%${city}%`))
  }

  if (tag) {
    conditions.push(sql`${clients.tags} @> ARRAY[${tag}]::text[]`)
  }

  const where = and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(where)
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(clients).where(where),
  ])

  return { rows, total: Number(total) }
}

// ──────────────────────────────────────────────────
// Get single client with case stats
// ──────────────────────────────────────────────────
export async function getClient(workspaceId: string, clientId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
    .limit(1)

  if (!client) throw new NotFoundError('Client not found')
  return client
}

// ──────────────────────────────────────────────────
// Get client with enriched stats (for detail page)
// ──────────────────────────────────────────────────
export async function getClientWithStats(workspaceId: string, clientId: string) {
  const client = await getClient(workspaceId, clientId)

  const [casesResult, docsResult] = await Promise.all([
    db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${cases.status} != 'COMPLETE')`,
        complete: sql<number>`count(*) filter (where ${cases.status} = 'COMPLETE')`,
        totalFeeQuoted: sql<string>`coalesce(sum(${cases.feeQuoted}), 0)`,
        totalFeeReceived: sql<string>`coalesce(sum(${cases.feeReceived}), 0)`,
      })
      .from(cases)
      .where(and(eq(cases.clientId, clientId), eq(cases.workspaceId, workspaceId))),
    db
      .select({
        pending: sql<number>`count(*) filter (where ${caseDocuments.status} = 'PENDING')`,
        uploaded: sql<number>`count(*) filter (where ${caseDocuments.status} IN ('UPLOADED', 'ACCEPTED'))`,
      })
      .from(caseDocuments)
      .innerJoin(cases, eq(caseDocuments.caseId, cases.id))
      .where(and(eq(cases.clientId, clientId), eq(caseDocuments.workspaceId, workspaceId))),
  ])

  const caseStats = casesResult[0]
  const docStats = docsResult[0]

  return {
    ...client,
    stats: {
      totalCases: Number(caseStats?.total ?? 0),
      activeCases: Number(caseStats?.active ?? 0),
      completedCases: Number(caseStats?.complete ?? 0),
      totalFeeQuoted: Number(caseStats?.totalFeeQuoted ?? 0),
      totalFeeReceived: Number(caseStats?.totalFeeReceived ?? 0),
      pendingDocs: Number(docStats?.pending ?? 0),
      uploadedDocs: Number(docStats?.uploaded ?? 0),
    },
  }
}

// ──────────────────────────────────────────────────
// Create client with plan limit enforcement
// ──────────────────────────────────────────────────
export async function createClient(
  workspaceId: string,
  data: CreateClientInput,
  workspacePlan: string,
) {
  // Plan limit check
  const [{ value: currentCount }] = await db
    .select({ value: count() })
    .from(clients)
    .where(and(eq(clients.workspaceId, workspaceId), eq(clients.isActive, 'true')))

  const limit = PLAN_LIMITS[workspacePlan as keyof typeof PLAN_LIMITS]?.clients ?? 50
  if (Number(currentCount) >= limit) {
    throw new PlanLimitError(`Your plan allows up to ${limit} active clients. Upgrade to add more.`)
  }

  // Duplicate phone check within workspace
  if (data.phone) {
    const existing = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.workspaceId, workspaceId), eq(clients.phone, data.phone), eq(clients.isActive, 'true')))
      .limit(1)

    if (existing.length > 0) {
      throw new ConflictError('A client with this phone number already exists')
    }
  }

  const [created] = await db
    .insert(clients)
    .values({
      workspaceId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      pan: data.pan?.toUpperCase(),
      aadhaarLast4: data.aadhaarLast4,
      gstin: data.gstin?.toUpperCase(),
      dob: data.dob,
      entityType: data.entityType,
      businessName: data.businessName,
      spousePan: data.spousePan?.toUpperCase(),
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      preferredLanguage: data.preferredLanguage,
      assignedTo: data.assignedTo,
      tags: data.tags,
      notes: data.notes,
      clientSince: new Date().toISOString().split('T')[0],
    })
    .returning()

  return created
}

// ──────────────────────────────────────────────────
// Update client
// ──────────────────────────────────────────────────
export async function updateClient(
  workspaceId: string,
  clientId: string,
  data: UpdateClientInput,
) {
  await getClient(workspaceId, clientId) // ensure exists + ownership

  const [updated] = await db
    .update(clients)
    .set({
      ...data,
      pan: data.pan?.toUpperCase(),
      gstin: data.gstin?.toUpperCase(),
      spousePan: data.spousePan?.toUpperCase(),
      updatedAt: new Date(),
    })
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
    .returning()

  return updated
}

// ──────────────────────────────────────────────────
// Soft delete client
// ──────────────────────────────────────────────────
export async function deleteClient(workspaceId: string, clientId: string) {
  await getClient(workspaceId, clientId) // ensure exists + ownership

  await db
    .update(clients)
    .set({ isActive: 'false', updatedAt: new Date() })
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
}

// ──────────────────────────────────────────────────
// Get cases for a client (for detail page)
// ──────────────────────────────────────────────────
export async function getClientCases(workspaceId: string, clientId: string) {
  await getClient(workspaceId, clientId)

  return db
    .select()
    .from(cases)
    .where(and(eq(cases.clientId, clientId), eq(cases.workspaceId, workspaceId)))
    .orderBy(desc(cases.createdAt))
}

// ──────────────────────────────────────────────────
// Export clients as CSV data
// ──────────────────────────────────────────────────
export async function exportClientsCSV(workspaceId: string) {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.workspaceId, workspaceId), eq(clients.isActive, 'true')))
    .orderBy(clients.name)

  const headers = [
    'Name', 'Phone', 'Email', 'PAN', 'GSTIN', 'Entity Type',
    'Business Name', 'City', 'State', 'Language', 'Tags', 'Client Since',
  ]

  const csvRows = rows.map((c) => [
    c.name,
    c.phone,
    c.email ?? '',
    c.pan ?? '',
    c.gstin ?? '',
    c.entityType ?? '',
    c.businessName ?? '',
    c.city ?? '',
    c.state ?? '',
    c.preferredLanguage,
    (c.tags ?? []).join('; '),
    c.clientSince ?? '',
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))

  return [headers.join(','), ...csvRows].join('\n')
}
