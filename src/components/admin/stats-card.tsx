'use client'

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  /** Trend string, e.g. "+12%" */
  trend?: string
  /** Whether the trend is positive (green) or negative (red) */
  trendUp?: boolean
  /** Description text below the value */
  description?: string
  /** @deprecated Use `trend` and `trendUp` instead */
  trendObj?: { value: number; label: string }
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  description,
  trendObj,
  className,
}: StatsCardProps) {
  // Compute trend display — prefer new props, fallback to legacy trendObj
  const showTrend = trend != null || trendObj != null
  const trendLabel = trend ?? (trendObj ? `${trendObj.value >= 0 ? '+' : ''}${trendObj.value}` : '')
  const trendIsPositive =
    trendUp ?? (trendObj != null ? trendObj.value >= 0 : undefined)
  const trendDescription = trendObj?.label

  return (
    <Card className={cn('rounded-xl shadow-sm border', className)}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
            {description && !showTrend && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
            {showTrend && (
              <div className="flex items-center gap-1.5 pt-0.5">
                {trendIsPositive != null && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-semibold',
                      trendIsPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {trendIsPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trendLabel}
                  </span>
                )}
                {trendDescription && (
                  <span className="text-xs text-gray-400">{trendDescription}</span>
                )}
              </div>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-green-50">
            <Icon className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
