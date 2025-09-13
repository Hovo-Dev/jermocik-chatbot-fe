import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Minus } from 'lucide-react'

type SentimentLevel = 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish'

interface SentimentData {
  overall: SentimentLevel
  score: number // -100 to 100
  indicators: {
    label: string
    value: SentimentLevel
    description: string
    weight: number
  }[]
  lastUpdated: Date
}

interface MarketSentimentIndicatorProps {
  data: SentimentData
  symbol?: string
  className?: string
}

const sentimentConfig = {
  'very-bullish': {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: TrendingUp,
    label: 'Very Bullish',
    badge: 'success'
  },
  'bullish': {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: TrendingUp,
    label: 'Bullish',
    badge: 'success'
  },
  'neutral': {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Minus,
    label: 'Neutral',
    badge: 'outline'
  },
  'bearish': {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: TrendingDown,
    label: 'Bearish',
    badge: 'error'
  },
  'very-bearish': {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: TrendingDown,
    label: 'Very Bearish',
    badge: 'error'
  }
} as const


export function MarketSentimentIndicator({ 
  data, 
  symbol, 
  className 
}: MarketSentimentIndicatorProps): JSX.Element {
  const overallConfig = sentimentConfig[data.overall]
  const OverallIcon = overallConfig.icon

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Market Sentiment {symbol && `- ${symbol}`}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-6">
        {/* Overall Sentiment */}
        <div className={cn(
          'p-6 rounded-xl border-2',
          overallConfig.bgColor,
          overallConfig.borderColor
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg bg-white/50'
              )}>
                <OverallIcon className={cn('h-6 w-6', overallConfig.color)} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Overall Sentiment</h3>
                <p className={cn('font-semibold', overallConfig.color)}>
                  {overallConfig.label}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {data.score > 0 ? '+' : ''}{data.score}
              </div>
              <Badge 
                variant={overallConfig.badge as 'success' | 'error' | 'outline'}
                className="mt-1"
              >
                Score: {data.score}/100
              </Badge>
            </div>
          </div>

          {/* Sentiment Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Very Bearish</span>
              <span>Neutral</span>
              <span>Very Bullish</span>
            </div>
            <div className="relative h-3 bg-gradient-to-r from-red-200 via-gray-200 to-green-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 h-full w-1 bg-gray-800 rounded-full transform -translate-x-1/2"
                style={{ left: `${((data.score + 100) / 200) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
          </div>
        </div>

        {/* Individual Indicators */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Sentiment Indicators
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {data.indicators.map((indicator, index) => {
              const config = sentimentConfig[indicator.value]
              const IndicatorIcon = config.icon
              
              return (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IndicatorIcon className={cn('h-4 w-4', config.color)} />
                      <span className="font-medium text-gray-900">
                        {indicator.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={config.badge as 'success' | 'error' | 'outline'}
                        className="text-xs"
                      >
                        {config.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Weight: {(indicator.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {indicator.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Data Updated</span>
            </div>
            <span>{data.lastUpdated.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Example usage component
export function ExampleMarketSentiment(): JSX.Element {
  const sampleData: SentimentData = {
    overall: 'bullish',
    score: 34,
    indicators: [
      {
        label: 'Technical Analysis',
        value: 'bullish',
        description: 'RSI and MACD showing positive momentum with strong support levels',
        weight: 0.25
      },
      {
        label: 'Analyst Ratings',
        value: 'very-bullish',
        description: '12 Buy, 3 Hold, 1 Sell ratings with average target of $185',
        weight: 0.30
      },
      {
        label: 'News Sentiment',
        value: 'neutral',
        description: 'Mixed coverage with earnings beat offset by supply chain concerns',
        weight: 0.20
      },
      {
        label: 'Options Flow',
        value: 'bullish',
        description: 'Call-to-put ratio at 1.8:1 indicating bullish positioning',
        weight: 0.15
      },
      {
        label: 'Insider Trading',
        value: 'neutral',
        description: 'No significant insider transactions in the past 30 days',
        weight: 0.10
      }
    ],
    lastUpdated: new Date()
  }

  return (
    <MarketSentimentIndicator 
      data={sampleData}
      symbol="AAPL"
      className="w-full max-w-4xl"
    />
  )
}