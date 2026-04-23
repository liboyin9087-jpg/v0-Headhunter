'use client';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': '總覽',
  '/dashboard/candidates': '人才庫',
  '/dashboard/positions': '職缺管理',
  '/dashboard/analysis': 'AI 履歷分析',
  '/dashboard/templates': '訊息模板',
}

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Get page title from pathname
  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname === path || (path !== '/dashboard' && pathname.startsWith(path))) {
        return title
      }
    }
    return '獵頭工具'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 backdrop-blur px-4 lg:px-6">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">管理您的帳號</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            個人資料
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            設定
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            登出
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
