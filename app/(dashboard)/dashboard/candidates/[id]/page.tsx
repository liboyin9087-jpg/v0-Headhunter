import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  ExternalLink,
  Calendar,
  Brain,
  Linkedin,
  Github,
  Clock,
  CalendarDays,
} from 'lucide-react'
import type { Candidate } from '@/lib/types/database'
import { STATUS_LABELS, STATUS_COLORS, SOURCE_LABELS } from '@/lib/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  const typed = candidate as Candidate

  const { data: logs } = await supabase
    .from('tracking_logs')
    .select('*')
    .eq('candidate_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回人才庫
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl border border-border bg-white p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl font-semibold shadow-sm">
              {typed.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{typed.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {typed.current_title || '未填寫職稱'}
                {typed.current_company && <> · <span className="font-medium">{typed.current_company}</span></>}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge className={`${STATUS_COLORS[typed.status]} text-xs font-medium`}>
                  {STATUS_LABELS[typed.status]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  來源：{SOURCE_LABELS[typed.source]}
                </Badge>
                {typed.experience_years !== null && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                    {typed.experience_years} 年經驗
                  </Badge>
                )}
                {typed.location && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="mr-1 h-3 w-3" />
                    {typed.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href={`/dashboard/analysis?candidate=${id}`}>
              <Button variant="outline" className="border-blue-200 text-primary hover:bg-blue-50">
                <Brain className="mr-1.5 h-4 w-4" />
                AI 分析
              </Button>
            </Link>
            <Link href={`/dashboard/candidates/${id}/edit`}>
              <Button>
                <Edit className="mr-1.5 h-4 w-4" />
                編輯
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <Card className="py-0 overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-semibold text-sm">聯絡資訊</h3>
            </div>
            <CardContent className="p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                {typed.email && (
                  <ContactRow icon={Mail} label="電子郵件">
                    <a href={`mailto:${typed.email}`} className="text-primary hover:underline">
                      {typed.email}
                    </a>
                  </ContactRow>
                )}
                {typed.phone && (
                  <ContactRow icon={Phone} label="電話">
                    <a href={`tel:${typed.phone}`} className="text-primary hover:underline">
                      {typed.phone}
                    </a>
                  </ContactRow>
                )}
                {typed.current_company && (
                  <ContactRow icon={Building} label="公司">
                    {typed.current_company}
                  </ContactRow>
                )}
                {typed.current_title && (
                  <ContactRow icon={Briefcase} label="職稱">
                    {typed.current_title}
                  </ContactRow>
                )}
                {typed.location && (
                  <ContactRow icon={MapPin} label="地區">
                    {typed.location}
                  </ContactRow>
                )}
                {typed.experience_years !== null && (
                  <ContactRow icon={Clock} label="年資">
                    {typed.experience_years} 年
                  </ContactRow>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Skills */}
          {typed.skills.length > 0 && (
            <Card className="py-0 overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="font-semibold text-sm">技能標籤</h3>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-1.5">
                  {typed.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border border-blue-200 font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume */}
          {typed.resume_text && (
            <Card className="py-0 overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="font-semibold text-sm">履歷內容</h3>
              </div>
              <CardContent className="p-5">
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {typed.resume_text}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {typed.notes && (
            <Card className="py-0 overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="font-semibold text-sm">備註</h3>
              </div>
              <CardContent className="p-5">
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {typed.notes}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* External links */}
          {(typed.linkedin_url || typed.github_url) && (
            <Card className="py-0 overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="font-semibold text-sm">外部連結</h3>
              </div>
              <CardContent className="p-3 space-y-1">
                {typed.linkedin_url && (
                  <a
                    href={typed.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-slate-50 transition-colors group"
                  >
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    <span className="flex-1">LinkedIn</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}
                {typed.github_url && (
                  <a
                    href={typed.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-slate-50 transition-colors group"
                  >
                    <Github className="h-4 w-4" />
                    <span className="flex-1">GitHub</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <Card className="py-0 overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-semibold text-sm">活動記錄</h3>
            </div>
            <CardContent className="p-5">
              {logs && logs.length > 0 ? (
                <ul className="space-y-4">
                  {logs.map((log) => (
                    <li key={log.id} className="relative pl-5 pb-4 border-l border-border last:pb-0">
                      <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white" />
                      <p className="text-sm font-medium">{log.action}</p>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">尚無活動記錄</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="py-0 overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-semibold text-sm">時間資訊</h3>
            </div>
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  建立時間
                </span>
                <span className="font-medium">
                  {new Date(typed.created_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  最後更新
                </span>
                <span className="font-medium">
                  {new Date(typed.updated_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate mt-0.5">{children}</div>
      </div>
    </div>
  )
}
