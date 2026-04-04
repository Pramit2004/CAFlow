import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="light"
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
    </QueryClientProvider>
  )
}
