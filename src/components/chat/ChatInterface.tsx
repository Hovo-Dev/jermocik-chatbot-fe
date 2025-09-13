'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatHistory } from './ChatHistory'
import { Button } from '@/components/ui/Button'
import { cn, generateId } from '@/lib/utils'
import type { Message, ChatState, ChatHistoryItem } from '@/types/chat'
import { 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  RefreshCw,
  Menu,
  X
} from 'lucide-react'

export function ChatInterface(): JSX.Element {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false
  })
  
  const [chatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      title: 'AAPL Stock Analysis',
      lastMessage: 'What are the latest earnings for Apple?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messageCount: 8
    },
    {
      id: '2',
      title: 'Portfolio Diversification',
      lastMessage: 'How should I diversify my tech portfolio?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messageCount: 12
    },
    {
      id: '3',
      title: 'Market Sentiment Analysis',
      lastMessage: 'Analyze current market sentiment for Q4',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      messageCount: 6
    }
  ])
  
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleNewChat = useCallback((): void => {
    setChatState({
      messages: [],
      isLoading: false
    })
    setCurrentChatId(undefined)
    setShowQuickActions(true)
  }, [])

  const handleSelectChat = useCallback((chatId: string): void => {
    setCurrentChatId(chatId)
    // In a real app, you would load the messages for this chat
    // For demo purposes, we'll just clear the current messages
    setChatState({
      messages: [],
      isLoading: false
    })
    setShowQuickActions(false)
  }, [])


  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages])

  const handleSendMessage = async (content: string): Promise<void> => {
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

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I'll analyze "${content}" using our comprehensive financial intelligence system.\n\nBased on the latest financial data and market analysis, here's what I found:\n\n• Current market conditions show moderate volatility\n• Key financial metrics indicate stable growth patterns\n• Analyst sentiment remains cautiously optimistic\n• Risk factors include market uncertainty and regulatory changes\n\nWould you like me to dive deeper into any specific aspect of this analysis?`,
        timestamp: new Date(),
        knowledgeSource: 'market-data',
        metadata: {
          confidence: 0.87,
          sources: ['SEC 10-K Filing', 'Yahoo Finance API', 'Reuters Market Data'],
          stockSymbols: ['AAPL', 'MSFT', 'GOOGL'],
          financialMetrics: {
            currentPrice: 175.43,
            priceChange: 2.34,
            percentChange: 1.35,
            marketCap: 2750000000000,
            peRatio: 28.5
          }
        }
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }))
    }, 2000)
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

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleNewChat}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {!hasMessages && showQuickActions ? (
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
    </div>
  )
}