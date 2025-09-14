export type MessageRole = 'user' | 'assistant'

export type KnowledgeSource = 
  | 'financial-reports'
  | 'market-data'
  | 'news-analysis'
  | 'regulatory-docs'
  | 'research-papers'
  | 'earnings-calls'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  knowledgeSource?: KnowledgeSource
  isLoading?: boolean
  metadata?: {
    confidence?: number
    sources?: string[]
    stockSymbols?: string[]
    financialMetrics?: Record<string, number>
  }
}

// API Response types for messages
export interface MessageListResponse {
  success: boolean
  message: string
  data: any[]
}

export interface MessageCreateResponse {
  success: boolean
  message: string
  data: {
    assistant_message?: any
  }
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
}

export interface ChatHistoryItem {
  id: number
  title: string
  lastMessage?: string
  timestamp: Date
  messageCount: number
  is_archived: boolean
  user: number
  user_id: number
  created_at: string
  updated_at: string
  last_message_at: string | null
}

// API Response types
export interface ConversationListResponse {
  success: boolean
  message: string
  data: ChatHistoryItem[]
}

export interface ConversationCreateResponse {
  success: boolean
  message: string
  data: ChatHistoryItem
}

export interface FinancialQuickAction {
  id: string
  label: string
  icon: string
  prompt: string
  category: 'analysis' | 'comparison' | 'forecast' | 'news'
}