'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react'

interface ParsedCandidate {
  name: string
  email?: string
  phone?: string
  linkedin_url?: string
  github_url?: string
  current_company?: string
  current_title?: string
  location?: string
  experience_years?: number
  skills?: string[]
  notes?: string
}

export default function ImportCandidatesPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const parseCSV = useCallback((text: string): ParsedCandidate[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const candidates: ParsedCandidate[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
      const cleaned = values.map(v => v.replace(/^"|"$/g, '').trim())
      
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = cleaned[index] || ''
      })

      if (obj.name || obj['姓名']) {
        candidates.push({
          name: obj.name || obj['姓名'],
          email: obj.email || obj['電子郵件'] || obj['郵件'] || undefined,
          phone: obj.phone || obj['電話'] || undefined,
          linkedin_url: obj.linkedin_url || obj.linkedin || obj['linkedin'] || undefined,
          github_url: obj.github_url || obj.github || obj['github'] || undefined,
          current_company: obj.current_company || obj.company || obj['公司'] || obj['目前公司'] || undefined,
          current_title: obj.current_title || obj.title || obj['職稱'] || obj['目前職稱'] || undefined,
          location: obj.location || obj['地區'] || obj['地點'] || undefined,
          experience_years: obj.experience_years || obj.experience || obj['年資'] 
            ? parseInt(obj.experience_years || obj.experience || obj['年資']) 
            : undefined,
          skills: obj.skills || obj['技能'] 
            ? (obj.skills || obj['技能']).split(/[,;、]/).map(s => s.trim()).filter(Boolean) 
            : undefined,
          notes: obj.notes || obj['備註'] || undefined,
        })
      }
    }

    return candidates
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setSuccess(false)

    try {
      const text = await selectedFile.text()
      const parsed = parseCSV(text)
      setPreview(parsed)
      
      if (parsed.length === 0) {
        setError('無法解析 CSV 檔案，請確認格式正確')
      }
    } catch {
      setError('讀取檔案失敗')
    }
  }

  const handleImport = async () => {
    if (preview.length === 0) return
    
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('請先登入')
      setLoading(false)
      return
    }

    const payload = preview.map(c => ({
      user_id: user.id,
      name: c.name,
      email: c.email || null,
      phone: c.phone || null,
      linkedin_url: c.linkedin_url || null,
      github_url: c.github_url || null,
      current_company: c.current_company || null,
      current_title: c.current_title || null,
      location: c.location || null,
      experience_years: c.experience_years || null,
      skills: c.skills || [],
      notes: c.notes || null,
      status: 'new' as const,
      source: 'other' as const,
    }))

    const { error: insertError, data } = await supabase
      .from('candidates')
      .insert(payload)
      .select()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setImportedCount(data?.length || 0)
    setLoading(false)
  }

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,linkedin_url,github_url,current_company,current_title,location,experience_years,skills,notes
王小明,wang@example.com,0912-345-678,https://linkedin.com/in/wang,https://github.com/wang,ABC科技,資深工程師,台北市,5,"JavaScript,React,Node.js",優秀候選人
李小華,lee@example.com,0923-456-789,,,XYZ公司,產品經理,台中市,3,"產品規劃,敏捷開發",待追蹤`

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'candidates_template.csv'
    link.click()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">匯入候選人</h2>
          <p className="text-muted-foreground">上傳 CSV 檔案批次匯入候選人資料</p>
        </div>
      </div>

      {success ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">匯入成功</h3>
            <p className="text-muted-foreground mb-6">
              已成功匯入 {importedCount} 位候選人
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard/candidates">
                <Button>查看人才庫</Button>
              </Link>
              <Button variant="outline" onClick={() => {
                setSuccess(false)
                setFile(null)
                setPreview([])
              }}>
                繼續匯入
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle>下載範本</CardTitle>
              <CardDescription>
                使用我們提供的 CSV 範本格式，確保匯入成功
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                下載 CSV 範本
              </Button>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle>上傳檔案</CardTitle>
              <CardDescription>
                支援的欄位：name, email, phone, linkedin_url, github_url, current_company, current_title, location, experience_years, skills, notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  {file ? (
                    <>
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {preview.length} 筆資料待匯入
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        點擊或拖曳上傳 CSV 檔案
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>預覽 (前 5 筆)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">姓名</th>
                        <th className="text-left py-2 pr-4">Email</th>
                        <th className="text-left py-2 pr-4">公司</th>
                        <th className="text-left py-2">職稱</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 5).map((c, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4">{c.name}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{c.email || '-'}</td>
                          <td className="py-2 pr-4">{c.current_company || '-'}</td>
                          <td className="py-2">{c.current_title || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 5 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ...還有 {preview.length - 5} 筆資料
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {preview.length > 0 && (
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => {
                setFile(null)
                setPreview([])
              }}>
                取消
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading && <Spinner className="mr-2" />}
                匯入 {preview.length} 筆資料
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
