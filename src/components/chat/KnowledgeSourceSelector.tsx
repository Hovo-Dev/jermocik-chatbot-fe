import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { KnowledgeSource } from '@/types/chat'
import { 
  FileText, 
  TrendingUp, 
  Newspaper, 
  Scale, 
  GraduationCap, 
  Mic, 
  Database 
} from 'lucide-react'

interface KnowledgeSourceSelectorProps {
  selectedSource: KnowledgeSource | 'all'
  onSourceChange: (source: KnowledgeSource | 'all') => void
  className?: string
}

const knowledgeSources = [
  {
    id: 'all' as const,
    label: 'All Sources',
    icon: Database,
    description: 'Search across all knowledge bases',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  {
    id: 'financial-reports' as const,
    label: 'Financial Reports',
    icon: FileText,
    description: '10-K, 10-Q, annual reports',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'market-data' as const,
    label: 'Market Data',
    icon: TrendingUp,
    description: 'Real-time prices, charts, indices',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'news-analysis' as const,
    label: 'News & Analysis',
    icon: Newspaper,
    description: 'Financial news, analyst reports',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'regulatory-docs' as const,
    label: 'Regulatory',
    icon: Scale,
    description: 'SEC filings, compliance docs',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'research-papers' as const,
    label: 'Research',
    icon: GraduationCap,
    description: 'Academic papers, studies',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'earnings-calls' as const,
    label: 'Earnings Calls',
    icon: Mic,
    description: 'Transcripts, Q&A sessions',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
] satisfies Array<{
  id: KnowledgeSource | 'all'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  bgColor: string
}>

export function KnowledgeSourceSelector({ 
  selectedSource, 
  onSourceChange, 
  className 
}: KnowledgeSourceSelectorProps): JSX.Element {
  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-3">
        <h3 className="font-semibold text-sm text-gray-900">Knowledge Sources</h3>
        <p className="text-xs text-gray-600 mt-1">Select data source for your query</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {knowledgeSources.map((source) => {
          const Icon = source.icon
          const isSelected = selectedSource === source.id
          
          return (
            <Button
              key={source.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'h-auto p-3 flex flex-col items-start gap-2 text-left',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => onSourceChange(source.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn(
                  'p-1.5 rounded-md',
                  isSelected ? 'bg-white/20' : source.bgColor
                )}>
                  <Icon className={cn(
                    'h-4 w-4',
                    isSelected ? 'text-white' : source.color
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'font-medium text-xs truncate',
                    isSelected ? 'text-white' : 'text-gray-900'
                  )}>
                    {source.label}
                  </div>
                </div>
              </div>
              <p className={cn(
                'text-xs text-left',
                isSelected ? 'text-white/80' : 'text-gray-600'
              )}>
                {source.description}
              </p>
            </Button>
          )
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Active Source:</span>
          <Badge variant="outline" className="text-xs">
            {knowledgeSources.find(s => s.id === selectedSource)?.label}
          </Badge>
        </div>
      </div>
    </Card>
  )
}