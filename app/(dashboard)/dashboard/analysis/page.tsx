"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertCircle, Brain, CheckCircle2, FileText, Target, Users, Zap, Sparkles, Database,
} from "lucide-react"
import type { Candidate, JobPosition } from "@/lib/types/database"

interface AnalysisResult {
  skillMatch: number
  experienceMatch: number
  overallScore: number
  strengths: string[]
  gaps: string[]
  interviewQuestions: string[]
  summary: string
  cached?: boolean
}

export default function AIAnalysisPage() {
  const searchParams = useSearchParams()
  const preselectedCandidate = searchParams.get("candidate") || ""

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<JobPosition[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string>(preselectedCandidate)
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [customResume, setCustomResume] = useState("")
  const [customJD, setCustomJD] = useState("")
  const [analysisMode, setAnalysisMode] = useState<"select" | "custom">("select")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const [{ data: candidatesData }, { data: positionsData }] = await Promise.all([
        supabase.from("candidates").select("*").order("created_at", { ascending: false }),
        supabase.from("job_positions").select("*").eq("status", "open").order("created_at", { ascending: false }),
      ])
      setCandidates(candidatesData || [])
      setPositions(positionsData || [])
    }
    fetchData()
  }, [])

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let resumeText = customResume
      let jobDescription = customJD
      let candidateId: string | undefined
      let positionId: string | undefined

      if (analysisMode === "select") {
        const candidate = candidates.find((c) => c.id === selectedCandidate)
        const position = positions.find((p) => p.id === selectedPosition)

        if (!candidate || !position) throw new Error("請選擇候選人和職缺")

        resumeText = `姓名：${candidate.name}\n目前職位：${candidate.current_title || "未知"} @ ${candidate.current_company || "未知"}\n工作經驗：${candidate.experience_years || "未知"} 年\n地點：${candidate.location || "未知"}\n技能：${candidate.skills?.join(", ") || "無"}\n備註：${candidate.notes || "無"}\n履歷內容：${candidate.resume_text || "無詳細履歷"}`

        jobDescription = `職位：${position.title}\n公司：${position.company}\n描述：${position.description}\n必備技能：${position.requirements?.join(", ") || "無"}\n加分條件：${position.nice_to_have?.join(", ") || "無"}\n薪資範圍：${position.salary_range || "面議"}\n地點：${position.location || "未知"}`

        candidateId = candidate.id
        positionId = position.id
      }

      if (!resumeText.trim() || !jobDescription.trim()) {
        throw new Error("請輸入履歷和職缺描述")
      }

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, positionId, resumeText, jobDescription }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "分析失敗")

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-primary"
    if (score >= 40) return "text-amber-600"
    return "text-destructive"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200 text-emerald-700"
    if (score >= 60) return "bg-blue-50 border-blue-200 text-blue-700"
    if (score >= 40) return "bg-amber-50 border-amber-200 text-amber-700"
    return "bg-red-50 border-red-200 text-red-700"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "非常匹配"
    if (score >= 60) return "良好匹配"
    if (score >= 40) return "部分匹配"
    return "需要加強"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-blue-200">
            <Brain className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight">AI 履歷匹配分析</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              選擇候選人與職缺，AI 會產出匹配分數、優勢與建議面試問題
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto border-blue-200 bg-white text-blue-700">
            <Sparkles className="mr-1 h-3 w-3" />
            Powered by Moonshot
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input */}
        <Card className="py-0 overflow-hidden lg:col-span-2">
          <div className="border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">分析設定</h3>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100">
              <button
                onClick={() => setAnalysisMode("select")}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  analysisMode === "select"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                從資料庫
              </button>
              <button
                onClick={() => setAnalysisMode("custom")}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  analysisMode === "custom"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                手動輸入
              </button>
            </div>

            {analysisMode === "select" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">選擇候選人</Label>
                  <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇候選人..." />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          尚無候選人資料
                        </div>
                      ) : (
                        candidates.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} — {c.current_title || "未填職位"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">選擇職缺</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇職缺..." />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          尚無開放職缺
                        </div>
                      ) : (
                        positions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title} — {p.company}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">履歷 / 候選人資料</Label>
                  <Textarea
                    placeholder="貼上候選人的履歷或 LinkedIn 簡介..."
                    value={customResume}
                    onChange={(e) => setCustomResume(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">職缺描述 (JD)</Label>
                  <Textarea
                    placeholder="貼上職缺描述..."
                    value={customJD}
                    onChange={(e) => setCustomJD(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={loading} className="w-full h-10">
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  分析中...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  開始 AI 分析
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-red-50 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="py-0 overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">分析結果</h3>
            </div>
            {result?.cached && (
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                快取結果
              </Badge>
            )}
          </div>
          <CardContent className="p-5">
            {!result && !loading && (
              <div className="flex h-80 flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100 text-primary">
                  <Brain className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-medium">等待開始分析</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  選擇候選人與職缺後點擊「開始 AI 分析」，預計 10-30 秒產出結果
                </p>
              </div>
            )}

            {loading && (
              <div className="flex h-80 flex-col items-center justify-center gap-4">
                <Spinner className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-sm font-medium">AI 正在深入分析...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">請稍候，通常需 10-30 秒</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Overall score */}
                <div className={`rounded-xl border p-5 ${getScoreBg(result.overallScore)}`}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider opacity-80">總體匹配分數</p>
                      <div className="mt-1 flex items-end gap-2">
                        <span className="text-4xl font-bold">{result.overallScore}</span>
                        <span className="text-lg font-medium pb-1 opacity-80">/100</span>
                      </div>
                    </div>
                    <Badge className="text-sm font-medium bg-white border-current">
                      {getScoreLabel(result.overallScore)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{result.summary}</p>
                </div>

                {/* Score breakdown */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">技能匹配</span>
                      <span className={`font-bold ${getScoreColor(result.skillMatch)}`}>{result.skillMatch}%</span>
                    </div>
                    <Progress value={result.skillMatch} className="h-1.5 mt-2" />
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">經驗相關</span>
                      <span className={`font-bold ${getScoreColor(result.experienceMatch)}`}>{result.experienceMatch}%</span>
                    </div>
                    <Progress value={result.experienceMatch} className="h-1.5 mt-2" />
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    優勢亮點
                  </h4>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                {result.gaps.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      可能的差距
                    </h4>
                    <ul className="space-y-1.5">
                      {result.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interview questions */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    建議面試問題
                  </h4>
                  <ol className="space-y-2">
                    {result.interviewQuestions.map((q, i) => (
                      <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-semibold">
                          {i + 1}
                        </span>
                        <span className="flex-1">{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
