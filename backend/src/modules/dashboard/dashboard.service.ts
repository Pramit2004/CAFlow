import { eq, and, sql, count, desc, lt, gte, lte } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { clients, cases, tasks, caseDocuments } from '../../db/schema/index.js'

export async function getDashboardData(workspaceId: string, userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)
  const in30Str = in30.toISOString().split('T')[0]

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // All stats in parallel
  const [
    clientCount,
    activeCaseCount,
    pendingDocsCount,
    overdueCount,
    newClientsThisMonth,
    upcomingDeadlines,
    myTasks,
    feeStats,
  ] = await Promise.all([
    // Active clients
    db.select({ value: count() }).from(clients)
      .where(and(eq(clients.workspaceId, workspaceId), eq(clients.isActive, 'true'))),

    // Active cases (not complete)
    db.select({ value: count() }).from(cases)
      .where(and(eq(cases.workspaceId, workspaceId), sql`${cases.status} != 'COMPLETE'`)),

    // Pending documents
    db.select({ value: count() }).from(caseDocuments)
      .where(and(eq(caseDocuments.workspaceId, workspaceId), eq(caseDocuments.status, 'PENDING'))),

    // Overdue cases
    db.select({ value: count() }).from(cases)
      .where(and(
        eq(cases.workspaceId, workspaceId),
        sql`${cases.deadline} IS NOT NULL`,
        sql`${cases.deadline} < ${todayStr}`,
        sql`${cases.status} != 'COMPLETE'`,
      )),

    // New clients this month
    db.select({ value: count() }).from(clients)
      .where(and(
        eq(clients.workspaceId, workspaceId),
        gte(clients.createdAt, monthStart),
      )),

    // Upcoming deadlines with client name
    db.execute(sql`
      SELECT
        c.id,
        c.title,
        c.service_type,
        c.status,
        c.deadline,
        c.fee_quoted,
        cl.name AS client_name,
        (c.deadline::date - CURRENT_DATE) AS days_left
      FROM cases c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.workspace_id = ${workspaceId}
        AND c.deadline IS NOT NULL
        AND c.deadline >= ${todayStr}
        AND c.deadline <= ${in30Str}
        AND c.status != 'COMPLETE'
      ORDER BY c.deadline ASC
      LIMIT 8
    `),

    // My tasks (assigned to me, not done)
    db.execute(sql`
      SELECT
        t.id,
        t.title,
        t.type,
        t.status,
        t.due_date,
        c.title AS case_title,
        c.service_type,
        cl.name AS client_name
      FROM tasks t
      JOIN cases c ON c.id = t.case_id
      JOIN clients cl ON cl.id = c.client_id
      WHERE t.workspace_id = ${workspaceId}
        AND t.assigned_to = ${userId}
        AND t.status != 'done'
      ORDER BY t.due_date ASC NULLS LAST, t.created_at ASC
      LIMIT 6
    `),

    // Fee stats (from invoices table using actual DB schema)
    db.execute(sql`
      SELECT
        COALESCE(SUM(total_amount), 0)  AS total_billed,
        COALESCE(SUM(paid_amount), 0)   AS total_received,
        COALESCE(SUM(CASE WHEN status IN ('SENT','OVERDUE') THEN total_amount - paid_amount ELSE 0 END), 0) AS outstanding,
        COUNT(*) FILTER (WHERE status = 'PAID') AS paid_count,
        COUNT(*) FILTER (WHERE status IN ('SENT','OVERDUE')) AS unpaid_count
      FROM invoices
      WHERE workspace_id = ${workspaceId}
        AND created_at >= date_trunc('month', NOW())
    `),
  ])

  const fees = (feeStats.rows ?? feeStats)[0] as {
    total_billed: string; total_received: string; outstanding: string
    paid_count: string; unpaid_count: string
  }

  const totalBilled = Number(fees?.total_billed ?? 0)
  const totalReceived = Number(fees?.total_received ?? 0)
  const outstanding = Number(fees?.outstanding ?? 0)
  const collectionRate = totalBilled > 0 ? Math.round((totalReceived / totalBilled) * 100) : 0

  return {
    stats: {
      clients: Number(clientCount[0]?.value ?? 0),
      activeCases: Number(activeCaseCount[0]?.value ?? 0),
      pendingDocs: Number(pendingDocsCount[0]?.value ?? 0),
      overdueCases: Number(overdueCount[0]?.value ?? 0),
      newClientsThisMonth: Number(newClientsThisMonth[0]?.value ?? 0),
    },
    upcomingDeadlines: (upcomingDeadlines.rows ?? upcomingDeadlines) as {
      id: string; title: string; service_type: string; status: string
      deadline: string; client_name: string; days_left: number; fee_quoted: string
    }[],
    myTasks: (myTasks.rows ?? myTasks) as {
      id: string; title: string; type: string; status: string
      due_date: string; case_title: string; service_type: string; client_name: string
    }[],
    fees: {
      totalBilled,
      totalReceived,
      outstanding,
      collectionRate,
      paidCount: Number(fees?.paid_count ?? 0),
      unpaidCount: Number(fees?.unpaid_count ?? 0),
    },
  }
}
