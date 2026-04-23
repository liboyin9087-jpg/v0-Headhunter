import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CandidateForm } from '@/components/candidates/candidate-form'
import { ArrowLeft } from 'lucide-react'
import type { Candidate } from '@/lib/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCandidatePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/dashboard/candidates/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回候選人詳情
      </Link>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">編輯候選人</h2>
        <p className="text-sm text-muted-foreground mt-1">{candidate.name}</p>
      </div>
      <CandidateForm candidate={candidate as Candidate} mode="edit" />
    </div>
  )
}
