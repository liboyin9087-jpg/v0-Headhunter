'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'

export function CandidatesHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">所有候選人</h2>
        <p className="text-sm text-muted-foreground">建立、搜尋、篩選並管理你的人才庫</p>
      </div>
      <div className="flex gap-2">
        <Link href="/dashboard/candidates/import">
          <Button variant="outline" className="border-slate-300">
            <Upload className="mr-1.5 h-4 w-4" />
            匯入 CSV
          </Button>
        </Link>
        <Link href="/dashboard/candidates/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            新增候選人
          </Button>
        </Link>
      </div>
    </div>
  )
}
