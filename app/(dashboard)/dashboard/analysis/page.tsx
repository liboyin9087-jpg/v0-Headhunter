"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Brain, CheckCircle, FileText, Target, Users, Zap } from "lucide-react";
import type { Candidate, JobPosition } from "@/lib/types/database";

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
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<JobPosition[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
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

        if (!candidate || !position) {
          throw new Error("請選擇候選人和職缺")
        }

        resumeText = `
姓名：${candidate.name}
目前職位：${candidate.current_title || "未知"} @ ${candidate.current_company || "未知"}
工作經驗：${candidate.experience_years || "未知"} 年
地點：${candidate.location || "未知"}
技能：${candidate.skills?.join(", ") || "無"}
備註：${candidate.notes || "無"}
履歷內容：${candidate.resume_text || "無詳細履歷"}
`.trim()

        jobDescription = `
職位：${position.title}
公司：${position.company}
描述：${position.description}
必備技能：${position.requirements?.join(", ") || "無"}
加分條件：${position.nice_to_have?.join(", ") || "無"}
薪資範圍：${position.salary_range || "面議"}
地點：${position.location || "未知"}
`.trim()

        candidateId = candidate.id
        positionId = position.id
      }

      if (!resumeText.trim() || !jobDescription.trim()) {
        throw new Error("請輸入履歷和職缺描述")
      }

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          positionId,
          resumeText,
          jobDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "分析失敗")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent"
    if (score >= 60) return "text-primary"
    if (score >= 40) return "text-yellow-600"
    return "text-destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "非常匹配"
    if (score >= 60) return "良好匹配"
    if (score >= 40) return "部分匹配"
    return "需要加強"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI 履歷分析</h1>
        <p className="text-muted-foreground mt-1">
          使用 AI 智慧分析候選人與職缺的匹配程度
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              分析設定
            </CardTitle>
            <CardDescription>選擇候選人和職缺，或手動輸入資料</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={analysisMode === "select" ? "default" : "outline"}
                onClick={() => setAnalysisMode("select")}
                className="flex-1"
              >
                <Users className="mr-2 h-4 w-4" />
                從資料庫選擇
              </Button>
              <Button
                variant={analysisMode === "custom" ? "default" : "outline"}
                onClick={() => setAnalysisMode("custom")}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                手動輸入
              </Button>
            </div>

            {analysisMode === "select" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">選擇候選人</label>
                  <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇候選人..." />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.current_title || "未知職位"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">選擇職缺</label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇職缺..." />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title} - {p.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">履歷/候選人資料</label>
                  <Textarea
                    placeholder="貼上候選人的履歷或 LinkedIn 簡介..."
                    value={customResume}
                    onChange={(e) => setCustomResume(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">職缺描述 (JD)</label>
                  <Textarea
                    placeholder="貼上職缺描述..."
                    value={customJD}
                    onChange={(e) => setCustomJD(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
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
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              分析結果
            </CardTitle>
            {result?.cached && (
              <Badge variant="secondary" className="w-fit">
                已快取結果
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                選擇候選人和職缺後點擊分析
              </div>
            )}

            {loading && (
              <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Spinner className="h-8 w-8" />
                <p className="text-muted-foreground">AI 正在分析中...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>技能匹配</span>
                      <span className={getScoreColor(result.skillMatch)}>
                        {result.skillMatch}%
                      </span>
                    </div>
                    <Progress value={result.skillMatch} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>經驗相關</span>
                      <span className={getScoreColor(result.experienceMatch)}>
                        {result.experienceMatch}%
                      </span>
                    </div>
                    <Progress value={result.experienceMatch} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>總體匹配</span>
                      <span className={getScoreColor(result.overallScore)}>
                        {result.overallScore}%
                      </span>
                    </div>
                    <Progress value={result.overallScore} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <Badge
                    variant={result.overallScore >= 60 ? "default" : "secondary"}
                    className={result.overallScore >= 80 ? "bg-accent text-accent-foreground" : ""}
                  >
                    {getScoreLabel(result.overallScore)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{result.summary}</span>
                </div>

                {/* Strengths */}
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    優勢
                  </h4>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                {result.gaps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      需加強
                    </h4>
                    <ul className="space-y-1">
                      {result.gaps.map((g, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interview Questions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">建議面試問題</h4>
                  <ol className="list-inside list-decimal space-y-1">
                    {result.interviewQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {q}
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
