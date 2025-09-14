'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatHistory } from './ChatHistory'
import { AuthButtons } from '@/components/auth/AuthButtons'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn, generateId } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { chatApi, ChatApiError } from '@/lib/chatApi'
import type { Message, ChatState, ChatHistoryItem } from '@/types/chat'
import { 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  Menu,
  X,
  Trash2
} from 'lucide-react'

export function ChatInterface(): JSX.Element {
  const { isAuthenticated, tokens } = useAuth()
  
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false
  })
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [conversationsError, setConversationsError] = useState<string | null>(null)
  
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(undefined)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(true)
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<{ id: number; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch conversations from API
  const fetchConversations = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !tokens?.access) {
      return
    }

    setConversationsLoading(true)
    setConversationsError(null)

    try {
      const conversations = await chatApi.getConversations(tokens.access)
      setChatHistory(conversations)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversationsError(
        error instanceof ChatApiError 
          ? error.message 
          : 'Failed to load conversations'
      )
    } finally {
      setConversationsLoading(false)
    }
  }, [isAuthenticated, tokens?.access])

  // Create a new conversation
  const createNewConversation = useCallback(async (title: string): Promise<number | null> => {
    if (!isAuthenticated || !tokens?.access) {
      return null
    }

    try {
      const newConversation = await chatApi.createConversation(title, tokens.access)
      setChatHistory(prev => [newConversation, ...prev])
      return newConversation.id
    } catch (error) {
      console.error('Failed to create conversation:', error)
      return null
    }
  }, [isAuthenticated, tokens?.access])

  // Load messages for a specific conversation
  const loadConversationMessages = useCallback(async (conversationId: number): Promise<void> => {
    if (!isAuthenticated || !tokens?.access) {
      return
    }

    setMessagesLoading(true)
    setMessagesError(null)

    try {
      const messages = await chatApi.getConversationMessages(conversationId, tokens.access)
      setChatState(prev => ({
        ...prev,
        messages,
        isLoading: false
      }))
    } catch (error) {
      console.error('Failed to load conversation messages:', error)
      setMessagesError(
        error instanceof ChatApiError 
          ? error.message 
          : 'Failed to load messages'
      )
      setChatState(prev => ({
        ...prev,
        messages: [],
        isLoading: false
      }))
    } finally {
      setMessagesLoading(false)
    }
  }, [isAuthenticated, tokens?.access])

  // Load conversations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    } else {
      setChatHistory([])
      setCurrentChatId(undefined)
    }
  }, [isAuthenticated, fetchConversations])

  const handleNewChat = useCallback((): void => {
    setChatState({
      messages: [],
      isLoading: false
    })
    setCurrentChatId(undefined)
    setShowQuickActions(true)
    setMessagesError(null) // Clear any previous message errors
  }, [])

  const handleSelectChat = useCallback((chatId: number): void => {
    setCurrentChatId(chatId)
    setShowQuickActions(false)
    // Load messages for the selected conversation
    loadConversationMessages(chatId)
  }, [loadConversationMessages])

  // Handle delete conversation
  const handleDeleteChat = useCallback((chatId: number): void => {
    const conversation = chatHistory.find(chat => chat.id === chatId)
    if (conversation) {
      setConversationToDelete({ id: chatId, title: conversation.title })
      setDeleteModalOpen(true)
    }
  }, [chatHistory])

  // Confirm delete conversation
  const confirmDeleteConversation = useCallback(async (): Promise<void> => {
    if (!conversationToDelete || !isAuthenticated || !tokens?.access) {
      return
    }

    setIsDeleting(true)

    try {
      // Wait for successful API response (200 status)
      await chatApi.deleteConversation(conversationToDelete.id, tokens.access)
      
      // Only close modal after successful deletion (200 response)
      setDeleteModalOpen(false)
      setConversationToDelete(null)
      
      // If the deleted conversation was currently selected, clear it
      if (currentChatId === conversationToDelete.id) {
        setCurrentChatId(undefined)
        setChatState({
          messages: [],
          isLoading: false
        })
        setShowQuickActions(true)
      }
      
      // Refresh conversations list from API
      await fetchConversations()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      // Modal stays open on error - user can try again or cancel
    } finally {
      setIsDeleting(false)
    }
  }, [conversationToDelete, isAuthenticated, tokens?.access, currentChatId, fetchConversations])

  // Cancel delete
  const cancelDelete = useCallback((): void => {
    setDeleteModalOpen(false)
    setConversationToDelete(null)
  }, [])


  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages])

  const handleSendMessage = async (content: string): Promise<void> => {
    if (!isAuthenticated || !tokens?.access) {
      console.error('User not authenticated')
      return
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }))

    setShowQuickActions(false)

    try {
      // If no current conversation, create a new one
      let conversationId = currentChatId
      if (!conversationId) {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content
        const newConversationId = await createNewConversation(title)
        if (newConversationId) {
          conversationId = newConversationId
          setCurrentChatId(newConversationId)
        } else {
          throw new Error('Failed to create conversation')
        }
      }

      // Create the message using the API
      const result = await chatApi.createMessage(conversationId, content, tokens.access)
      
      // Add the assistant message if it was returned
      if (result.assistantMessage) {
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, result.assistantMessage!],
          isLoading: false
        }))
      } else {
        // If no assistant message was returned, just stop loading
        setChatState(prev => ({
          ...prev,
          isLoading: false
        }))
      }

      // Refresh conversations to update message counts
      fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      setChatState(prev => ({
        ...prev,
        isLoading: false
      }))
    }
  }



  const hasMessages = chatState.messages.length > 0

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        'transition-all duration-300 border-r bg-white',
        sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              FinBot AI
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleNewChat}
            className="w-full mb-4"
            variant="outline"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChatHistory
            history={chatHistory}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            isLoading={conversationsLoading}
            error={conversationsError}
            onRetry={fetchConversations}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              
              <div>
                <h1 className="font-semibold text-lg">Financial AI Assistant</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Ready to help with financial analysis
                </p>
              </div>
            </div>

            <AuthButtons />
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {messagesLoading ? (
            // Loading messages
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
                <p className="text-gray-600">Loading conversation...</p>
              </div>
            </div>
          ) : messagesError ? (
            // Error loading messages
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-600">Failed to load messages</p>
                <p className="text-sm text-gray-500">{messagesError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentChatId && loadConversationMessages(currentChatId)}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : !hasMessages && showQuickActions ? (
            // Welcome Screen
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                  <TrendingUp className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome to FinBot AI
                </h2>
                <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                  Your intelligent financial assistant. Ask me anything about stocks, market analysis, investment strategies, or financial planning.
                </p>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Start typing your question below or select a recent conversation from the sidebar.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-4 p-4">
              {chatState.messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message}
                  className="animate-slide-up"
                />
              ))}
              
              {chatState.isLoading && (
                <ChatMessage
                  message={{
                    id: 'loading',
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                    isLoading: true
                  }}
                  className="animate-fade-in"
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={chatState.isLoading}
          ref={inputRef}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        title="Delete Conversation"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                Are you sure you want to delete this conversation?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                &ldquo;{conversationToDelete?.title}&rdquo;
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            This action cannot be undone. All messages in this conversation will be permanently deleted.
          </p>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteConversation}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}