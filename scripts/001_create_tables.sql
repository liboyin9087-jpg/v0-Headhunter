-- 獵頭工具資料庫架構
-- 建立所有核心表格與 RLS 政策

-- 1. 候選人表 (Candidates)
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  current_company TEXT,
  current_title TEXT,
  location TEXT,
  experience_years INTEGER,
  skills TEXT[] DEFAULT '{}',
  resume_text TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interviewing', 'offered', 'placed', 'rejected')),
  source TEXT DEFAULT 'direct' CHECK (source IN ('linkedin', 'referral', 'direct', 'github', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 職缺表 (Job Positions)
CREATE TABLE IF NOT EXISTS public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  nice_to_have TEXT[] DEFAULT '{}',
  salary_range TEXT,
  location TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'on_hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 訊息模板表 (Message Templates)
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('introduction', 'follow_up', 'interview', 'rejection', 'offer')),
  subject TEXT,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 追蹤記錄表 (Tracking Logs)
CREATE TABLE IF NOT EXISTS public.tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.job_positions(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI 分析結果快取表 (AI Analysis Cache)
CREATE TABLE IF NOT EXISTS public.ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.job_positions(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2),
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Candidates RLS 政策
CREATE POLICY "candidates_select_own" ON public.candidates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "candidates_insert_own" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "candidates_update_own" ON public.candidates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "candidates_delete_own" ON public.candidates FOR DELETE USING (auth.uid() = user_id);

-- Job Positions RLS 政策
CREATE POLICY "positions_select_own" ON public.job_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "positions_insert_own" ON public.job_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "positions_update_own" ON public.job_positions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "positions_delete_own" ON public.job_positions FOR DELETE USING (auth.uid() = user_id);

-- Message Templates RLS 政策
CREATE POLICY "templates_select_own" ON public.message_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "templates_insert_own" ON public.message_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "templates_update_own" ON public.message_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "templates_delete_own" ON public.message_templates FOR DELETE USING (auth.uid() = user_id);

-- Tracking Logs RLS 政策
CREATE POLICY "logs_select_own" ON public.tracking_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON public.tracking_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_delete_own" ON public.tracking_logs FOR DELETE USING (auth.uid() = user_id);

-- AI Analysis Cache RLS 政策
CREATE POLICY "analysis_select_own" ON public.ai_analysis_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analysis_insert_own" ON public.ai_analysis_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analysis_delete_own" ON public.ai_analysis_cache FOR DELETE USING (auth.uid() = user_id);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.job_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON public.candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.job_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.job_positions(status);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.message_templates(category);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.tracking_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_candidate_id ON public.tracking_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_analysis_candidate_position ON public.ai_analysis_cache(candidate_id, position_id);
