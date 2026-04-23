import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CandidateForm } from '@/components/candidates/candidate-form'
import { Button } from '@/components/ui/button'
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
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/candidates/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">編輯候選人</h2>
          <p className="text-muted-foreground">{candidate.name}</p>
        </div>
      </div>

      <CandidateForm candidate={candidate as Candidate} mode="edit" />
    </div>
  )
}
