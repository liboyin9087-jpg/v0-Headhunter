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
import { Card } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { 
  Search, 
  Users, 
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
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
  initialSource = 'all'
}: CandidatesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [source, setSource] = useState(initialSource)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    
    if (status && status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    
    if (source && source !== 'all') {
      params.set('source', source)
    } else {
      params.delete('source')
    }

    router.push(`/dashboard/candidates?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此候選人嗎？此操作無法復原。')) return
    
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
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜尋姓名、公司、職稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              {(Object.entries(STATUS_LABELS) as [CandidateStatus, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="來源" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有來源</SelectItem>
              {(Object.entries(SOURCE_LABELS) as [CandidateSource, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>搜尋</Button>
        </div>
      </Card>

      {/* Table */}
      {candidates.length === 0 ? (
        <Empty
          icon={Users}
          title="尚無候選人資料"
          description="開始新增候選人或匯入 CSV 檔案"
          action={
            <Link href="/dashboard/candidates/new">
              <Button>新增候選人</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead className="hidden sm:table-cell">公司 / 職稱</TableHead>
                  <TableHead className="hidden md:table-cell">技能</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="hidden lg:table-cell">來源</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <Link 
                            href={`/dashboard/candidates/${candidate.id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {candidate.name}
                          </Link>
                          {candidate.email && (
                            <p className="text-sm text-muted-foreground truncate">
                              {candidate.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="max-w-48">
                        <p className="font-medium truncate">{candidate.current_title || '-'}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {candidate.current_company || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[candidate.status]}>
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
                            onClick={() => handleDelete(candidate.id)}
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
        </Card>
      )}
    </div>
  )
}
