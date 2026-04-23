import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch counts
  const [candidatesResult, positionsResult, templatesResult] = await Promise.all([
    supabase.from('candidates').select('id', { count: 'exact', head: true }),
    supabase.from('job_positions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('message_templates').select('id', { count: 'exact', head: true }),
  ])

  const candidatesCount = candidatesResult.count ?? 0
  const openPositionsCount = positionsResult.count ?? 0
  const templatesCount = templatesResult.count ?? 0

  // Fetch recent candidates
  const { data: recentCandidates } = await supabase
    .from('candidates')
    .select('id, name, current_title, current_company, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { 
      label: '人才庫', 
      value: candidatesCount, 
      icon: Users, 
      href: '/dashboard/candidates',
      description: '已建檔候選人'
    },
    { 
      label: '開放職缺', 
      value: openPositionsCount, 
      icon: Briefcase, 
      href: '/dashboard/positions',
      description: '正在招募中'
    },
    { 
      label: '訊息模板', 
      value: templatesCount, 
      icon: MessageSquare, 
      href: '/dashboard/templates',
      description: '快速發送訊息'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          歡迎回來{user?.email ? `，${user.email.split('@')[0]}` : ''}
        </h2>
        <p className="text-muted-foreground">
          這是您的獵頭工具控制台，快速掌握招募進度
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              最近新增的候選人
            </CardTitle>
            <CardDescription>您最近新增到人才庫的候選人</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCandidates && recentCandidates.length > 0 ? (
              <ul className="space-y-3">
                {recentCandidates.map((candidate) => (
                  <li key={candidate.id}>
                    <Link 
                      href={`/dashboard/candidates/${candidate.id}`}
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.current_title || '未填寫職稱'}
                            {candidate.current_company && ` @ ${candidate.current_company}`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>尚未新增任何候選人</p>
                <Link 
                  href="/dashboard/candidates/new" 
                  className="text-primary hover:underline text-sm mt-2 inline-block"
                >
                  立即新增第一位候選人
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              快速開始
            </CardTitle>
            <CardDescription>善用這些功能提升您的招募效率</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">建立人才庫</p>
                  <p className="text-sm text-muted-foreground">
                    匯入或手動新增候選人資料，建立您的專屬人才庫
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">管理職缺</p>
                  <p className="text-sm text-muted-foreground">
                    建立客戶職缺需求，方便進行候選人配對
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">訊息模板</p>
                  <p className="text-sm text-muted-foreground">
                    建立常用訊息模板，快速聯繫候選人
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
