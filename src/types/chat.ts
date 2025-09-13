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

export interface ChatState {
  messages: Message[]
  isLoading: boolean
}

export interface ChatHistoryItem {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

export interface FinancialQuickAction {
  id: string
  label: string
  icon: string
  prompt: string
  category: 'analysis' | 'comparison' | 'forecast' | 'news'
}