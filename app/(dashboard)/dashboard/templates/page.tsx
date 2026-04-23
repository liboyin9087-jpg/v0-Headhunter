"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Copy, Edit, MoreVertical, Plus, Trash2, MessageSquare, Mail, Send, CheckCircle, XCircle, UserPlus } from "lucide-react"
import type { MessageTemplate } from "@/lib/types/database"

const CATEGORIES = [
  { value: "introduction", label: "初次聯繫", icon: UserPlus },
  { value: "follow_up", label: "跟進追蹤", icon: Send },
  { value: "interview", label: "面試邀約", icon: MessageSquare },
  { value: "rejection", label: "婉拒通知", icon: XCircle },
  { value: "offer", label: "錄取通知", icon: CheckCircle },
] as const

const DEFAULT_TEMPLATES: Omit<MessageTemplate, "id" | "user_id" | "created_at" | "updated_at">[] = [
  {
    name: "LinkedIn 初次聯繫",
    category: "introduction",
    subject: "職涯機會洽談",
    content: `您好 {{candidate_name}}，

我是 {{recruiter_name}}，專注於{{industry}}領域的獵頭顧問。

注意到您在 {{current_company}} 擔任 {{current_title}} 的經歷非常出色，想與您分享一個難得的職涯機會。

這是一家{{company_type}}公司，正在尋找{{position_title}}的人才。不知道您是否有興趣進一步了解？

期待您的回覆！

{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "一週後跟進",
    category: "follow_up",
    subject: "Re: 職涯機會洽談",
    content: `{{candidate_name}} 您好，

上週有幸與您聯繫，想跟進確認您是否有收到我的訊息？

這個 {{position_title}} 的機會仍然開放，團隊對於擁有您這樣背景的人才非常感興趣。

如果您方便的話，我們可以安排一通簡短的電話，讓我為您詳細介紹這個機會。

謝謝您的時間！

{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "面試邀請",
    category: "interview",
    subject: "面試邀請 - {{company_name}} {{position_title}}",
    content: `親愛的 {{candidate_name}}，

感謝您對 {{company_name}} {{position_title}} 職位的興趣！

我們很高興邀請您參加面試，詳細資訊如下：

日期：{{interview_date}}
時間：{{interview_time}}
地點：{{interview_location}}
面試官：{{interviewer_name}}

請攜帶：
- 身分證明文件
- 最新版履歷

如有任何問題，請隨時與我聯繫。

祝您面試順利！

{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "婉拒通知",
    category: "rejection",
    subject: "感謝您的申請 - {{company_name}}",
    content: `親愛的 {{candidate_name}}，

感謝您花時間參與 {{company_name}} {{position_title}} 職位的面試。

經過審慎評估，我們決定選擇另一位更符合目前需求的候選人。這是一個困難的決定，因為您的背景和能力都令人印象深刻。

我們會將您的資料保留在人才庫中，未來若有合適的機會，將優先與您聯繫。

祝您職涯發展順利！

{{recruiter_name}}`,
    is_default: true,
  },
  {
    name: "錄取通知",
    category: "offer",
    subject: "恭喜錄取！{{company_name}} {{position_title}}",
    content: `親愛的 {{candidate_name}}，

非常高興通知您，{{company_name}} 決定錄取您擔任 {{position_title}}！

錄取條件如下：
- 職位：{{position_title}}
- 薪資：{{salary}}
- 預計到職日：{{start_date}}

請於 {{deadline}} 前回覆是否接受此 offer。

如有任何問題，歡迎隨時與我聯繫。

再次恭喜您！

{{recruiter_name}}`,
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

    if (!error && data) {
      setTemplates(data)
    }
    setLoading(false)
  }

  async function initializeDefaults() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("message_templates").insert(
      DEFAULT_TEMPLATES.map((t) => ({ ...t, user_id: user.id }))
    )

    if (!error) {
      fetchTemplates()
    }
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingTemplate) {
      await supabase
        .from("message_templates")
        .update(formData)
        .eq("id", editingTemplate.id)
    } else {
      await supabase
        .from("message_templates")
        .insert({ ...formData, user_id: user.id })
    }

    setIsDialogOpen(false)
    setEditingTemplate(null)
    setFormData({ name: "", category: "introduction", subject: "", content: "" })
    fetchTemplates()
  }

  async function handleDelete(id: string) {
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

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">訊息模板</h1>
          <p className="text-muted-foreground mt-1">
            管理常用的聯繫訊息模板，支援動態變數
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && !loading && (
            <Button variant="outline" onClick={initializeDefaults}>
              載入預設模板
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTemplate(null)
                setFormData({ name: "", category: "introduction", subject: "", content: "" })
              }}>
                <Plus className="mr-2 h-4 w-4" />
                新增模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "編輯模板" : "新增模板"}</DialogTitle>
                <DialogDescription>
                  使用 {"{{variable_name}}"} 語法插入動態變數
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">模板名稱</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如：LinkedIn 初次聯繫"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">類別</label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as MessageTemplate["category"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">主旨（選填）</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="例如：職涯機會洽談"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">內容</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    placeholder="輸入訊息內容，使用 {{candidate_name}} 等變數..."
                  />
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">常用變數：</p>
                  <div className="flex flex-wrap gap-1">
                    {["candidate_name", "recruiter_name", "company_name", "position_title", "current_company", "current_title", "interview_date", "interview_time", "salary"].map((v) => (
                      <Badge key={v} variant="secondary" className="text-xs cursor-pointer" onClick={() => {
                        setFormData({ ...formData, content: formData.content + `{{${v}}}` })
                      }}>
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSave} disabled={!formData.name || !formData.content}>
                  儲存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          全部
        </Button>
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          return (
            <Button
              key={c.value}
              variant={selectedCategory === c.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(c.value)}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {c.label}
            </Button>
          )
        })}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {templates.length === 0 
                ? "還沒有任何模板，點擊「載入預設模板」開始使用" 
                : "此類別沒有模板"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category)
            const CategoryIcon = categoryInfo.icon
            
            return (
              <Card key={template.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        <CategoryIcon className="mr-1 h-3 w-3" />
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        <DropdownMenuItem 
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {template.subject && (
                    <CardDescription className="text-xs mt-1">
                      主旨：{template.subject}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                    {template.content}
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleCopy(template.content, template.id)}
                  >
                    {copiedId === template.id ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                        已複製
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        複製到剪貼簿
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
