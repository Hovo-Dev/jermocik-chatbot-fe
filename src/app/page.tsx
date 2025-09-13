import { ChatInterface } from '@/components/chat/ChatInterface'

export default function Home(): JSX.Element {
  return (
    <main className="h-screen overflow-hidden">
      <ChatInterface />
    </main>
  )
}