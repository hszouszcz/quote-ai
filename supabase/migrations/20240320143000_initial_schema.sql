-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for AI Wycena application
-- Tables: users, quotations, platforms, quotation_platforms, quotation_tasks, reviews, sessions
-- Author: System
-- Date: 2024-03-20

-- enable pgcrypto for uuid generation
create extension if not exists "pgcrypto";

-- users table
create table users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) not null unique,
    role varchar(50) not null,
    hashed_password text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- enable rls on users
alter table users enable row level security;

-- rls policies for users
create policy "users can view own profile" on users
    for select using (auth.uid() = id);

create policy "users can update own profile" on users
    for update using (auth.uid() = id);

-- platforms table (lookup table)
create table platforms (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    created_at timestamptz default now() not null
);

-- enable rls on platforms
alter table platforms enable row level security;

-- rls policies for platforms (readable by all authenticated users)
create policy "authenticated users can read platforms" on platforms
    for select using (auth.role() = 'authenticated');

-- quotations table
create table quotations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    estimation_type varchar(50) not null,
    scope text not null check (char_length(scope) <= 10000),
    man_days numeric not null,
    buffer numeric not null,
    dynamic_attributes jsonb,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- enable rls on quotations
alter table quotations enable row level security;

-- rls policies for quotations
create policy "users can view own quotations" on quotations
    for select using (auth.uid() = user_id);

create policy "users can create own quotations" on quotations
    for insert with check (auth.uid() = user_id);

create policy "users can update own quotations" on quotations
    for update using (auth.uid() = user_id);

create policy "users can delete own quotations" on quotations
    for delete using (auth.uid() = user_id);

-- quotation_platforms junction table
create table quotation_platforms (
    quotation_id uuid not null references quotations(id) on delete cascade,
    platform_id uuid not null references platforms(id) on delete cascade,
    primary key (quotation_id, platform_id)
);

-- enable rls on quotation_platforms
alter table quotation_platforms enable row level security;

-- rls policies for quotation_platforms
create policy "users can view own quotation platforms" on quotation_platforms
    for select using (
        exists (
            select 1 from quotations q
            where q.id = quotation_id
            and q.user_id = auth.uid()
        )
    );

create policy "users can manage own quotation platforms" on quotation_platforms
    for all using (
        exists (
            select 1 from quotations q
            where q.id = quotation_id
            and q.user_id = auth.uid()
        )
    );

-- quotation_tasks table
create table quotation_tasks (
    id uuid primary key default gen_random_uuid(),
    quotation_id uuid not null references quotations(id) on delete cascade,
    task_description text not null,
    created_at timestamptz default now() not null
);

-- enable rls on quotation_tasks
alter table quotation_tasks enable row level security;

-- rls policies for quotation_tasks
create policy "users can view own quotation tasks" on quotation_tasks
    for select using (
        exists (
            select 1 from quotations q
            where q.id = quotation_id
            and q.user_id = auth.uid()
        )
    );

create policy "users can manage own quotation tasks" on quotation_tasks
    for all using (
        exists (
            select 1 from quotations q
            where q.id = quotation_id
            and q.user_id = auth.uid()
        )
    );

-- reviews table
create table reviews (
    id uuid primary key default gen_random_uuid(),
    quotation_id uuid not null references quotations(id) on delete cascade,
    rating integer not null check (rating between 1 and 5),
    comment text,
    created_at timestamptz default now() not null
);

-- enable rls on reviews
alter table reviews enable row level security;

-- rls policies for reviews
create policy "users can view own quotation reviews" on reviews
    for select using (
        exists (
            select 1 from quotations q
            where q.id = quotation_id
            and q.user_id = auth.uid()
        )
    );

create policy "users can manage own quotation reviews" on reviews
    for all using (
        exists (
            select 1 from quotations q
            where q.id = quotation_id
            and q.user_id = auth.uid()
        )
    );

-- sessions table
create table sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    session_id varchar(255) not null unique,
    user_agent text,
    errors text,
    created_at timestamptz default now() not null
);

-- enable rls on sessions
alter table sessions enable row level security;

-- rls policies for sessions
create policy "users can view own sessions" on sessions
    for select using (auth.uid() = user_id);

create policy "users can manage own sessions" on sessions
    for all using (auth.uid() = user_id);

-- create indexes
create index idx_quotations_user_id on quotations(user_id);
create index idx_quotation_tasks_quotation_id on quotation_tasks(quotation_id);
create index idx_reviews_quotation_id on reviews(quotation_id);
create index idx_sessions_user_id on sessions(user_id);
create index idx_sessions_created_at on sessions(created_at);

-- trigger for updating updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- add update triggers
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

create trigger update_quotations_updated_at
    before update on quotations
    for each row
    execute function update_updated_at_column(); 