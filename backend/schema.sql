-- Civic Link Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- User Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    domain TEXT NOT NULL CHECK (domain IN ('healthcare', 'municipal', 'education', 'civilian')),
    role TEXT NOT NULL DEFAULT 'citizen',
    current_domain TEXT,
    locality TEXT,
    zone TEXT,
    institution_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_domains TEXT[] DEFAULT '{}',
    preferred_localities TEXT[] DEFAULT '{}',
    notification_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    domain TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT TABLES
-- ============================================

-- Chat Rooms (Domain-based)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN ('healthcare', 'municipal', 'education')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTHCARE TABLES
-- ============================================

-- Medical Camps
CREATE TABLE IF NOT EXISTS medical_camps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL,
    institution_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    camp_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_name TEXT NOT NULL,
    address TEXT NOT NULL,
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    services_offered TEXT[] NOT NULL,
    max_registrations INTEGER,
    volunteers_needed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Camp Registrations
CREATE TABLE IF NOT EXISTS camp_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_id UUID NOT NULL REFERENCES medical_camps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(camp_id, user_id)
);

-- Volunteer Registrations
CREATE TABLE IF NOT EXISTS volunteer_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_id UUID NOT NULL REFERENCES medical_camps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    availability_notes TEXT,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(camp_id, user_id)
);

-- ============================================
-- MUNICIPAL TABLES
-- ============================================

-- Municipal Issues
CREATE TABLE IF NOT EXISTS municipal_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID NOT NULL REFERENCES profiles(id),
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_name TEXT NOT NULL,
    address TEXT NOT NULL,
    locality TEXT NOT NULL,
    zone TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'on_hold', 'resolved', 'closed', 'rejected')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES profiles(id),
    assigned_officer_name TEXT,
    estimated_resolution_date TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Issue Updates/Timeline
CREATE TABLE IF NOT EXISTS issue_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES municipal_issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    message TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipal Zones
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    localities TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EDUCATION TABLES
-- ============================================

-- Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL,
    institution_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'volunteer', 'scholarship', 'training')),
    department TEXT,
    location TEXT NOT NULL,
    is_remote BOOLEAN DEFAULT false,
    salary_range TEXT,
    eligibility TEXT[] NOT NULL,
    requirements TEXT[] NOT NULL,
    responsibilities TEXT[] NOT NULL,
    benefits TEXT[] DEFAULT '{}',
    application_deadline DATE NOT NULL,
    positions_available INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    cover_letter TEXT,
    resume_url TEXT,
    additional_info TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn')),
    status_notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_domain ON profiles(domain);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_locality ON profiles(locality);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_domain ON notifications(domain);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Healthcare
CREATE INDEX IF NOT EXISTS idx_medical_camps_locality ON medical_camps(locality);
CREATE INDEX IF NOT EXISTS idx_medical_camps_date ON medical_camps(camp_date);
CREATE INDEX IF NOT EXISTS idx_medical_camps_status ON medical_camps(status);
CREATE INDEX IF NOT EXISTS idx_camp_registrations_camp ON camp_registrations(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_registrations_user ON camp_registrations(user_id);

-- Municipal
CREATE INDEX IF NOT EXISTS idx_municipal_issues_citizen ON municipal_issues(citizen_id);
CREATE INDEX IF NOT EXISTS idx_municipal_issues_locality ON municipal_issues(locality);
CREATE INDEX IF NOT EXISTS idx_municipal_issues_status ON municipal_issues(status);
CREATE INDEX IF NOT EXISTS idx_municipal_issues_assigned ON municipal_issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issue_updates_issue ON issue_updates(issue_id);

-- Education
CREATE INDEX IF NOT EXISTS idx_job_postings_institution ON job_postings(institution_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings(job_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipal_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Notifications: Users can only access their own
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Chat Rooms: Accessible based on domain
CREATE POLICY "Chat rooms are viewable by authenticated users" ON chat_rooms
    FOR SELECT TO authenticated USING (true);

-- Chat Messages: Viewable if not moderated
CREATE POLICY "Chat messages are viewable" ON chat_messages
    FOR SELECT TO authenticated USING (is_moderated = false);

CREATE POLICY "Users can insert messages" ON chat_messages
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Medical Camps: Public read, institution write
CREATE POLICY "Medical camps are viewable by all" ON medical_camps
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Institutions can create camps" ON medical_camps
    FOR INSERT TO authenticated WITH CHECK (institution_id = auth.uid());

CREATE POLICY "Institutions can update own camps" ON medical_camps
    FOR UPDATE TO authenticated USING (institution_id = auth.uid());

-- Camp Registrations
CREATE POLICY "Users can view own registrations" ON camp_registrations
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can register for camps" ON camp_registrations
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Municipal Issues: Citizens can create, officers can update
CREATE POLICY "Issues are viewable by all" ON municipal_issues
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Citizens can create issues" ON municipal_issues
    FOR INSERT TO authenticated WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "Citizens can update own issues" ON municipal_issues
    FOR UPDATE TO authenticated USING (citizen_id = auth.uid());

-- Job Postings: Public read
CREATE POLICY "Job postings are viewable by all" ON job_postings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Institutions can create postings" ON job_postings
    FOR INSERT TO authenticated WITH CHECK (institution_id = auth.uid());

-- Job Applications
CREATE POLICY "Users can view own applications" ON job_applications
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create applications" ON job_applications
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medical_camps_updated_at
    BEFORE UPDATE ON medical_camps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_municipal_issues_updated_at
    BEFORE UPDATE ON municipal_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default chat rooms
INSERT INTO chat_rooms (name, domain, description) VALUES
    ('Healthcare Community', 'healthcare', 'Community chat for healthcare discussions'),
    ('Municipal Community', 'municipal', 'Community chat for municipal discussions'),
    ('Education Community', 'education', 'Community chat for education discussions')
ON CONFLICT (domain) DO NOTHING;
