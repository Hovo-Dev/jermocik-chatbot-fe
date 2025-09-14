import { ChatInterface } from '@/components/chat/ChatInterface'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function Home(): JSX.Element {
  return (
    <main className="h-screen overflow-hidden">
      <ProtectedRoute>
        <ChatInterface />
      </ProtectedRoute>
    </main>
  )
}