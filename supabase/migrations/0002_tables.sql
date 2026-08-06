-- Recall: core tables
-- Embedding dimension: 1024 (Voyage AI voyage-3-lite default). If you switch
-- embedding providers/models, run a follow-up migration to ALTER the
-- `item_embeddings.embedding` column dimension and re-embed all items.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  plan plan_id not null default 'free',
  onboarding_completed boolean not null default false,
  onboarding_step text not null default 'welcome',
  save_preferences jsonb not null default '[]'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table profiles is 'One row per authenticated user, mirrors auth.users.';

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  summary text,
  item_type item_type not null,
  content_category content_category not null default 'other',
  source_url text,
  source_domain text,
  original_filename text,
  storage_path text,
  thumbnail_path text,
  mime_type text,
  file_size bigint,
  raw_text text,
  searchable_text text,
  ai_analysis jsonb,
  user_corrections jsonb not null default '{}'::jsonb,
  processing_status processing_status not null default 'uploaded',
  processing_error text,
  processing_attempts int not null default 0,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_viewed_at timestamptz,
  fts tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(searchable_text, '')), 'C')
  ) stored
);
comment on table items is 'Every piece of content a user has saved into their memory library.';

create table if not exists item_embeddings (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  embedding vector(1024),
  chunk_index int not null default 0,
  page_number int,
  created_at timestamptz not null default now()
);
comment on table item_embeddings is 'Chunked, embedded text for semantic search. Multiple rows per item for PDFs.';

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, normalized_name)
);

create table if not exists item_tags (
  item_id uuid not null references items(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_image_path text,
  icon text not null default 'folder',
  is_smart boolean not null default false,
  smart_filter jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists collection_items (
  collection_id uuid not null references collections(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, item_id)
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant text,
  purchase_date date,
  subtotal numeric(12, 2),
  tax numeric(12, 2),
  total numeric(12, 2),
  currency text not null default 'USD',
  order_number text,
  payment_method text,
  store_category text,
  return_deadline date,
  return_deadline_source text not null default 'none' check (return_deadline_source in ('extracted', 'manual', 'none')),
  return_status return_status not null default 'not_applicable',
  reminder_enabled boolean not null default true,
  warranty_end date,
  extraction_confidence numeric(3, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id)
);

create table if not exists receipt_line_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  name text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2),
  total_price numeric(12, 2)
);

create table if not exists search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  filters jsonb,
  result_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists item_views (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  default_view text not null default 'grid' check (default_view in ('grid', 'list')),
  default_sort text not null default 'recent' check (default_sort in ('recent', 'oldest', 'title', 'relevance')),
  items_per_page int not null default 24,
  auto_summarize boolean not null default true,
  auto_tagging boolean not null default true,
  receipt_extraction boolean not null default true,
  suggested_collections boolean not null default true,
  email_notifications boolean not null default true,
  return_reminders boolean not null default true,
  processing_notifications boolean not null default true,
  product_updates boolean not null default false,
  data_processing_preferences jsonb not null default '{"ai_analysis": true, "ocr": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_customer_id text,
  provider_subscription_id text,
  plan plan_id not null default 'free',
  status subscription_status not null default 'none',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
comment on table analytics_events is 'Privacy-conscious first-party event log. Never stores raw search text or item content — metadata only (counts, ids, booleans).';
