-- Run this once in the Supabase SQL editor for your project.
create table if not exists kv_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- Row Level Security stays on, but all access goes through the serverless
-- functions using the service role key, so no policies are needed for this
-- single-user setup. If you later add real multi-user auth, add a user_id
-- column and RLS policies scoped to auth.uid().
alter table kv_store enable row level security;
