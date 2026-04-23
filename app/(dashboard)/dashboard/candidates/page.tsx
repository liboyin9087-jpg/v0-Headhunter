import { createClient } from '@/lib/supabase/server'
import { CandidatesTable } from '@/components/candidates/candidates-table'
import { CandidatesHeader } from '@/components/candidates/candidates-header'
import type { Candidate } from '@/lib/types/database'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    source?: string
  }>
}

export default async function CandidatesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,current_company.ilike.%${params.search}%,current_title.ilike.%${params.search}%`)
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  if (params.source && params.source !== 'all') {
    query = query.eq('source', params.source)
  }

  const { data: candidates, error } = await query

  if (error) {
    console.error('Error fetching candidates:', error)
  }

  return (
    <div className="space-y-6">
      <CandidatesHeader />
      <CandidatesTable 
        candidates={(candidates as Candidate[]) || []} 
        initialSearch={params.search}
        initialStatus={params.status}
        initialSource={params.source}
      />
    </div>
  )
}
