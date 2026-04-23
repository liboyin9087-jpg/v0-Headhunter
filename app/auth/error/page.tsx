import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Users } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Headhunter</span>
        </Link>
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">驗證發生錯誤</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            驗證連結可能已過期或無效
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            請嘗試重新註冊，或返回登入頁面再試一次。
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/auth/login" className="flex-1">
              <Button variant="outline" className="w-full">返回登入</Button>
            </Link>
            <Link href="/auth/sign-up" className="flex-1">
              <Button className="w-full">重新註冊</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
