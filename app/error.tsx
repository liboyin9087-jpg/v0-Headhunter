'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">發生錯誤</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          很抱歉，這個頁面載入時出了點問題。
        </p>
        {error.digest && (
          <p className="mt-4 rounded-md bg-slate-50 border border-border px-3 py-2 text-xs text-muted-foreground font-mono">
            錯誤代碼：{error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={reset} className="flex-1">
            <RotateCcw className="mr-1.5 h-4 w-4" />
            重試
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">
              <Home className="mr-1.5 h-4 w-4" />
              返回首頁
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
