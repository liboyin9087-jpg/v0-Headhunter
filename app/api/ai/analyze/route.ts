"use server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json({ 
        error: "AI 服務尚未設定，請在環境變數中設定 MOONSHOT_API_KEY" 
      }, { status: 500 })
    }

    // Instantiate client inside handler so missing key doesn't crash at build time
    const client = new OpenAI({
      apiKey: process.env.MOONSHOT_API_KEY,
      baseURL: "https://api.moonshot.cn/v1",
    })

    const { candidateId, positionId, resumeText, jobDescription } = await request.json()

    // Check cache first
    if (candidateId && positionId) {
      const { data: cached } = await supabase
        .from("ai_analysis_cache")
        .select("*")
        .eq("candidate_id", candidateId)
        .eq("position_id", positionId)
        .single()

      if (cached && cached.analysis_result) {
        return NextResponse.json({
          ...cached.analysis_result,
          cached: true,
        })
      }
    }

    const systemPrompt = `你是一位專業的獵頭顧問 AI 助手。你的任務是分析候選人履歷與職缺描述的匹配程度。

請根據以下標準進行評估：
1. 技能匹配度 (0-100)
2. 經驗相關性 (0-100)
3. 整體匹配分數 (0-100)
4. 優勢分析 (列出 3-5 點)
5. 可能差距 (列出需要加強的地方)
6. 面試建議問題 (3-5 個針對性問題)
7. 總結評語 (2-3 句話)

請以 JSON 格式回覆，格式如下：
{
  "skillMatch": number,
  "experienceMatch": number,
  "overallScore": number,
  "strengths": string[],
  "gaps": string[],
  "interviewQuestions": string[],
  "summary": string
}`

    const userPrompt = `## 職缺描述
${jobDescription}

## 候選人履歷/簡介
${resumeText}

請分析此候選人與職缺的匹配程度。`

    const completion = await client.chat.completions.create({
      model: "kimi-2.6",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("AI 回應為空")
    }

    const analysisResult = JSON.parse(content)

    // Cache the result
    if (candidateId && positionId) {
      await supabase.from("ai_analysis_cache").upsert({
        user_id: user.id,
        candidate_id: candidateId,
        position_id: positionId,
        match_score: analysisResult.overallScore,
        analysis_result: analysisResult,
      })
    }

    return NextResponse.json({
      ...analysisResult,
      cached: false,
    })
  } catch (error) {
    console.error("AI analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析失敗" },
      { status: 500 }
    )
  }
}
