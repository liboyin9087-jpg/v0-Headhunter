import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Briefcase,
  MessageSquare,
  Brain,
  ArrowUpRight,
  Plus,
  Upload,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import type { CandidateStatus } from '@/lib/types/database'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    candidatesResult,
    positionsResult,
    templatesResult,
    interviewingResult,
    placedResult,
  ] = await Promise.all([
    supabase.from('candidates').select('id', { count: 'exact', head: true }),
    supabase.from('job_positions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('message_templates').select('id', { count: 'exact', head: true }),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('status', 'interviewing'),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('status', 'placed'),
  ])

  const candidatesCount = candidatesResult.count ?? 0
  const openPositionsCount = positionsResult.count ?? 0
  const templatesCount = templatesResult.count ?? 0
  const interviewingCount = interviewingResult.count ?? 0
  const placedCount = placedResult.count ?? 0

  const { data: recentCandidates } = await supabase
    .from('candidates')
    .select('id, name, current_title, current_company, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: openPositions } = await supabase
    .from('job_positions')
    .select('id, title, company, location, salary_range, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(4)

  const stats = [
    {
      label: '人才庫',
      value: candidatesCount,
      icon: Users,
      href: '/dashboard/candidates',
      tone: 'blue' as const,
      hint: '已建檔候選人總數',
    },
    {
      label: '開放職缺',
      value: openPositionsCount,
      icon: Briefcase,
      href: '/dashboard/positions',
      tone: 'indigo' as const,
      hint: '正在招募中',
    },
    {
      label: '面試進行中',
      value: interviewingCount,
      icon: Clock,
      href: '/dashboard/candidates?status=interviewing',
      tone: 'amber' as const,
      hint: '等待面試結果',
    },
    {
      label: '成功入職',
      value: placedCount,
      icon: TrendingUp,
      href: '/dashboard/candidates?status=placed',
      tone: 'emerald' as const,
      hint: '累計成功案例',
    },
  ]

  const toneStyles: Record<string, { bg: string; icon: string; ring: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  }

  const quickActions = [
    { icon: Plus, title: '新增候選人', desc: '手動建立候選人檔案', href: '/dashboard/candidates/new' },
    { icon: Upload, title: '批次匯入 CSV', desc: '一次匯入多筆資料', href: '/dashboard/candidates/import' },
    { icon: Briefcase, title: '建立職缺', desc: '新增客戶職缺需求', href: '/dashboard/positions' },
    { icon: Brain, title: 'AI 匹配分析', desc: '評估候選人契合度', href: '/dashboard/analysis' },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">歡迎回來</p>
          <h2 className="text-2xl font-bold tracking-tight">
            {user?.email?.split('@')[0] || '獵頭顧問'}，祝你有個高效的一天 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            掌握最新人才動態，用 AI 加速你的招募流程
          </p>
        </div>
        <Link href="/dashboard/analysis">
          <Button variant="outline" className="border-blue-200 text-primary hover:bg-blue-50">
            <Sparkles className="mr-1.5 h-4 w-4" />
            啟動 AI 匹配
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const tone = toneStyles[stat.tone]
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="group h-full rounded-xl border border-border bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone.bg} ring-1 ${tone.ring}`}>
                    <stat.icon className={`h-5 w-5 ${tone.icon}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-4 text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-sm font-medium">{stat.label}</span>
                  <span className="text-xs text-muted-foreground">· {stat.hint}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold tracking-tight">快速操作</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="group flex items-start gap-3 rounded-lg border border-border bg-white p-4 transition-all hover:border-blue-200 hover:bg-blue-50/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{action.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent candidates */}
        <Card className="lg:col-span-2 py-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold">最近新增的候選人</h3>
              <p className="text-xs text-muted-foreground mt-0.5">前 5 筆最新資料</p>
            </div>
            <Link href="/dashboard/candidates">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                查看全部
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <CardContent className="p-0">
            {recentCandidates && recentCandidates.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentCandidates.map((candidate) => (
                  <li key={candidate.id}>
                    <Link
                      href={`/dashboard/candidates/${candidate.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary font-semibold text-sm ring-1 ring-blue-100">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {candidate.current_title || '未填寫職稱'}
                            {candidate.current_company && ` · ${candidate.current_company}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${STATUS_COLORS[candidate.status as CandidateStatus]} text-xs`}>
                        {STATUS_LABELS[candidate.status as CandidateStatus]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 px-5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium">尚無候選人資料</p>
                <p className="mt-1 text-xs text-muted-foreground">新增第一位候選人開始使用</p>
                <Link href="/dashboard/candidates/new">
                  <Button size="sm" className="mt-4">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    新增候選人
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open positions */}
        <Card className="py-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold">開放職缺</h3>
              <p className="text-xs text-muted-foreground mt-0.5">正在招募中</p>
            </div>
            <Link href="/dashboard/positions">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                管理
              </Button>
            </Link>
          </div>
          <CardContent className="p-0">
            {openPositions && openPositions.length > 0 ? (
              <ul className="divide-y divide-border">
                {openPositions.map((position) => (
                  <li
                    key={position.id}
                    className="px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{position.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {position.company}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {position.location && (
                        <Badge variant="outline" className="text-[10px] h-5 font-normal">
                          {position.location}
                        </Badge>
                      )}
                      {position.salary_range && (
                        <Badge variant="outline" className="text-[10px] h-5 font-normal border-blue-200 text-blue-700">
                          {position.salary_range}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 px-5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium">尚無開放職缺</p>
                <Link href="/dashboard/positions">
                  <Button variant="outline" size="sm" className="mt-4">
                    建立職缺
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer tips */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary ring-1 ring-blue-200">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">訊息模板，省下一半打字時間</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              已建立 {templatesCount} 組模板 · 支援 {'{{candidate_name}}'} 等動態變數
            </p>
          </div>
          <Link href="/dashboard/templates">
            <Button variant="outline" size="sm" className="border-blue-200 text-primary hover:bg-white">
              前往管理
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
