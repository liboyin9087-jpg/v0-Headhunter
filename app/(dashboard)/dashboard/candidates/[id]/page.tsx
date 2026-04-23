import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Brain
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

  const typedCandidate = candidate as Candidate

  // Fetch tracking logs
  const { data: logs } = await supabase
    .from('tracking_logs')
    .select('*')
    .eq('candidate_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/candidates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
              {typedCandidate.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{typedCandidate.name}</h2>
              <p className="text-muted-foreground">
                {typedCandidate.current_title || '未填寫職稱'}
                {typedCandidate.current_company && ` @ ${typedCandidate.current_company}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 pl-12 sm:pl-0">
          <Link href={`/dashboard/analysis?candidate=${id}`}>
            <Button variant="outline">
              <Brain className="mr-2 h-4 w-4" />
              AI 分析
            </Button>
          </Link>
          <Link href={`/dashboard/candidates/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              編輯
            </Button>
          </Link>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 pl-12 sm:pl-0">
        <Badge className={STATUS_COLORS[typedCandidate.status]}>
          {STATUS_LABELS[typedCandidate.status]}
        </Badge>
        <Badge variant="outline">{SOURCE_LABELS[typedCandidate.source]}</Badge>
        {typedCandidate.experience_years && (
          <Badge variant="secondary">{typedCandidate.experience_years} 年經驗</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typedCandidate.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${typedCandidate.email}`} className="text-primary hover:underline">
                    {typedCandidate.email}
                  </a>
                </div>
              )}
              {typedCandidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${typedCandidate.phone}`} className="text-primary hover:underline">
                    {typedCandidate.phone}
                  </a>
                </div>
              )}
              {typedCandidate.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{typedCandidate.location}</span>
                </div>
              )}
              {typedCandidate.current_company && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span>{typedCandidate.current_company}</span>
                </div>
              )}
              {typedCandidate.current_title && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <span>{typedCandidate.current_title}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {typedCandidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>技能</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {typedCandidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume */}
          {typedCandidate.resume_text && (
            <Card>
              <CardHeader>
                <CardTitle>履歷內容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {typedCandidate.resume_text}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {typedCandidate.notes && (
            <Card>
              <CardHeader>
                <CardTitle>備註</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {typedCandidate.notes}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* External Links */}
          {(typedCandidate.linkedin_url || typedCandidate.github_url) && (
            <Card>
              <CardHeader>
                <CardTitle>外部連結</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {typedCandidate.linkedin_url && (
                  <a
                    href={typedCandidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {typedCandidate.github_url && (
                  <a
                    href={typedCandidate.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>活動記錄</CardTitle>
            </CardHeader>
            <CardContent>
              {logs && logs.length > 0 ? (
                <ul className="space-y-4">
                  {logs.map((log) => (
                    <li key={log.id} className="flex gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        {log.notes && (
                          <p className="text-muted-foreground">{log.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  尚無活動記錄
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>時間資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">建立時間</span>
                <span>{new Date(typedCandidate.created_at).toLocaleDateString('zh-TW')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">最後更新</span>
                <span>{new Date(typedCandidate.updated_at).toLocaleDateString('zh-TW')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
