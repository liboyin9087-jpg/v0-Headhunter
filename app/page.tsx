import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Brain, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: Users,
      title: '人才庫管理',
      description: '集中管理所有候選人資料，支援多維度搜尋與狀態追蹤',
    },
    {
      icon: Brain,
      title: 'AI 履歷分析',
      description: '使用 AI 智慧分析履歷與職缺匹配度，快速篩選最佳人選',
    },
    {
      icon: MessageSquare,
      title: '訊息模板',
      description: '建立常用訊息模板，支援動態變數，提升溝通效率',
    },
  ]

  const benefits = [
    '節省 50% 以上的候選人搜尋時間',
    '智慧匹配提升面試轉換率',
    '統一管理所有招募流程',
    '資料安全加密保護',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">獵頭工具</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">登入</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>免費註冊</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance max-w-4xl mx-auto">
              專為獵頭打造的
              <span className="text-primary">一站式</span>
              人才管理工具
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              從候選人搜尋、履歷分析到訊息發送，獵頭工具幫您簡化所有招募流程，提升工作效率
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  免費開始使用
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  登入帳號
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div 
                  key={feature.title} 
                  className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">為什麼選擇獵頭工具？</h2>
              <ul className="grid sm:grid-cols-2 gap-4 text-left">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">立即開始提升您的招募效率</h2>
            <p className="text-lg opacity-90 mb-8">免費註冊，無需信用卡</p>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                免費註冊
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>2026 獵頭工具。專為獵頭顧問打造的人才管理解決方案。</p>
        </div>
      </footer>
    </div>
  )
}
