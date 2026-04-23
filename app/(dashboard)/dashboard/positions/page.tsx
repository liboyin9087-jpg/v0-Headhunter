"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Edit, MapPin, MoreVertical, Plus, Trash2, Briefcase, DollarSign, CheckCircle, Clock, Pause } from "lucide-react";
import type { JobPosition } from "@/lib/types/database";

const STATUS_CONFIG = {
  open: { label: "招募中", variant: "default" as const, icon: CheckCircle },
  closed: { label: "已關閉", variant: "secondary" as const, icon: Clock },
  on_hold: { label: "暫停", variant: "outline" as const, icon: Pause },
}

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

    if (!error && data) {
      setPositions(data)
    }
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

  async function handleDelete(id: string) {
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">職缺管理</h1>
          <p className="text-muted-foreground mt-1">
            管理客戶職缺需求，用於 AI 履歷分析匹配
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPosition(null)
              resetForm()
            }}>
              <Plus className="mr-2 h-4 w-4" />
              新增職缺
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPosition ? "編輯職缺" : "新增職缺"}</DialogTitle>
              <DialogDescription>
                填寫職缺資訊，用於 AI 分析候選人匹配度
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">職位名稱 *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：資深前端工程師"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">公司名稱 *</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="例如：某某科技公司"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">工作地點</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="例如：台北市 / 遠端"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">薪資範圍</label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="例如：年薪 120-180 萬"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">職缺描述 *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="描述工作內容、團隊狀況、公司文化等..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">必備條件（每行一個）</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  placeholder="5 年以上前端開發經驗&#10;精通 React/Vue&#10;良好的溝通能力"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">加分條件（每行一個）</label>
                <Textarea
                  value={formData.nice_to_have}
                  onChange={(e) => setFormData({ ...formData, nice_to_have: e.target.value })}
                  rows={3}
                  placeholder="有技術團隊 Lead 經驗&#10;熟悉 CI/CD 流程"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">狀態</label>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
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

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          全部 ({positions.length})
        </Button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon
          return (
            <Button
              key={key}
              variant={filterStatus === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(key)}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {config.label} ({statusCounts[key as keyof typeof statusCounts]})
            </Button>
          )
        })}
      </div>

      {/* Positions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredPositions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {positions.length === 0 ? "還沒有任何職缺，點擊「新增職缺」開始" : "此狀態沒有職缺"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPositions.map((position) => {
            const statusConfig = STATUS_CONFIG[position.status]
            const StatusIcon = statusConfig.icon

            return (
              <Card key={position.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{position.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {position.company}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(position)}>
                          <Edit className="mr-2 h-4 w-4" />
                          編輯
                        </DropdownMenuItem>
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
                        <DropdownMenuItem
                          onClick={() => handleDelete(position.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusConfig.variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                    {position.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="mr-1 h-3 w-3" />
                        {position.location}
                      </Badge>
                    )}
                  </div>
                  
                  {position.salary_range && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      {position.salary_range}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {position.description}
                  </p>

                  {position.requirements && position.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {position.requirements.slice(0, 3).map((req, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {req.length > 15 ? req.slice(0, 15) + "..." : req}
                        </Badge>
                      ))}
                      {position.requirements.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{position.requirements.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
