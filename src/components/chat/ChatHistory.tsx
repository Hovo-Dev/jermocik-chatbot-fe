import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn, formatTimestamp } from '@/lib/utils'
import { MessageSquare, Clock, AlertCircle, Trash2 } from 'lucide-react'

import type { ChatHistoryItem } from '@/types/chat'

interface ChatHistoryProps {
  history: ChatHistoryItem[]
  currentChatId?: number
  onSelectChat: (chatId: number) => void
  onDeleteChat?: (chatId: number) => void
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  className?: string
}

export function ChatHistory({ 
  history, 
  currentChatId, 
  onSelectChat, 
  onDeleteChat,
  isLoading = false,
  error = null,
  onRetry,
  className 
}: ChatHistoryProps): JSX.Element {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <LoadingSpinner size="sm" />
        <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600 mb-2">Failed to load conversations</p>
        <p className="text-xs text-gray-500 mb-3">{error}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            Try Again
          </Button>
        )}
      </div>
    )
  }

  // Empty state
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
          <div
            key={chat.id}
            className={cn(
              'group relative rounded-lg border transition-colors',
              currentChatId === chat.id 
                ? 'bg-gray-100 border-gray-200' 
                : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
            )}
          >
            <Button
              variant="ghost"
              className={cn(
                'w-full h-auto p-3 flex flex-col items-start gap-2 text-left transition-colors',
                'hover:bg-transparent' // Remove default hover since parent handles it
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
              
              {chat.lastMessage && (
                <p className="text-xs text-gray-600 text-left truncate w-full">
                  {chat.lastMessage}
                </p>
              )}
              
              <div className="flex items-center justify-between w-full mt-1">
                <span className="text-xs text-gray-500">
                  {chat.messageCount} messages
                </span>
              </div>
            </Button>
            
            {/* Delete Button */}
            {onDeleteChat && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute bottom-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-red-100 hover:text-red-600 text-gray-400'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteChat(chat.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}