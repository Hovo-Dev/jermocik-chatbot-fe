import { Button } from '@/components/ui/Button'
import { cn, formatTimestamp } from '@/lib/utils'
import { MessageSquare, Clock } from 'lucide-react'

import type { ChatHistoryItem } from '@/types/chat'

interface ChatHistoryProps {
  history: ChatHistoryItem[]
  currentChatId?: string
  onSelectChat: (chatId: string) => void
  className?: string
}

export function ChatHistory({ 
  history, 
  currentChatId, 
  onSelectChat, 
  className 
}: ChatHistoryProps): JSX.Element {
  if (history.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No chat history yet</p>
        <p className="text-xs text-gray-400 mt-1">Start a conversation to see it here</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-900">Recent Chats</h3>
      </div>
      
      <div className="space-y-1 px-2">
        {history.map((chat) => (
          <Button
            key={chat.id}
            variant={currentChatId === chat.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full h-auto p-3 flex flex-col items-start gap-2 text-left hover:bg-gray-50 transition-colors',
              currentChatId === chat.id && 'bg-gray-100 border border-gray-200'
            )}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-sm text-gray-900 truncate">
                {chat.title}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0 ml-2">
                <Clock className="h-3 w-3" />
                {formatTimestamp(chat.timestamp)}
              </div>
            </div>
            
            <p className="text-xs text-gray-600 text-left truncate w-full">
              {chat.lastMessage}
            </p>
            
            <div className="flex items-center justify-between w-full mt-1">
              <span className="text-xs text-gray-500">
                {chat.messageCount} messages
              </span>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}