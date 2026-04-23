"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import {
  Copy, Edit, MoreVertical, Plus, Trash2, MessageSquare, Mail, Send,
  CheckCircle, XCircle, UserPlus, Sparkles,
} from "lucide-react"
import type { MessageTemplate } from "@/lib/types/database"

const CATEGORIES = [
  { value: "introduction", label: "初次聯繫", icon: UserPlus, tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "follow_up", label: "跟進追蹤", icon: Send, tone: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "interview", label: "面試邀約", icon: MessageSquare, tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "rejection", label: "婉拒通知", icon: XCircle, tone: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "offer", label: "錄取通知", icon: CheckCircle, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
] as const

const DEFAULT_TEMPLATES: Omit<MessageTemplate, "id" | "user_id" | "created_at" | "updated_at">[] = [
  {
    name: "LinkedIn 初次聯繫",
    category: "introduction",
    subject: "職涯機會洽談",
    content: `您好 {{candidate_name}}，\n\n我是 {{recruiter_name}}，專注於{{industry}}領域的獵頭顧問。\n\n注意到您在 {{current_company}} 擔任 {{current_title}} 的經歷非常出色，想與您分享一個難得的職涯機會。\n\n這是一家{{company_type}}公司，正在尋找{{position_title}}的人才。不知道您是否有興趣進一步了解？\n\n期待您的回覆！\n\n{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "一週後跟進",
    category: "follow_up",
    subject: "Re: 職涯機會洽談",
    content: `{{candidate_name}} 您好，\n\n上週有幸與您聯繫，想跟進確認您是否有收到我的訊息？\n\n這個 {{position_title}} 的機會仍然開放，團隊對於擁有您這樣背景的人才非常感興趣。\n\n如果您方便的話，我們可以安排一通簡短的電話，讓我為您詳細介紹這個機會。\n\n謝謝您的時間！\n\n{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "面試邀請",
    category: "interview",
    subject: "面試邀請 - {{company_name}} {{position_title}}",
    content: `親愛的 {{candidate_name}}，\n\n感謝您對 {{company_name}} {{position_title}} 職位的興趣！\n\n我們很高興邀請您參加面試，詳細資訊如下：\n\n日期：{{interview_date}}\n時間：{{interview_time}}\n地點：{{interview_location}}\n面試官：{{interviewer_name}}\n\n請攜帶：\n- 身分證明文件\n- 最新版履歷\n\n如有任何問題，請隨時與我聯繫。\n\n祝您面試順利！\n\n{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "婉拒通知",
    category: "rejection",
    subject: "感謝您的申請 - {{company_name}}",
    content: `親愛的 {{candidate_name}}，\n\n感謝您花時間參與 {{company_name}} {{position_title}} 職位的面試。\n\n經過審慎評估，我們決定選擇另一位更符合目前需求的候選人。這是一個困難的決定，因為您的背景和能力都令人印象深刻。\n\n我們會將您的資料保留在人才庫中，未來若有合適的機會，將優先與您聯繫。\n\n祝您職涯發展順利！\n\n{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "錄取通知",
    category: "offer",
    subject: "恭喜錄取！{{company_name}} {{position_title}}",
    content: `親愛的 {{candidate_name}}，\n\n非常高興通知您，{{company_name}} 決定錄取您擔任 {{position_title}}！\n\n錄取條件如下：\n- 職位：{{position_title}}\n- 薪資：{{salary}}\n- 預計到職日：{{start_date}}\n\n請於 {{deadline}} 前回覆是否接受此 offer。\n\n如有任何問題，歡迎隨時與我聯繫。\n\n再次恭喜您！\n\n{{recruiter_name}}`,
    is_default: true,
  },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    category: "introduction" as MessageTemplate["category"],
    subject: "",
    content: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .order("category")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (!error && data) setTemplates(data)
    setLoading(false)
  }

  async function initializeDefaults() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("message_templates").insert(
      DEFAULT_TEMPLATES.map((t) => ({ ...t, user_id: user.id }))
    )
    if (!error) fetchTemplates()
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingTemplate) {
      await supabase.from("message_templates").update(formData).eq("id", editingTemplate.id)
    } else {
      await supabase.from("message_templates").insert({ ...formData, user_id: user.id })
    }

    setIsDialogOpen(false)
    setEditingTemplate(null)
    setFormData({ name: "", category: "introduction", subject: "", content: "" })
    fetchTemplates()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除模板「${name}」嗎？`)) return
    await supabase.from("message_templates").delete().eq("id", id)
    fetchTemplates()
  }

  function handleEdit(template: MessageTemplate) {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject || "",
      content: template.content,
    })
    setIsDialogOpen(true)
  }

  function handleCopy(content: string, id: string) {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter((t) => t.category === selectedCategory)

  const getCategoryInfo = (category: string) =>
    CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">所有模板</h2>
          <p className="text-sm text-muted-foreground">預先準備好的溝通話術，搭配 {"{{變數}}"} 動態填入</p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && !loading && (
            <Button variant="outline" onClick={initializeDefaults} className="border-blue-200 text-primary hover:bg-blue-50">
              <Sparkles className="mr-1.5 h-4 w-4" />
              載入預設模板
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTemplate(null)
                  setFormData({ name: "", category: "introduction", subject: "", content: "" })
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                新增模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "編輯模板" : "新增模板"}</DialogTitle>
                <DialogDescription>使用 {"{{variable_name}}"} 語法插入動態變數</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>模板名稱</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如：LinkedIn 初次聯繫"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>類別</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as MessageTemplate["category"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>主旨（選填）</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="例如：職涯機會洽談"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>內容</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    placeholder="輸入訊息內容，使用 {{candidate_name}} 等變數..."
                    className="font-mono text-sm"
                  />
                </div>
                <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3">
                  <p className="text-xs font-medium text-blue-700 mb-2">點擊插入常用變數：</p>
                  <div className="flex flex-wrap gap-1">
                    {["candidate_name", "recruiter_name", "company_name", "position_title", "current_company", "current_title", "interview_date", "interview_time", "salary"].map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="text-xs cursor-pointer bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono font-normal"
                        onClick={() => setFormData({ ...formData, content: formData.content + `{{${v}}}` })}
                      >
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                <Button onClick={handleSave} disabled={!formData.name || !formData.content}>儲存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white text-slate-600 border-border hover:border-slate-300"
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const active = selectedCategory === c.value
          return (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-slate-600 border-border hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100 text-primary">
            <Mail className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            {templates.length === 0 ? "尚無模板" : "此類別沒有模板"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {templates.length === 0 ? "載入預設模板或自行建立開始使用" : "試試其他類別"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const info = getCategoryInfo(template.category)
            const CategoryIcon = info.icon
            return (
              <Card
                key={template.id}
                className="py-0 overflow-hidden flex flex-col transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{template.name}</h3>
                      <Badge className={`mt-1.5 text-[11px] font-medium ${info.tone}`}>
                        <CategoryIcon className="mr-1 h-3 w-3" />
                        {info.label}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          編輯
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(template.content, template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          複製內容
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id, template.name)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {template.subject && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">主旨：</span>{template.subject}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap leading-relaxed">
                    {template.content}
                  </p>
                </div>
                <div className="border-t border-border p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-200 text-primary hover:bg-blue-50"
                    onClick={() => handleCopy(template.content, template.id)}
                  >
                    {copiedId === template.id ? (
                      <>
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        已複製到剪貼簿
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        複製
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
