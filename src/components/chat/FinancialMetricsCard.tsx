import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Target } from 'lucide-react'

interface FinancialMetric {
  label: string
  value: number
  format: 'currency' | 'percentage' | 'number' | 'large-number'
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ComponentType<{ className?: string }>
}

interface FinancialMetricsCardProps {
  title: string
  metrics: FinancialMetric[]
  className?: string
}

const formatValue = (value: number, format: FinancialMetric['format']): string => {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    case 'large-number':
      if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
      if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
      if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
      return value.toLocaleString()
    case 'number':
    default:
      return value.toLocaleString()
  }
}

const getChangeColor = (changeType: FinancialMetric['changeType']): string => {
  switch (changeType) {
    case 'positive':
      return 'text-finance-green'
    case 'negative':
      return 'text-finance-red'
    case 'neutral':
    default:
      return 'text-gray-600'
  }
}

export function FinancialMetricsCard({ 
  title, 
  metrics, 
  className 
}: FinancialMetricsCardProps): JSX.Element {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon || Activity
            const changeColor = getChangeColor(metric.changeType)
            
            return (
              <div 
                key={index}
                className="p-4 bg-gray-50 rounded-lg border transition-all duration-200 hover:shadow-md hover:bg-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {metric.label}
                    </span>
                  </div>
                  
                  {metric.change !== undefined && (
                    <div className={cn('flex items-center gap-1', changeColor)}>
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : metric.changeType === 'negative' ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : null}
                      <span className="text-xs font-medium">
                        {metric.change > 0 ? '+' : ''}{formatPercentage(metric.change)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-2xl font-bold text-gray-900">
                  {formatValue(metric.value, metric.format)}
                </div>
                
                {metric.change !== undefined && (
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'success' : 
                            metric.changeType === 'negative' ? 'error' : 'outline'}
                    className="mt-2 text-xs"
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}%
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last updated</span>
            <span>2 minutes ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Example usage component for demo
export function ExampleFinancialMetrics(): JSX.Element {
  const sampleMetrics: FinancialMetric[] = [
    {
      label: 'Current Price',
      value: 175.43,
      format: 'currency',
      change: 2.34,
      changeType: 'positive',
      icon: DollarSign
    },
    {
      label: 'Market Cap',
      value: 2750000000000,
      format: 'large-number',
      change: 1.2,
      changeType: 'positive',
      icon: Target
    },
    {
      label: 'P/E Ratio',
      value: 28.5,
      format: 'number',
      change: -0.8,
      changeType: 'negative',
      icon: BarChart3
    },
    {
      label: 'Day Change',
      value: 1.35,
      format: 'percentage',
      change: 1.35,
      changeType: 'positive',
      icon: TrendingUp
    }
  ]

  return (
    <FinancialMetricsCard 
      title="AAPL Stock Metrics"
      metrics={sampleMetrics}
      className="w-full max-w-4xl"
    />
  )
}