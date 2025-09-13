import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { FinancialQuickAction } from '@/types/chat'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calculator,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  Activity,
  Globe
} from 'lucide-react'

interface FinanceQuickActionsProps {
  onActionSelect: (action: FinancialQuickAction) => void
  className?: string
}

const quickActions: FinancialQuickAction[] = [
  {
    id: 'stock-analysis',
    label: 'Stock Analysis',
    icon: 'TrendingUp',
    prompt: 'Analyze the financial performance and key metrics of',
    category: 'analysis'
  },
  {
    id: 'portfolio-review',
    label: 'Portfolio Review',
    icon: 'PieChart',
    prompt: 'Review my portfolio allocation and suggest improvements for',
    category: 'analysis'
  },
  {
    id: 'earnings-forecast',
    label: 'Earnings Forecast',
    icon: 'Target',
    prompt: 'What are the earnings expectations and forecasts for',
    category: 'forecast'
  },
  {
    id: 'risk-assessment',
    label: 'Risk Assessment',
    icon: 'AlertTriangle',
    prompt: 'Assess the investment risks and volatility of',
    category: 'analysis'
  },
  {
    id: 'competitor-compare',
    label: 'Compare Competitors',
    icon: 'BarChart3',
    prompt: 'Compare the financial metrics and performance against competitors for',
    category: 'comparison'
  },
  {
    id: 'market-sentiment',
    label: 'Market Sentiment',
    icon: 'Activity',
    prompt: 'What is the current market sentiment and analyst opinion on',
    category: 'news'
  },
  {
    id: 'valuation-calc',
    label: 'Valuation Calculator',
    icon: 'Calculator',
    prompt: 'Calculate the intrinsic value and valuation metrics for',
    category: 'analysis'
  },
  {
    id: 'dividend-info',
    label: 'Dividend Analysis',
    icon: 'DollarSign',
    prompt: 'Analyze the dividend history, yield, and sustainability for',
    category: 'analysis'
  },
  {
    id: 'sector-overview',
    label: 'Sector Overview',
    icon: 'Globe',
    prompt: 'Provide an overview of the sector performance and trends for',
    category: 'analysis'
  },
  {
    id: 'breaking-news',
    label: 'Breaking News',
    icon: 'Zap',
    prompt: 'What are the latest news and developments affecting',
    category: 'news'
  }
]

const categoryColors = {
  analysis: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  comparison: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  forecast: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  news: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
}

const iconMap = {
  TrendingUp, BarChart3, PieChart, Calculator, DollarSign, Zap, Target, AlertTriangle, Activity, Globe
}

export function FinanceQuickActions({ onActionSelect, className }: FinanceQuickActionsProps): JSX.Element {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          Start your analysis with these common financial queries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = iconMap[action.icon as keyof typeof iconMap]
            const colors = categoryColors[action.category]
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  'h-auto p-4 flex flex-col items-start gap-3 text-left hover:shadow-md transition-all duration-200',
                  colors.border,
                  'hover:border-primary'
                )}
                onClick={() => onActionSelect(action)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    'p-2 rounded-lg',
                    colors.bg
                  )}>
                    <IconComponent className={cn('h-5 w-5', colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {action.label}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn('mt-1 text-xs', colors.text, colors.bg)}
                    >
                      {action.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-left">
                  {action.prompt}...
                </p>
              </Button>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-900">Pro Tip</span>
          </div>
          <p className="text-xs text-blue-700">
            Type a stock symbol (e.g., AAPL, TSLA) or company name after selecting an action 
            for instant analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}