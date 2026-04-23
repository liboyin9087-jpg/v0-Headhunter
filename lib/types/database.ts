// 獵頭工具資料庫類型定義

export type CandidateStatus = 'new' | 'contacted' | 'interviewing' | 'offered' | 'placed' | 'rejected'
export type CandidateSource = 'linkedin' | 'referral' | 'direct' | 'github' | 'other'
export type PositionStatus = 'open' | 'closed' | 'on_hold'
export type TemplateCategory = 'introduction' | 'follow_up' | 'interview' | 'rejection' | 'offer'

export interface Candidate {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  linkedin_url: string | null
  github_url: string | null
  current_company: string | null
  current_title: string | null
  location: string | null
  experience_years: number | null
  skills: string[]
  resume_text: string | null
  notes: string | null
  status: CandidateStatus
  source: CandidateSource
  created_at: string
  updated_at: string
}

export interface JobPosition {
  id: string
  user_id: string
  title: string
  company: string
  description: string
  requirements: string[]
  nice_to_have: string[]
  salary_range: string | null
  location: string | null
  status: PositionStatus
  created_at: string
  updated_at: string
}

export interface MessageTemplate {
  id: string
  user_id: string
  name: string
  category: TemplateCategory
  subject: string | null
  content: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface TrackingLog {
  id: string
  user_id: string
  candidate_id: string | null
  position_id: string | null
  action: string
  notes: string | null
  created_at: string
}

export interface AIAnalysisCache {
  id: string
  user_id: string
  candidate_id: string | null
  position_id: string | null
  match_score: number | null
  analysis_result: AIAnalysisResult | null
  created_at: string
}

export interface AIAnalysisResult {
  overall_score: number
  skill_match: {
    matched: string[]
    missing: string[]
    bonus: string[]
  }
  experience_analysis: string
  strengths: string[]
  concerns: string[]
  interview_questions: string[]
  recommendation: string
}

// 狀態標籤映射
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  new: '新進',
  contacted: '已聯繫',
  interviewing: '面試中',
  offered: '已發 Offer',
  placed: '已入職',
  rejected: '已拒絕'
}

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  interviewing: 'bg-purple-100 text-purple-800',
  offered: 'bg-orange-100 text-orange-800',
  placed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export const SOURCE_LABELS: Record<CandidateSource, string> = {
  linkedin: 'LinkedIn',
  referral: '內部推薦',
  direct: '主動應徵',
  github: 'GitHub',
  other: '其他'
}

export const POSITION_STATUS_LABELS: Record<PositionStatus, string> = {
  open: '招募中',
  closed: '已關閉',
  on_hold: '暫緩'
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  introduction: '初次聯繫',
  follow_up: '追蹤跟進',
  interview: '面試邀約',
  rejection: '婉拒通知',
  offer: 'Offer 通知'
}
