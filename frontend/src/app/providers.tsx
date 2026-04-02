import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ToasterWithTheme() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
          fontSize: '13px',
        },
      }}
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToasterWithTheme />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
