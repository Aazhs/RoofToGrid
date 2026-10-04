-- ============================================================================
-- RoofToGrid — Supabase Schema & Row Level Security (RLS) Migration
-- Target: Supabase PostgreSQL (Public Schema & Storage)
-- Compatible with: Go Backend Engine & SvelteKit Client
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Electricity Bills Table
CREATE TABLE IF NOT EXISTS public.electricity_bills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    month VARCHAR(32) NOT NULL,
    units NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_electricity_bills_user_id ON public.electricity_bills(user_id);

-- Enable RLS on electricity_bills
ALTER TABLE public.electricity_bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own bills" ON public.electricity_bills;
CREATE POLICY "Users can manage own bills" 
ON public.electricity_bills 
FOR ALL 
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 3. Roof Profiles Table
CREATE TABLE IF NOT EXISTS public.roof_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    area_sqft NUMERIC(10, 2) NOT NULL,
    roof_type VARCHAR(64) DEFAULT 'flat_concrete',
    shading_factor NUMERIC(4, 2) DEFAULT 0.85,
    orientation VARCHAR(32) DEFAULT 'south',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roof_profiles_user_id ON public.roof_profiles(user_id);

-- Enable RLS on roof_profiles
ALTER TABLE public.roof_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own roof profiles" ON public.roof_profiles;
CREATE POLICY "Users can manage own roof profiles" 
ON public.roof_profiles 
FOR ALL 
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 4. Solar EPC Quotes Table
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    installer_name VARCHAR(255) NOT NULL,
    system_size_kw NUMERIC(6, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    panel_brand VARCHAR(128) NOT NULL,
    inverter_brand VARCHAR(128) NOT NULL,
    transparency_score NUMERIC(4, 2) DEFAULT 8.0,
    is_recommended BOOLEAN DEFAULT FALSE,
    red_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);

-- Enable RLS on quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" 
ON public.quotes 
FOR ALL 
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 5. Nationwide Verified Installer Directory Table
CREATE TABLE IF NOT EXISTS public.installers (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(64) NOT NULL,
    base_rate_per_kwp NUMERIC(10, 2) NOT NULL,
    panel_tech VARCHAR(128) NOT NULL,
    panel_brand VARCHAR(128) NOT NULL,
    inverter_brand VARCHAR(128) NOT NULL,
    transparency_score NUMERIC(4, 2) NOT NULL,
    best_for_badge VARCHAR(128) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on installers (Public read, service-role write)
ALTER TABLE public.installers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for installer directory" ON public.installers;
CREATE POLICY "Public read for installer directory" 
ON public.installers 
FOR SELECT 
USING (true);

-- Seed initial verified installer benchmarks
INSERT INTO public.installers (id, name, tier, base_rate_per_kwp, panel_tech, panel_brand, inverter_brand, transparency_score, best_for_badge, notes)
VALUES
('tata-solar', 'Tata Power Solar Systems', 'Tier 1 National Brand', 68000, 'TopCon N-Type (22.8% Eff)', 'Tata Power Solar 545W', 'Growatt / SolarEdge 10y Warranty', 9.6, 'Best Tech & National Reliability', 'Includes full DISCOM net-metering liaisoning and bidirectional meter paperwork.'),
('waaree-solar', 'Waaree Energies Direct Partner', 'Tier 1 Module Manufacturer', 58000, 'Mono PERC Bi-facial', 'Waaree 550W Panels', 'Waaree / Solis 5y Warranty', 9.0, 'Best Value & Fastest Payback (3.6 yrs)', 'Largest Indian panel manufacturer with direct distributor dispatch.'),
('solarsquare', 'SolarSquare Energy', 'Tech-Enabled D2C EPC', 64000, 'Mono PERC Half-Cut', 'RenewSys / Waaree 540W', 'Deye Cloud Hybrid-Ready', 9.2, 'Best Customer Service & App Tracking', 'Proprietary wind-resilient HDG elevated structure with 5-year AMC.'),
('loom-solar', 'Loom Solar Microinverter Package', 'Premium Microinverter Specialist', 79000, 'Shark Bi-facial TopCon', 'Loom Solar 575W', 'Enphase / Hoymiles Microinverter', 9.4, 'Maximum Safety (Low Voltage AC Roof)', 'Panel-level MPPT tracking; immune to partial shading from water tanks or chimneys.')
ON CONFLICT (id) DO UPDATE SET
    base_rate_per_kwp = EXCLUDED.base_rate_per_kwp,
    transparency_score = EXCLUDED.transparency_score;

-- 6. Project Milestones Tracker Table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    step_index INT NOT NULL,
    title VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending', -- pending, in_progress, completed
    target_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.project_milestones(user_id);

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own project milestones" ON public.project_milestones;
CREATE POLICY "Users can manage own project milestones" 
ON public.project_milestones 
FOR ALL 
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
