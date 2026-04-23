import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Users } from 'lucide-react'

export default function SignUpSuccessPage() {
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200 text-primary">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">請查收您的信箱</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            我們已發送驗證信至您的電子郵件地址
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            請點擊信件中的連結完成帳號驗證。
            <br />
            如果沒有收到信件，請檢查垃圾郵件匣。
          </p>
          <Link href="/auth/login" className="block mt-6">
            <Button variant="outline" className="w-full">返回登入頁面</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
