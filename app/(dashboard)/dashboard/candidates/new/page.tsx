import { CandidateForm } from '@/components/candidates/candidate-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewCandidatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回人才庫
      </Link>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">新增候選人</h2>
        <p className="text-sm text-muted-foreground mt-1">填寫候選人資料建立完整檔案</p>
      </div>
      <CandidateForm mode="create" />
    </div>
  )
}
