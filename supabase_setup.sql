-- ============================================================
-- VIDEO LEDGER – COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Execute this entire script in Supabase Dashboard -> SQL Editor
-- ============================================================

-- ─── 1. EXTENSIONS ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. PROFILES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. VIDEOS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_number  TEXT NOT NULL,
  editing_date  DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'progress'
                  CHECK (status IN ('progress', 'done')),
  notes         TEXT CHECK (char_length(notes) <= 140),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. PERFORMANCE INDEXES ──────────────────────────────────
CREATE INDEX IF NOT EXISTS videos_user_id_idx        ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS videos_editing_date_idx   ON public.videos(editing_date);
CREATE INDEX IF NOT EXISTS videos_status_idx         ON public.videos(status);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx    ON public.profiles(full_name);

-- ─── 5. AUTOMATIC TIMESTAMP TRIGGER FUNCTION ─────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_videos_updated_at ON public.videos;
CREATE TRIGGER set_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── 6. AUTOMATIC USER PROFILE CREATION ON SIGNUP ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 7. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos   ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES:
-- 1. Anyone (public visitors & authenticated users) can view employee profiles
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- 2. Authenticated users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Authenticated users can update ONLY their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Authenticated users can delete ONLY their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);


-- VIDEOS POLICIES:
-- 1. Anyone (public visitors & authenticated users) can view video entries (public ledger)
DROP POLICY IF EXISTS "Public can view videos" ON public.videos;
CREATE POLICY "Public can view videos"
  ON public.videos FOR SELECT
  USING (true);

-- 2. Authenticated users can insert video entries ONLY for their own user_id
DROP POLICY IF EXISTS "Users can insert own videos" ON public.videos;
CREATE POLICY "Users can insert own videos"
  ON public.videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Authenticated users can update ONLY their own video entries
DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
CREATE POLICY "Users can update own videos"
  ON public.videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Authenticated users can delete ONLY their own video entries
DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── 8. STORAGE CONFIGURATION FOR AVATARS BUCKET ─────────────
-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies:
-- 1. Anyone can view avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Authenticated users can update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Authenticated users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

