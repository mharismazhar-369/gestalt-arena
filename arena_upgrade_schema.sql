-- Gestalt Arena Upgrade Schema
-- Phase A Additions

-- ==========================================
-- 1. TAXONOMY / CLASSIFICATION TABLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view industries" ON public.industries FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.investment_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.investment_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view investment stages" ON public.investment_stages FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);

-- ==========================================
-- 2. PROFILE EXTENSIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.startup_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    website TEXT,
    industry TEXT,
    founded_year INTEGER,
    employee_count TEXT,
    business_model TEXT,
    headquarters TEXT,
    description TEXT,
    verification_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view startup profiles" ON public.startup_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own startup profile" ON public.startup_profiles FOR ALL USING (auth.uid() = profile_id);

CREATE TABLE IF NOT EXISTS public.investor_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    firm_name TEXT,
    website TEXT,
    firm_type TEXT,
    assets_under_management TEXT,
    investment_thesis TEXT,
    verification_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view investor profiles" ON public.investor_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own investor profile" ON public.investor_profiles FOR ALL USING (auth.uid() = profile_id);

-- ==========================================
-- 3. FUNDRAISING & OPPORTUNITIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.fundraising_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startup_profiles(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    funding_goal NUMERIC,
    amount_raised NUMERIC DEFAULT 0,
    minimum_ticket NUMERIC,
    valuation NUMERIC,
    equity_offered NUMERIC,
    stage TEXT,
    status TEXT DEFAULT 'draft',
    pitch_deck_url TEXT,
    use_of_funds TEXT,
    traction_summary TEXT,
    revenue NUMERIC,
    growth_rate TEXT,
    burn_rate NUMERIC,
    runway_months INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.fundraising_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active opportunities" ON public.fundraising_opportunities FOR SELECT USING (status != 'draft' OR auth.uid() = startup_id);
CREATE POLICY "Startups can manage own opportunities" ON public.fundraising_opportunities FOR ALL USING (auth.uid() = startup_id);

CREATE TABLE IF NOT EXISTS public.investor_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID REFERENCES public.investor_profiles(profile_id) ON DELETE CASCADE,
    min_ticket NUMERIC,
    max_ticket NUMERIC,
    preferred_stages TEXT[],
    industries TEXT[],
    geographies TEXT[],
    business_models TEXT[],
    investment_types TEXT[],
    lead_investment BOOLEAN,
    follow_on BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.investor_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can manage own preferences" ON public.investor_preferences FOR ALL USING (auth.uid() = investor_id);

-- ==========================================
-- 4. INVESTOR INTEREST & DEAL FLOW
-- ==========================================
CREATE TABLE IF NOT EXISTS public.investor_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID REFERENCES public.investor_profiles(profile_id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.fundraising_opportunities(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'interested',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(investor_id, opportunity_id)
);
ALTER TABLE public.investor_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can manage own interests" ON public.investor_interests FOR ALL USING (auth.uid() = investor_id);
CREATE POLICY "Startups can view interests in their opportunities" ON public.investor_interests FOR SELECT USING (
    opportunity_id IN (SELECT id FROM public.fundraising_opportunities WHERE startup_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS public.deal_pipeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID REFERENCES public.investor_profiles(profile_id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startup_profiles(profile_id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.fundraising_opportunities(id) ON DELETE SET NULL,
    stage TEXT DEFAULT 'discovered',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.deal_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can manage own pipeline" ON public.deal_pipeline FOR ALL USING (auth.uid() = investor_id);

CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID REFERENCES public.investor_profiles(profile_id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startup_profiles(profile_id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.fundraising_opportunities(id) ON DELETE SET NULL,
    amount NUMERIC,
    investment_date DATE,
    investment_type TEXT,
    ownership_percentage NUMERIC,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can manage own investments" ON public.investments FOR ALL USING (auth.uid() = investor_id);

-- ==========================================
-- 5. STARTUP SUPPORTING DATA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.startup_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startup_profiles(profile_id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_period TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.startup_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view startup metrics" ON public.startup_metrics FOR SELECT USING (true);
CREATE POLICY "Startups can manage own metrics" ON public.startup_metrics FOR ALL USING (auth.uid() = startup_id);

CREATE TABLE IF NOT EXISTS public.startup_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startup_profiles(profile_id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT,
    bio TEXT,
    is_founder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.startup_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view startup teams" ON public.startup_team FOR SELECT USING (true);
CREATE POLICY "Startups can manage own team" ON public.startup_team FOR ALL USING (auth.uid() = startup_id);

-- ==========================================
-- 6. CONNECTIONS & VIEWS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(requester_id, receiver_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can request connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Receivers can update connections" ON public.connections FOR UPDATE USING (auth.uid() = receiver_id);

CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view who viewed their profile" ON public.profile_views FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert views" ON public.profile_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

CREATE TABLE IF NOT EXISTS public.opportunity_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.fundraising_opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.opportunity_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Startups can view who viewed their opportunities" ON public.opportunity_views FOR SELECT USING (
    opportunity_id IN (SELECT id FROM public.fundraising_opportunities WHERE startup_id = auth.uid())
);
CREATE POLICY "Users can insert opportunity views" ON public.opportunity_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Add opportunity_id to conversations if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='opportunity_id') THEN
            ALTER TABLE public.conversations ADD COLUMN opportunity_id UUID REFERENCES public.fundraising_opportunities(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='conversation_type') THEN
            ALTER TABLE public.conversations ADD COLUMN conversation_type TEXT DEFAULT 'general';
        END IF;
    END IF;
END $$;
