'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';

export function CandidatesHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">人才庫</h2>
        <p className="text-muted-foreground">管理您的所有候選人資料</p>
      </div>
      <div className="flex gap-2">
        <Link href="/dashboard/candidates/import">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            匯入 CSV
          </Button>
        </Link>
        <Link href="/dashboard/candidates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增候選人
          </Button>
        </Link>
      </div>
    </div>
  )
}
