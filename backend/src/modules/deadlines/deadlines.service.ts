import { eq, and, asc, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { cases } from '../../db/schema/index.js'

// ──────────────────────────────────────────────────
// Upcoming deadlines — cases with a deadline in next N days
// ──────────────────────────────────────────────────
export async function getUpcomingDeadlines(workspaceId: string, days = 30) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const future = new Date(today)
  future.setDate(future.getDate() + days)

  const todayStr = today.toISOString().split('T')[0]
  const futureStr = future.toISOString().split('T')[0]

  const rows = await db
    .select()
    .from(cases)
    .where(
      and(
        eq(cases.workspaceId, workspaceId),
        sql`${cases.deadline} IS NOT NULL`,
        sql`${cases.deadline} >= ${todayStr}`,
        sql`${cases.deadline} <= ${futureStr}`,
        sql`${cases.status} != 'COMPLETE'`,
      ),
    )
    .orderBy(asc(cases.deadline))

  return rows
}

// ──────────────────────────────────────────────────
// Overdue deadlines — cases past their deadline, not complete
// ──────────────────────────────────────────────────
export async function getOverdueDeadlines(workspaceId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const rows = await db
    .select()
    .from(cases)
    .where(
      and(
        eq(cases.workspaceId, workspaceId),
        sql`${cases.deadline} IS NOT NULL`,
        sql`${cases.deadline} < ${todayStr}`,
        sql`${cases.status} != 'COMPLETE'`,
      ),
    )
    .orderBy(asc(cases.deadline))

  return rows
}

// ──────────────────────────────────────────────────
// Summary counts for dashboard
// ──────────────────────────────────────────────────
export async function getDeadlineSummary(workspaceId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const in7 = new Date(today)
  in7.setDate(in7.getDate() + 7)
  const in7Str = in7.toISOString().split('T')[0]

  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)
  const in30Str = in30.toISOString().split('T')[0]

  const [overdueRows, week7Rows, month30Rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(cases)
      .where(
        and(
          eq(cases.workspaceId, workspaceId),
          sql`${cases.deadline} IS NOT NULL`,
          sql`${cases.deadline} < ${todayStr}`,
          sql`${cases.status} != 'COMPLETE'`,
        ),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(cases)
      .where(
        and(
          eq(cases.workspaceId, workspaceId),
          sql`${cases.deadline} IS NOT NULL`,
          sql`${cases.deadline} >= ${todayStr}`,
          sql`${cases.deadline} <= ${in7Str}`,
          sql`${cases.status} != 'COMPLETE'`,
        ),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(cases)
      .where(
        and(
          eq(cases.workspaceId, workspaceId),
          sql`${cases.deadline} IS NOT NULL`,
          sql`${cases.deadline} >= ${todayStr}`,
          sql`${cases.deadline} <= ${in30Str}`,
          sql`${cases.status} != 'COMPLETE'`,
        ),
      ),
  ])

  return {
    overdue: Number(overdueRows[0]?.count ?? 0),
    dueInWeek: Number(week7Rows[0]?.count ?? 0),
    dueInMonth: Number(month30Rows[0]?.count ?? 0),
  }
}
