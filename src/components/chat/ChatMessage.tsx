import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn, formatTimestamp, formatCurrency, formatPercentage } from '@/lib/utils'
import type { Message } from '@/types/chat'
import { 
  FileText, 
  TrendingUp, 
  Newspaper, 
  Scale, 
  GraduationCap, 
  Mic,
  Bot,
  User,
  Clock,
  CheckCircle
} from 'lucide-react'

interface ChatMessageProps {
  message: Message
  className?: string
}

const knowledgeSourceIcons = {
  'financial-reports': FileText,
  'market-data': TrendingUp,
  'news-analysis': Newspaper,
  'regulatory-docs': Scale,
  'research-papers': GraduationCap,
  'earnings-calls': Mic,
} as const

const knowledgeSourceColors = {
  'financial-reports': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'market-data': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'news-analysis': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'regulatory-docs': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'research-papers': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'earnings-calls': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
} as const

function MessageMetadata({ message }: { message: Message }): JSX.Element | null {
  if (!message.metadata) return null

  const { confidence, sources, stockSymbols, financialMetrics } = message.metadata

  return (
    <div className="mt-4 space-y-3">
      {/* Confidence Score */}
      {confidence && (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">
            Confidence: <span className="font-semibold text-green-600">{Math.round(confidence * 100)}%</span>
          </span>
        </div>
      )}

      {/* Stock Symbols */}
      {stockSymbols && stockSymbols.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">Related:</span>
          {stockSymbols.map(symbol => (
            <Badge key={symbol} variant="outline" className="text-xs">
              ${symbol}
            </Badge>
          ))}
        </div>
      )}

      {/* Financial Metrics */}
      {financialMetrics && Object.keys(financialMetrics).length > 0 && (
        <Card className="p-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(financialMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-semibold">
                  {key.includes('price') || key.includes('value') 
                    ? formatCurrency(value)
                    : key.includes('percent') || key.includes('change')
                    ? formatPercentage(value)
                    : value.toLocaleString()
                  }
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Sources:</span>
          </div>
          <div className="ml-6 space-y-1">
            {sources.map((source, index) => (
              <div key={index} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                • {source}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ChatMessage({ message, className }: ChatMessageProps): JSX.Element {
  const isUser = message.role === 'user'
  const isLoading = message.isLoading

  const KnowledgeIcon = message.knowledgeSource 
    ? knowledgeSourceIcons[message.knowledgeSource]
    : null

  const knowledgeColors = message.knowledgeSource 
    ? knowledgeSourceColors[message.knowledgeSource]
    : null

  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-xl transition-all duration-200',
      isUser 
        ? 'bg-blue-600 text-white ml-8' 
        : 'bg-gray-50 border border-gray-200 mr-8',
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser 
          ? 'bg-blue-700' 
          : 'bg-gray-600 text-white'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-medium',
              isUser ? 'text-white' : 'text-gray-900'
            )}>
              {isUser ? 'Me' : 'AI Response'}
            </span>
            
            {/* Knowledge Source Badge */}
            {message.knowledgeSource && knowledgeColors && KnowledgeIcon && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs flex items-center gap-1',
                  knowledgeColors.bg,
                  knowledgeColors.text,
                  knowledgeColors.border
                )}
              >
                <KnowledgeIcon className="h-3 w-3" />
                {message.knowledgeSource.replace('-', ' ')}
              </Badge>
            )}
          </div>
          
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isUser ? "text-blue-100" : "text-gray-500"
          )}>
            <Clock className="h-3 w-3" />
            {formatTimestamp(message.timestamp)}
          </div>
        </div>

        {/* Message Text */}
        <div className={cn(
          'prose prose-sm max-w-none',
          isUser 
            ? 'text-white' 
            : 'text-gray-800',
          isLoading && 'animate-pulse'
        )}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
              <span className={cn(
                "ml-2 text-sm",
                isUser ? "text-blue-100" : "text-gray-500"
              )}>Analyzing...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

        {/* Metadata - only for assistant messages */}
        {!isUser && !isLoading && (
          <MessageMetadata message={message} />
        )}
      </div>
    </div>
  )
}