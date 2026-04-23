'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Users, AlertCircle, CheckCircle2, Mail, Sparkles, Brain, MessageSquare } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('密碼不一致')
      return
    }
    if (password.length < 6) {
      setError('密碼至少需要 6 個字元')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200 text-emerald-600">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">確認您的電子郵件</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            我們已發送確認連結至
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="mt-5 rounded-lg bg-slate-50 border border-border p-3 text-xs text-muted-foreground text-left">
            <p className="font-medium text-foreground mb-1">接下來：</p>
            <ul className="space-y-1">
              <li>1. 前往信箱點擊確認連結</li>
              <li>2. 驗證成功後返回登入頁面</li>
              <li>3. 若未收到信件，請檢查垃圾郵件匣</li>
            </ul>
          </div>
          <Link href="/auth/login" className="block mt-6">
            <Button variant="outline" className="w-full">返回登入頁面</Button>
          </Link>
        </div>
      </div>
    )
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
            開始你的
            <br />
            <span className="text-gradient-brand">AI 獵頭</span>工作流
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            免費註冊即可立即使用所有核心功能，無需信用卡，隨時取消。
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: Sparkles, text: 'AI 履歷匹配分析' },
              { icon: Users, text: '無限制候選人建檔' },
              { icon: Brain, text: '智慧面試問題產生' },
              { icon: MessageSquare, text: '訊息模板管理' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-blue-100 text-primary">
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Headhunter</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">建立帳號</h1>
          <p className="mt-1 text-sm text-muted-foreground">免費註冊，無需信用卡</p>

          <form onSubmit={handleSignUp} className="mt-8 space-y-4">
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
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少 6 個字元"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              免費註冊
            </Button>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              註冊即表示您同意我們的服務條款與隱私政策
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            已有帳號？{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
