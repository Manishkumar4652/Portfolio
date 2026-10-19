-- ==============================================================================
-- PHASE 4A — Supabase Migration: Certificates Schema, Storage & Admin RLS
-- ==============================================================================

-- 1. Create admin_users table for server-verified admin authorization
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own admin record
CREATE POLICY "Admins can read own profile"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Helper function to verify admin status safely in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  ) OR (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );
$$;

-- 2. Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT,
  category TEXT NOT NULL CHECK (
    category IN (
      'Programming & Computer Science',
      'Data Structures & Algorithms',
      'Artificial Intelligence & Tools',
      'Systems & Tools',
      'Cloud & DevOps'
    )
  ),
  skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  file_path TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'pdf') OR file_type IS NULL),
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  verification_url TEXT,
  credential_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_certificates_updated_at ON public.certificates;
CREATE TRIGGER trigger_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_certificates_featured ON public.certificates(featured);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON public.certificates(category);
CREATE INDEX IF NOT EXISTS idx_certificates_sort_order ON public.certificates(sort_order);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON public.certificates(created_at DESC);

-- 3. Row Level Security Policies for certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public read access: Anyone (anon or authenticated) can view certificates
CREATE POLICY "Public read access for certificates"
  ON public.certificates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write access: Only server-verified admins can insert, update, or delete
CREATE POLICY "Admin insert certificates"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update certificates"
  ON public.certificates FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete certificates"
  ON public.certificates FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. Create public storage bucket for certificate images & PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];

-- Storage RLS Policies: Public read, Admin write
CREATE POLICY "Public read certificate storage"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'certificates');

CREATE POLICY "Admin insert certificate storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND public.is_admin());

CREATE POLICY "Admin update certificate storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'certificates' AND public.is_admin());

CREATE POLICY "Admin delete certificate storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'certificates' AND public.is_admin());

-- 5. Seed verified initial certificate records (Idempotent)
INSERT INTO public.certificates (
  id,
  title,
  issuer,
  issue_date,
  category,
  skills,
  featured,
  sort_order
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'The Joy of Computing using Python',
    'NPTEL / SWAYAM',
    'Verified Course Completion',
    'Programming & Computer Science',
    ARRAY['Python', 'Algorithms', 'Problem Solving', 'Data Processing'],
    true,
    1
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'DSA for Product-Based Companies',
    'ExcelR',
    'Verified Course Completion',
    'Data Structures & Algorithms',
    ARRAY['Data Structures', 'Algorithms', 'System Optimization', 'Problem Solving'],
    true,
    2
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Google Prompting Essentials',
    'Google',
    'Verified Course Completion',
    'Artificial Intelligence & Tools',
    ARRAY['Prompt Engineering', 'Large Language Models', 'AI Workflow Integration'],
    true,
    3
  )
ON CONFLICT (id) DO NOTHING;
