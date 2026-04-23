'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User as UserIcon, Plus, ChevronRight, HelpCircle } from 'lucide-react'

interface PageMeta {
  title: string
  description?: string
  breadcrumb?: string
}

const pageMeta: Record<string, PageMeta> = {
  '/dashboard': { title: '儀表板', description: '掌握整體招募進度' },
  '/dashboard/candidates': { title: '人才庫', description: '管理所有候選人資料' },
  '/dashboard/candidates/new': { title: '新增候選人', breadcrumb: '人才庫' },
  '/dashboard/candidates/import': { title: '批次匯入', breadcrumb: '人才庫' },
  '/dashboard/positions': { title: '職缺管理', description: '管理客戶職缺需求' },
  '/dashboard/analysis': { title: 'AI 匹配分析', description: '用 AI 評估候選人與職缺的契合度' },
  '/dashboard/templates': { title: '訊息模板', description: '管理常用聯繫話術' },
}

function getPageMeta(pathname: string): PageMeta {
  if (pageMeta[pathname]) return pageMeta[pathname]

  // Dynamic routes
  if (pathname.startsWith('/dashboard/candidates/') && pathname.endsWith('/edit')) {
    return { title: '編輯候選人', breadcrumb: '人才庫' }
  }
  if (pathname.startsWith('/dashboard/candidates/') && pathname !== '/dashboard/candidates/new' && pathname !== '/dashboard/candidates/import') {
    return { title: '候選人詳情', breadcrumb: '人才庫' }
  }

  // Fallback
  for (const [path, meta] of Object.entries(pageMeta)) {
    if (path !== '/dashboard' && pathname.startsWith(path)) return meta
  }
  return { title: 'Headhunter' }
}

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const meta = getPageMeta(pathname)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8 gap-4">
        <div className="pl-12 lg:pl-0 min-w-0">
          {meta.breadcrumb && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
              <span>{meta.breadcrumb}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{meta.title}</span>
            </div>
          )}
          <h1 className="text-base font-semibold tracking-tight truncate">{meta.title}</h1>
          {meta.description && !meta.breadcrumb && (
            <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick action for new candidate */}
          <Link href="/dashboard/candidates/new" className="hidden sm:inline-flex">
            <Button size="sm" className="h-9">
              <Plus className="mr-1.5 h-4 w-4" />
              新增候選人
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 pl-1.5 pr-2 hover:bg-muted">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="py-2">
                <div className="text-sm font-medium">{user.email?.split('@')[0]}</div>
                <div className="text-xs text-muted-foreground font-normal truncate">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                個人資料
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                帳號設定
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                說明文件
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
