-- Migration: Remove public.users table and use auth.users instead
-- Description: Removes the custom users table and uses Supabase auth.users directly
-- Author: System
-- Date: 2025-09-29

-- Step 1: Drop the trigger that syncs auth.users to public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Drop foreign key constraint from quotations to public.users
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_user_id_fkey;

-- Step 3: Add new foreign key constraint to auth.users
-- Note: We need to grant permission to reference auth.users
GRANT REFERENCES ON auth.users TO postgres;
ALTER TABLE quotations ADD CONSTRAINT quotations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Update RLS policies to use auth.uid() directly
-- (They already do, so this is just for documentation)

-- Step 5: Drop the public.users table
DROP TABLE IF EXISTS public.users CASCADE;