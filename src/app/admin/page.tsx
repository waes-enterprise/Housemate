'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Users,
  Building2,
  CheckCircle,
  Clock,
  Heart,
  Tag,
  UserPlus,
  PlusCircle,
  LayoutDashboard,
  MapPin,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

/* ------------------------------------------------------------------ */
/*  Pie chart colour palette                                          */
/* ------------------------------------------------------------------ */
const TIER_COLORS: Record<string, string> = {
  standard: '#6b7280',
  featured: '#3b82f6',
  spotlight: '#f59e0b',
  premium: '#006633',
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Stats {
  totalUsers: number
  totalListings: number
  activeListings: number
  pendingListings: number
  totalCategories: number
  totalFavorites: number
  recentSignups: number
  recentListings: number
  listingsByCategory: { category: string; count: number }[]
  listingsByTier: { tier: string; count: number }[]
  listingsByLocation: { location: string; count: number }[]
  recentActivity: {
    id: string
    action: string
    details: string | null
    ipAddress: string | null
    createdAt: string
    user: { id: string; name: string; email: string } | null
  }[]
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                         */
/* ------------------------------------------------------------------ */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Dashboard" description="Overview of your marketplace" icon={LayoutDashboard} />

        {/* First stats row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`s1-${i}`} className="h-[120px] rounded-xl" />
          ))}
        </div>

        {/* Second stats row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`s2-${i}`} className="h-[120px] rounded-xl" />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[380px] rounded-xl" />
          <Skeleton className="h-[380px] rounded-xl" />
        </div>

        {/* Bottom tables skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[360px] rounded-xl" />
          <Skeleton className="h-[360px] rounded-xl" />
        </div>
      </div>
    )
  }

  /* ---------- Error state ---------- */
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Dashboard" description="Overview of your marketplace" icon={LayoutDashboard} />
        <Card className="rounded-xl border">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Failed to load dashboard</h3>
              <p className="text-sm text-gray-500 mt-1">
                There was an error fetching the dashboard data. Please try again.
              </p>
            </div>
            <Button
              onClick={fetchStats}
              variant="outline"
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  /* ---------- Data transforms ---------- */
  const categoryData = stats.listingsByCategory.map((c) => ({
    name: c.category,
    count: c.count,
  }))

  const tierData = stats.listingsByTier.map((t) => ({
    name: t.tier.charAt(0).toUpperCase() + t.tier.slice(1),
    value: t.count,
    fill: TIER_COLORS[t.tier] || '#6b7280',
  }))

  const maxLocationCount = stats.listingsByLocation.length
    ? Math.max(...stats.listingsByLocation.map((l) => l.count))
    : 1

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Dashboard" description="Overview of your marketplace" icon={LayoutDashboard} />

      {/* ============================================================== */}
      {/*  STATS ROW 1                                                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatsCard title="Total Listings" value={stats.totalListings} icon={Building2} />
        <StatsCard title="Active Listings" value={stats.activeListings} icon={CheckCircle} />
        <StatsCard title="Pending Listings" value={stats.pendingListings} icon={Clock} />
      </div>

      {/* ============================================================== */}
      {/*  STATS ROW 2                                                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard title="Total Categories" value={stats.totalCategories} icon={Tag} />
        <StatsCard title="Total Favorites" value={stats.totalFavorites} icon={Heart} />
        <StatsCard
          title="New Users"
          value={stats.recentSignups}
          icon={UserPlus}
          description="Last 7 days"
        />
        <StatsCard
          title="New Listings"
          value={stats.recentListings}
          icon={PlusCircle}
          description="Last 7 days"
        />
      </div>

      {/* ============================================================== */}
      {/*  CHARTS                                                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings by Category — Bar Chart */}
        <Card className="rounded-xl border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Listings by Category</h3>
          </CardHeader>
          <CardContent className="pt-0">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-35}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="count" fill="#006633" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings by Tier — Donut Chart */}
        <Card className="rounded-xl border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Listings by Tier</h3>
          </CardHeader>
          <CardContent className="pt-0">
            {tierData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                      fontSize: '13px',
                    }}
                    formatter={(value: number, name: string) => [`${value} listings`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value: string) => <span style={{ fontSize: '13px', color: '#475569' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/*  RECENT ACTIVITY & TOP LOCATIONS                                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="rounded-xl border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link
              href="/admin/activity"
              className="text-sm text-[#006633] hover:text-[#004d26] font-medium inline-flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {stats.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-2">
                  <Clock className="w-8 h-8 text-gray-300" />
                  <span>No recent activity</span>
                </div>
              ) : (
                stats.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={log.action} />
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {log.details || log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {log.user?.name || 'System'} &middot;{' '}
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="rounded-xl border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Top Locations</h3>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.listingsByLocation.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-2">
                <MapPin className="w-8 h-8 text-gray-300" />
                <span>No locations yet</span>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.listingsByLocation.slice(0, 10).map((loc, idx) => {
                  const pct = Math.round((loc.count / maxLocationCount) * 100)
                  return (
                    <div key={loc.location} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate mr-2">
                            {loc.location}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 shrink-0">
                            {loc.count}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#006633] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
