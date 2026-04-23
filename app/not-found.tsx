import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200 text-primary">
          <FileQuestion className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">404</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">找不到此頁面</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          您正在尋找的頁面可能已被移動或不存在。
        </p>
        <Link href="/dashboard" className="block mt-6">
          <Button className="w-full">
            <Home className="mr-1.5 h-4 w-4" />
            返回儀表板
          </Button>
        </Link>
      </div>
    </div>
  )
}
