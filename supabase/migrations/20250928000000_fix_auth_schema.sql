-- Migration: Fix Auth Schema
-- Description: Ensures auth.identities table and proper auth schema configuration
-- Author: System  
-- Date: 2025-09-28

-- The auth schema and its tables are normally created by Supabase automatically,
-- but we need to ensure they exist and are properly configured.

-- Create auth schema if it doesn't exist (should already exist)
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant necessary permissions on auth schema
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- The auth.users table should already exist, but let's ensure it has the right structure
-- and the auth.identities table exists with proper relationships

-- Ensure auth.identities table exists (this is created by Supabase Auth automatically)
-- We don't need to create it manually as it's managed by the auth service

-- Update RLS policies to work with the corrected auth schema
-- Update the existing users RLS policies to ensure they work properly

-- Drop and recreate users RLS policies to ensure they work with the correct auth setup
DROP POLICY IF EXISTS "users can view own profile" ON users;
DROP POLICY IF EXISTS "users can update own profile" ON users;

-- Recreate RLS policies for users table
CREATE POLICY "users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users can update own profile" ON users  
    FOR UPDATE USING (auth.uid() = id);

-- Ensure the handle_new_user function works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'user'))
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    updated_at = now();
  RETURN new;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create an index on auth.users.id for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);

-- Ensure proper grants for the handle_new_user function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;