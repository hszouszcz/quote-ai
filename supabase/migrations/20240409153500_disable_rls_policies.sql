-- Migration: Disable RLS Policies
-- Description: Disables all RLS policies from quotations, users, and related tables
-- Author: System
-- Date: 2024-04-09

-- disable policies for users table
drop policy if exists "users can view own profile" on users;
drop policy if exists "users can update own profile" on users;

-- disable policies for quotations table
drop policy if exists "users can view own quotations" on quotations;
drop policy if exists "users can create own quotations" on quotations;
drop policy if exists "users can update own quotations" on quotations;
drop policy if exists "users can delete own quotations" on quotations;

-- disable policies for quotation_platforms table
drop policy if exists "users can view own quotation platforms" on quotation_platforms;
drop policy if exists "users can manage own quotation platforms" on quotation_platforms;

-- disable policies for quotation_tasks table
drop policy if exists "users can view own quotation tasks" on quotation_tasks;
drop policy if exists "users can manage own quotation tasks" on quotation_tasks;

-- disable policies for reviews table
drop policy if exists "users can view own quotation reviews" on reviews;
drop policy if exists "users can manage own quotation reviews" on reviews;

-- disable policies for sessions table
drop policy if exists "users can view own sessions" on sessions;
drop policy if exists "users can manage own sessions" on sessions;

-- disable policies for platforms table
drop policy if exists "authenticated users can read platforms" on platforms;

-- disable row level security on all tables
alter table users disable row level security;
alter table quotations disable row level security;
alter table platforms disable row level security;
alter table quotation_platforms disable row level security;
alter table quotation_tasks disable row level security;
alter table reviews disable row level security;
alter table sessions disable row level security; 