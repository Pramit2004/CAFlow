import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'
import { AuthGuard } from '@/modules/auth/components/AuthGuard'

// ─── Lazy-loaded pages ─────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const OnboardingPage = lazy(() => import('@/pages/auth/OnboardingPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ClientsPage = lazy(() => import('@/pages/clients/ClientsPage'))
const ClientDetailPage = lazy(() => import('@/pages/clients/ClientDetailPage'))
const CasesPage = lazy(() => import('@/pages/cases/CasesPage'))
const CaseDetailPage = lazy(() => import('@/pages/cases/CaseDetailPage'))
const DocumentInboxPage = lazy(() => import('@/pages/documents/DocumentInboxPage'))
const InvoicesPage = lazy(() => import('@/pages/fees/InvoicesPage'))
const PaymentsPage = lazy(() => import('@/pages/fees/PaymentsPage'))
const CompliancePage = lazy(() => import('@/pages/calendar/CompliancePage'))
const TeamPage = lazy(() => import('@/pages/team/TeamPage'))
const FirmSettingsPage = lazy(() => import('@/pages/settings/FirmSettingsPage'))
const NotificationsSettingsPage = lazy(() => import('@/pages/settings/NotificationsPage'))

// Client portal (no auth)
const PortalUploadPage = lazy(() => import('@/pages/portal/PortalUploadPage'))
const PortalDownloadPage = lazy(() => import('@/pages/portal/PortalDownloadPage'))
const PortalExpiredPage = lazy(() => import('@/pages/portal/PortalExpiredPage'))

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingSkeleton />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  { path: '/login', element: wrap(<LoginPage />) },
  { path: '/onboarding', element: wrap(<OnboardingPage />) },

  // ── Client portal (token-based, no login) ─────────────────────────────
  { path: '/c/:token', element: wrap(<PortalUploadPage />) },
  { path: '/c/:token/download', element: wrap(<PortalDownloadPage />) },
  { path: '/c/expired', element: wrap(<PortalExpiredPage />) },

  // ── Protected CA portal ───────────────────────────────────────────────
  {
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: wrap(<DashboardPage />) },
      { path: '/clients', element: wrap(<ClientsPage />) },
      { path: '/clients/:id', element: wrap(<ClientDetailPage />) },
      { path: '/cases', element: wrap(<CasesPage />) },
      { path: '/cases/:id', element: wrap(<CaseDetailPage />) },
      { path: '/documents', element: wrap(<DocumentInboxPage />) },
      { path: '/fees/invoices', element: wrap(<InvoicesPage />) },
      { path: '/fees/payments', element: wrap(<PaymentsPage />) },
      { path: '/calendar', element: wrap(<CompliancePage />) },
      { path: '/team', element: wrap(<TeamPage />) },
      { path: '/settings/firm', element: wrap(<FirmSettingsPage />) },
      { path: '/settings/notifications', element: wrap(<NotificationsSettingsPage />) },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
