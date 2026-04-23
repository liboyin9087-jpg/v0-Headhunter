'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { X, Plus, AlertCircle } from 'lucide-react'
import type { Candidate, CandidateStatus, CandidateSource } from '@/lib/types/database'
import { STATUS_LABELS, SOURCE_LABELS } from '@/lib/types/database'

interface CandidateFormProps {
  candidate?: Candidate
  mode: 'create' | 'edit'
}

export function CandidateForm({ candidate, mode }: CandidateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    linkedin_url: candidate?.linkedin_url || '',
    github_url: candidate?.github_url || '',
    current_company: candidate?.current_company || '',
    current_title: candidate?.current_title || '',
    location: candidate?.location || '',
    experience_years: candidate?.experience_years?.toString() || '',
    skills: candidate?.skills || [],
    resume_text: candidate?.resume_text || '',
    notes: candidate?.notes || '',
    status: candidate?.status || 'new',
    source: candidate?.source || 'direct',
  })
  
  const [newSkill, setNewSkill] = useState('')

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('請先登入')
      setLoading(false)
      return
    }

    const payload = {
      user_id: user.id,
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      linkedin_url: formData.linkedin_url.trim() || null,
      github_url: formData.github_url.trim() || null,
      current_company: formData.current_company.trim() || null,
      current_title: formData.current_title.trim() || null,
      location: formData.location.trim() || null,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      skills: formData.skills,
      resume_text: formData.resume_text.trim() || null,
      notes: formData.notes.trim() || null,
      status: formData.status as CandidateStatus,
      source: formData.source as CandidateSource,
    }

    if (mode === 'create') {
      const { data, error } = await supabase.from('candidates').insert(payload).select().single()
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      
      router.push(`/dashboard/candidates/${data.id}`)
    } else {
      const { error } = await supabase
        .from('candidates')
        .update(payload)
        .eq('id', candidate!.id)
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      
      router.push(`/dashboard/candidates/${candidate!.id}`)
    }
    
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>基本資訊</CardTitle>
          <CardDescription>候選人的基本聯絡方式</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">姓名 *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="王小明"
              />
            </Field>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">電子郵件</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="example@email.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">電話</FieldLabel>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0912-345-678"
                />
              </Field>
            </div>
            
            <Field>
              <FieldLabel htmlFor="location">地區</FieldLabel>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="台北市"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>專業背景</CardTitle>
          <CardDescription>目前的工作經歷與技能</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="current_company">目前公司</FieldLabel>
                <Input
                  id="current_company"
                  value={formData.current_company}
                  onChange={(e) => handleChange('current_company', e.target.value)}
                  placeholder="ABC 科技公司"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="current_title">目前職稱</FieldLabel>
                <Input
                  id="current_title"
                  value={formData.current_title}
                  onChange={(e) => handleChange('current_title', e.target.value)}
                  placeholder="資深軟體工程師"
                />
              </Field>
            </div>
            
            <Field>
              <FieldLabel htmlFor="experience_years">工作年資</FieldLabel>
              <Input
                id="experience_years"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) => handleChange('experience_years', e.target.value)}
                placeholder="5"
              />
            </Field>
            
            <Field>
              <FieldLabel>技能標籤</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  placeholder="輸入技能後按 Enter 新增"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>社群連結</CardTitle>
          <CardDescription>LinkedIn、GitHub 等個人資料連結</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="linkedin_url">LinkedIn</FieldLabel>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="github_url">GitHub</FieldLabel>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => handleChange('github_url', e.target.value)}
                placeholder="https://github.com/username"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Status & Source */}
      <Card>
        <CardHeader>
          <CardTitle>狀態與來源</CardTitle>
          <CardDescription>追蹤候選人進度</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="status">狀態</FieldLabel>
                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(STATUS_LABELS) as [CandidateStatus, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="source">來源</FieldLabel>
                <Select value={formData.source} onValueChange={(v) => handleChange('source', v)}>
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(SOURCE_LABELS) as [CandidateSource, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>履歷與備註</CardTitle>
          <CardDescription>貼上履歷內容或備註資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="resume_text">履歷內容</FieldLabel>
              <Textarea
                id="resume_text"
                value={formData.resume_text}
                onChange={(e) => handleChange('resume_text', e.target.value)}
                placeholder="貼上履歷文字內容，方便進行 AI 分析..."
                rows={6}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">備註</FieldLabel>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="其他備註資訊..."
                rows={4}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2" />}
          {mode === 'create' ? '建立候選人' : '儲存變更'}
        </Button>
      </div>
    </form>
  )
}
