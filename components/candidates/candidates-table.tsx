'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Users,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Candidate, CandidateStatus, CandidateSource } from '@/lib/types/database'
import { STATUS_LABELS, STATUS_COLORS, SOURCE_LABELS } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

interface CandidatesTableProps {
  candidates: Candidate[]
  initialSearch?: string
  initialStatus?: string
  initialSource?: string
}

export function CandidatesTable({
  candidates,
  initialSearch = '',
  initialStatus = 'all',
  initialSource = 'all',
}: CandidatesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [source, setSource] = useState(initialSource)

  const applyFilters = (override?: { search?: string; status?: string; source?: string }) => {
    const next = new URLSearchParams(searchParams.toString())
    const s = override?.search ?? search
    const st = override?.status ?? status
    const sr = override?.source ?? source

    if (s) next.set('search', s)
    else next.delete('search')
    if (st && st !== 'all') next.set('status', st)
    else next.delete('status')
    if (sr && sr !== 'all') next.set('source', sr)
    else next.delete('source')

    router.push(`/dashboard/candidates?${next.toString()}`)
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('all')
    setSource('all')
    router.push('/dashboard/candidates')
  }

  const hasFilters = Boolean(search) || status !== 'all' || source !== 'all'

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`確定要刪除候選人「${name}」嗎？此操作無法復原。`)) return

    const supabase = createClient()
    const { error } = await supabase.from('candidates').delete().eq('id', id)

    if (error) {
      alert('刪除失敗：' + error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-xl border border-border bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜尋姓名、Email、公司、職稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                applyFilters({ status: v })
              }}
            >
              <SelectTrigger className="w-full sm:w-36 border-slate-200">
                <SelectValue placeholder="狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有狀態</SelectItem>
                {(Object.entries(STATUS_LABELS) as [CandidateStatus, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={source}
              onValueChange={(v) => {
                setSource(v)
                applyFilters({ source: v })
              }}
            >
              <SelectTrigger className="w-full sm:w-36 border-slate-200">
                <SelectValue placeholder="來源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有來源</SelectItem>
                {(Object.entries(SOURCE_LABELS) as [CandidateSource, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => applyFilters()} className="shrink-0">
              搜尋
            </Button>
            {hasFilters && (
              <Button variant="ghost" onClick={resetFilters} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>共 <span className="font-semibold text-foreground">{candidates.length}</span> 位候選人</span>
      </div>

      {/* Empty state */}
      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100 text-primary">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            {hasFilters ? '找不到符合條件的候選人' : '尚無候選人資料'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters ? '試試調整篩選條件或清除所有篩選' : '新增第一位候選人開始建立你的人才庫'}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {hasFilters ? (
              <Button variant="outline" onClick={resetFilters}>清除篩選</Button>
            ) : (
              <Link href="/dashboard/candidates/new">
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  新增候選人
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 hover:bg-slate-50/60 border-border">
                  <TableHead className="text-xs font-semibold text-slate-600">姓名</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs font-semibold text-slate-600">公司 / 職稱</TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-semibold text-slate-600">技能</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">狀態</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs font-semibold text-slate-600">來源</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="border-border hover:bg-slate-50/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary font-semibold text-sm ring-1 ring-blue-100">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/candidates/${candidate.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {candidate.name}
                          </Link>
                          {candidate.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="max-w-48">
                        <p className="text-sm font-medium truncate">{candidate.current_title || '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.current_company || '—'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-[11px] h-5 font-normal bg-slate-100 text-slate-700 border-0"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge variant="outline" className="text-[11px] h-5 font-normal">
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[candidate.status]} text-xs font-medium`}>
                        {STATUS_LABELS[candidate.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {SOURCE_LABELS[candidate.source]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作選單</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/candidates/${candidate.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              檢視詳情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/candidates/${candidate.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              編輯
                            </Link>
                          </DropdownMenuItem>
                          {candidate.linkedin_url && (
                            <DropdownMenuItem asChild>
                              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                開啟 LinkedIn
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(candidate.id, candidate.name)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
