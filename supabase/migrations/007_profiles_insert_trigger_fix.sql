-- Allow profile creation on signup (trigger + RLS)
-- 1. Policy so trigger or auth can insert profile when auth.uid() = id
DROP POLICY IF EXISTS "allow_profile_insert_on_signup" ON profiles;
CREATE POLICY "allow_profile_insert_on_signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Policy so SECURITY DEFINER trigger (running as postgres) can insert
DROP POLICY IF EXISTS "allow_postgres_insert_profiles" ON profiles;
CREATE POLICY "allow_postgres_insert_profiles" ON profiles
  FOR INSERT TO postgres WITH CHECK (true);

-- 3. Trigger: set full_name and phone from signup metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
