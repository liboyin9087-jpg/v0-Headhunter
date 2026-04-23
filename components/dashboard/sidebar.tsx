'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import {
  Users,
  Briefcase,
  MessageSquare,
  LayoutDashboard,
  Brain,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navSections: Array<{
  label: string
  items: Array<{ href: string; label: string; icon: typeof Users; description?: string }>
}> = [
  {
    label: '總覽',
    items: [
      { href: '/dashboard', label: '儀表板', icon: LayoutDashboard },
    ],
  },
  {
    label: '人才運營',
    items: [
      { href: '/dashboard/candidates', label: '人才庫', icon: Users },
      { href: '/dashboard/positions', label: '職缺管理', icon: Briefcase },
    ],
  },
  {
    label: '工具',
    items: [
      { href: '/dashboard/analysis', label: 'AI 匹配分析', icon: Brain },
      { href: '/dashboard/templates', label: '訊息模板', icon: MessageSquare },
    ],
  },
]

interface DashboardSidebarProps {
  user: User
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActiveLink = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <>
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden bg-white border border-border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? '關閉選單' : '開啟選單'}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Headhunter</div>
              <div className="text-[11px] text-muted-foreground">Recruiter Workspace</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-6">
              {navSections.map((section) => (
                <div key={section.label}>
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {section.label}
                  </div>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActiveLink(item.href)
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-slate-600 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <item.icon className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100')} />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Upgrade hint card */}
            <div className="mt-8 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">善用 AI 工具</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                試試 AI 匹配分析，讓 AI 為你評估候選人契合度。
              </p>
              <Link href="/dashboard/analysis">
                <Button size="sm" className="mt-3 w-full h-8 text-xs">
                  立即試用
                </Button>
              </Link>
            </div>
          </nav>

          {/* User card */}
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 rounded-md bg-white/60 border border-border px-2.5 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-xs font-medium truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
