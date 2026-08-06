-- Recall: extensions + enums
-- Safe to re-run: uses IF NOT EXISTS / DO blocks throughout.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists vector;
create extension if not exists pg_trgm;

do $$ begin
  create type item_type as enum ('link', 'image', 'pdf', 'note', 'receipt');
exception when duplicate_object then null; end $$;

do $$ begin
  create type processing_status as enum ('uploaded', 'queued', 'processing', 'completed', 'failed', 'needs_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_category as enum (
    'image', 'product', 'receipt', 'article', 'recipe', 'travel',
    'restaurant', 'video', 'document', 'note', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_id as enum ('free', 'pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type return_status as enum ('open', 'returned', 'expired', 'not_applicable');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'none');
exception when duplicate_object then null; end $$;
