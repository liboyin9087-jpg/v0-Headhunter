"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import {
  Building2,
  Edit,
  MapPin,
  MoreVertical,
  Plus,
  Trash2,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  Pause,
} from "lucide-react"
import type { JobPosition } from "@/lib/types/database"

const STATUS_CONFIG = {
  open: {
    label: "招募中",
    icon: CheckCircle,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "已關閉",
    icon: Clock,
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    dot: "bg-slate-400",
  },
  on_hold: {
    label: "暫停",
    icon: Pause,
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
} as const

export default function PositionsPage() {
  const [positions, setPositions] = useState<JobPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    nice_to_have: "",
    salary_range: "",
    location: "",
    status: "open" as JobPosition["status"],
  })

  const supabase = createClient()

  useEffect(() => {
    fetchPositions()
  }, [])

  async function fetchPositions() {
    setLoading(true)
    const { data, error } = await supabase
      .from("job_positions")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) setPositions(data)
    setLoading(false)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      title: formData.title,
      company: formData.company,
      description: formData.description,
      requirements: formData.requirements.split("\n").filter(Boolean),
      nice_to_have: formData.nice_to_have.split("\n").filter(Boolean),
      salary_range: formData.salary_range || null,
      location: formData.location || null,
      status: formData.status,
    }

    if (editingPosition) {
      await supabase.from("job_positions").update(payload).eq("id", editingPosition.id)
    } else {
      await supabase.from("job_positions").insert({ ...payload, user_id: user.id })
    }

    setIsDialogOpen(false)
    setEditingPosition(null)
    resetForm()
    fetchPositions()
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`確定要刪除職缺「${title}」嗎？`)) return
    await supabase.from("job_positions").delete().eq("id", id)
    fetchPositions()
  }

  async function handleStatusChange(id: string, status: JobPosition["status"]) {
    await supabase.from("job_positions").update({ status }).eq("id", id)
    fetchPositions()
  }

  function handleEdit(position: JobPosition) {
    setEditingPosition(position)
    setFormData({
      title: position.title,
      company: position.company,
      description: position.description,
      requirements: position.requirements?.join("\n") || "",
      nice_to_have: position.nice_to_have?.join("\n") || "",
      salary_range: position.salary_range || "",
      location: position.location || "",
      status: position.status,
    })
    setIsDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      title: "",
      company: "",
      description: "",
      requirements: "",
      nice_to_have: "",
      salary_range: "",
      location: "",
      status: "open",
    })
  }

  const filteredPositions = filterStatus === "all"
    ? positions
    : positions.filter((p) => p.status === filterStatus)

  const statusCounts = {
    open: positions.filter((p) => p.status === "open").length,
    closed: positions.filter((p) => p.status === "closed").length,
    on_hold: positions.filter((p) => p.status === "on_hold").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">所有職缺</h2>
          <p className="text-sm text-muted-foreground">管理客戶職缺，作為 AI 匹配的基礎</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPosition(null); resetForm() }}>
              <Plus className="mr-1.5 h-4 w-4" />
              新增職缺
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPosition ? "編輯職缺" : "新增職缺"}</DialogTitle>
              <DialogDescription>填寫職缺資訊，可作為 AI 分析的職缺描述</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>職位名稱 *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：資深前端工程師"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>公司名稱 *</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="例如：某某科技公司"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>工作地點</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="例如：台北市 / 遠端"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>薪資範圍</Label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="例如：年薪 120-180 萬"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>職缺描述 *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="描述工作內容、團隊狀況、公司文化等..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>必備條件（每行一個）</Label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  placeholder="5 年以上前端開發經驗&#10;精通 React/Vue&#10;良好的溝通能力"
                />
              </div>
              <div className="space-y-1.5">
                <Label>加分條件（每行一個）</Label>
                <Textarea
                  value={formData.nice_to_have}
                  onChange={(e) => setFormData({ ...formData, nice_to_have: e.target.value })}
                  rows={3}
                  placeholder="有技術團隊 Lead 經驗&#10;熟悉 CI/CD 流程"
                />
              </div>
              <div className="space-y-1.5">
                <Label>狀態</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as JobPosition["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">招募中</SelectItem>
                    <SelectItem value="on_hold">暫停</SelectItem>
                    <SelectItem value="closed">已關閉</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
              <Button
                onClick={handleSave}
                disabled={!formData.title || !formData.company || !formData.description}
              >
                儲存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filterStatus === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white text-slate-600 border-border hover:border-slate-300"
          }`}
        >
          全部
          <span className={`rounded px-1.5 py-0.5 text-[11px] ${filterStatus === "all" ? "bg-primary-foreground/20" : "bg-slate-100"}`}>
            {positions.length}
          </span>
        </button>
        {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => {
          const active = filterStatus === key
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-slate-600 border-border hover:border-slate-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span className={`rounded px-1.5 py-0.5 text-[11px] ${active ? "bg-primary-foreground/20" : "bg-slate-100"}`}>
                {statusCounts[key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : filteredPositions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600">
            <Briefcase className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            {positions.length === 0 ? "尚無職缺資料" : "此狀態沒有職缺"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {positions.length === 0 ? "點擊右上角「新增職缺」建立第一筆資料" : "試試切換其他狀態標籤"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPositions.map((position) => {
            const cfg = STATUS_CONFIG[position.status]
            return (
              <Card
                key={position.id}
                className="py-0 transition-all hover:border-blue-200 hover:shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{position.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{position.company}</span>
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(position)}>
                          <Edit className="mr-2 h-4 w-4" />
                          編輯
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {position.status !== "open" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(position.id, "open")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            設為招募中
                          </DropdownMenuItem>
                        )}
                        {position.status !== "on_hold" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(position.id, "on_hold")}>
                            <Pause className="mr-2 h-4 w-4" />
                            暫停招募
                          </DropdownMenuItem>
                        )}
                        {position.status !== "closed" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(position.id, "closed")}>
                            <Clock className="mr-2 h-4 w-4" />
                            關閉職缺
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(position.id, position.title)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge className={`${cfg.badge} text-xs font-medium`}>{cfg.label}</Badge>
                    {position.location && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <MapPin className="mr-1 h-3 w-3" />
                        {position.location}
                      </Badge>
                    )}
                  </div>

                  {position.salary_range && (
                    <div className="mt-3 flex items-center gap-1 text-sm text-primary">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="font-medium">{position.salary_range}</span>
                    </div>
                  )}

                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {position.description}
                  </p>

                  {position.requirements && position.requirements.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">必備條件</p>
                      <div className="flex flex-wrap gap-1">
                        {position.requirements.slice(0, 3).map((req, i) => (
                          <Badge key={i} variant="secondary" className="text-[11px] h-5 bg-slate-100 text-slate-700 border-0 font-normal">
                            {req.length > 12 ? req.slice(0, 12) + "..." : req}
                          </Badge>
                        ))}
                        {position.requirements.length > 3 && (
                          <Badge variant="outline" className="text-[11px] h-5 font-normal">
                            +{position.requirements.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
