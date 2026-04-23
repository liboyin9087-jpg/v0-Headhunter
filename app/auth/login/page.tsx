'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Users, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials' ? '帳號或密碼錯誤' : error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex items-center justify-center p-12 bg-brand-gradient overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="relative max-w-md">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Headhunter</span>
          </Link>
          <h2 className="mt-10 text-3xl font-bold tracking-tight text-balance leading-tight">
            歡迎回來，
            <br />
            繼續你的<span className="text-gradient-brand">高效招募</span>之旅
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            登入您的帳號，管理人才庫、啟動 AI 匹配分析，並使用所有專業工具。
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: Sparkles, text: 'AI 履歷匹配分析，一鍵產出面試建議' },
              { icon: CheckCircle2, text: '完整候選人生命週期追蹤' },
              { icon: Users, text: '結構化人才庫，搜尋快速精準' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-slate-700">
                <item.icon className="h-4 w-4 text-primary" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <Link href="/" className="flex items-center gap-2.5 lg:hidden mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Headhunter</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">登入帳號</h1>
          <p className="mt-1 text-sm text-muted-foreground">輸入您的 Email 與密碼繼續使用</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-red-50 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密碼</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  忘記密碼？
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              登入
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            還沒有帳號？{' '}
            <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
              立即免費註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
