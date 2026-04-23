import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Brain,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LineChart,
  Shield,
  Zap,
  Search,
  Target,
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: Users,
      title: '集中化人才庫',
      description: '建立結構化的候選人資料庫，支援多維度搜尋、標籤與狀態追蹤，讓每一次溝通都有跡可循。',
    },
    {
      icon: Brain,
      title: 'AI 履歷匹配',
      description: '以 LLM 自動分析履歷與職缺，產出匹配分數、優勢分析、面試問題，決策更快速也更有根據。',
    },
    {
      icon: MessageSquare,
      title: '動態訊息模板',
      description: '預設專業話術模板，支援 {{變數}} 動態帶入，LinkedIn、Email 溝通效率翻倍。',
    },
    {
      icon: LineChart,
      title: '轉換漏斗追蹤',
      description: '從新進到入職的完整 pipeline 視圖，即時掌握招募進度與瓶頸階段。',
    },
    {
      icon: Shield,
      title: '企業級資料安全',
      description: 'Supabase Row Level Security 確保資料隔離，每位使用者僅能存取自己的資料。',
    },
    {
      icon: Zap,
      title: '快速 CSV 匯入',
      description: '支援既有人才庫一鍵匯入，中英文欄位自動辨識，無縫銜接你的工作流程。',
    },
  ]

  const stats = [
    { value: '50%+', label: '節省搜尋時間' },
    { value: '3x', label: '提升溝通效率' },
    { value: '24/7', label: 'AI 隨時待命' },
    { value: '100%', label: '資料加密隔離' },
  ]

  const flow = [
    { icon: Search, title: '建立人才庫', desc: '匯入或手動新增候選人' },
    { icon: Target, title: '設定職缺', desc: '輸入客戶需求與條件' },
    { icon: Sparkles, title: 'AI 智慧匹配', desc: '自動產生匹配分析報告' },
    { icon: MessageSquare, title: '精準溝通', desc: '套用模板快速聯繫' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Headhunter</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">功能</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">工作流程</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">優勢</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">登入</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">免費試用</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative bg-brand-gradient">
          <div className="container mx-auto px-4 sm:px-6 py-20 lg:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                AI 驅動的獵頭工作平台
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
                讓每一位獵頭顧問
                <br />
                都擁有<span className="text-gradient-brand">超級助理</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                從人才搜尋、履歷分析到候選人溝通，Headhunter 整合了獵頭日常工作的所有環節，
                讓你專注在真正重要的事：<span className="font-medium text-foreground">找到對的人</span>。
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-6 shadow-sm">
                    免費開始使用
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 border-slate-300">
                    已有帳號登入
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                免費註冊 · 無需信用卡 · 隨時取消
              </p>
            </div>

            {/* Stats strip */}
            <div className="mt-16 mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl bg-border overflow-hidden shadow-sm border border-border">
              {stats.map((s) => (
                <div key={s.label} className="bg-white px-6 py-5 text-center">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="outline" className="mb-4 rounded-full border-blue-200 text-blue-700 bg-blue-50">核心功能</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                一站式獵頭工作平台
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                專為獵頭日常工作設計，每一個功能都來自真實場景的需求。
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative rounded-xl border border-border bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-primary ring-1 ring-blue-100">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="py-20 lg:py-24 bg-slate-50/50 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <Badge variant="outline" className="mb-4 rounded-full border-blue-200 text-blue-700 bg-blue-50">工作流程</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                四步驟完成整個招募旅程
              </h2>
            </div>

            <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flow.map((step, idx) => (
                <div key={step.title} className="relative">
                  <div className="rounded-xl border border-border bg-white p-5 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                  {idx < flow.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="outline" className="mb-4 rounded-full border-blue-200 text-blue-700 bg-blue-50">為什麼選擇我們</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
                  獵頭工作的每個環節
                  <br />
                  都值得更聰明的工具
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  傳統 Excel + LinkedIn 訊息的工作方式，正在被 AI 原生工作流所取代。
                  加入領先的獵頭顧問，重新定義你的工作節奏。
                </p>
                <div className="mt-8">
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="h-12 px-6">
                      立即免費試用
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  '節省超過 50% 的候選人搜尋與整理時間',
                  'AI 匹配分析讓面試轉換率大幅提升',
                  '統一平台管理所有職缺與候選人生命週期',
                  '動態訊息模板大幅降低重複性勞動',
                  'Supabase RLS 確保每筆資料僅你可見',
                  '支援 CSV 匯入，無痛遷移既有資料',
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 rounded-lg border border-border bg-white p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground shadow-xl sm:px-12">
              <div className="absolute inset-0 bg-dot-grid opacity-10" />
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  準備好重新定義你的獵頭工作了嗎？
                </h2>
                <p className="mt-4 text-base lg:text-lg opacity-90 max-w-xl mx-auto">
                  免費註冊即可使用所有核心功能，無需信用卡。
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/auth/sign-up">
                    <Button size="lg" variant="secondary" className="h-12 px-6 bg-white text-primary hover:bg-white/90">
                      免費開始使用
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="ghost" className="h-12 px-6 text-white hover:bg-white/10 hover:text-white">
                      已有帳號？登入
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Users className="h-4 w-4" />
            </div>
            <span>© 2026 Headhunter. 專為獵頭顧問打造。</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">登入</Link>
            <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">註冊</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
