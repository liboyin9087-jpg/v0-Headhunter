import { CandidateForm } from '@/components/candidates/candidate-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCandidatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">新增候選人</h2>
          <p className="text-muted-foreground">填寫候選人資料</p>
        </div>
      </div>

      <CandidateForm mode="create" />
    </div>
  )
}
