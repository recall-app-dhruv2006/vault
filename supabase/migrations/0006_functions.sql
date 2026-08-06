-- Vault: triggers + RPC functions

-- updated_at maintenance -----------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_items_updated_at on items;
create trigger trg_items_updated_at before update on items
  for each row execute function set_updated_at();

drop trigger if exists trg_collections_updated_at on collections;
create trigger trg_collections_updated_at before update on collections
  for each row execute function set_updated_at();

drop trigger if exists trg_receipts_updated_at on receipts;
create trigger trg_receipts_updated_at before update on receipts
  for each row execute function set_updated_at();

drop trigger if exists trg_user_settings_updated_at on user_settings;
create trigger trg_user_settings_updated_at before update on user_settings
  for each row execute function set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- New user bootstrap ----------------------------------------------------------
-- Runs as SECURITY DEFINER so it can insert into profiles/user_settings/
-- subscriptions for a brand-new auth.users row before any session-scoped
-- RLS policy would otherwise apply.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'none')
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Semantic search RPC -----------------------------------------------------------
-- Returns the best-matching embedding chunk per item for a user, scoped
-- strictly to that user's own rows (never crosses between users).
create or replace function match_item_embeddings(
  query_embedding vector(1024),
  match_user_id uuid,
  match_count int default 40,
  similarity_threshold float default 0.15
)
returns table (
  item_id uuid,
  chunk_content text,
  page_number int,
  similarity float
) as $$
  select
    ie.item_id,
    ie.content as chunk_content,
    ie.page_number,
    1 - (ie.embedding <=> query_embedding) as similarity
  from item_embeddings ie
  where ie.user_id = match_user_id
    and 1 - (ie.embedding <=> query_embedding) > similarity_threshold
  order by ie.embedding <=> query_embedding
  limit match_count;
$$ language sql stable security invoker;

-- Full-text search RPC ------------------------------------------------------------
create or replace function search_items_fts(
  search_query text,
  match_user_id uuid,
  match_count int default 40
)
returns table (
  item_id uuid,
  rank float
) as $$
  select
    items.id as item_id,
    ts_rank(items.fts, websearch_to_tsquery('english', search_query)) as rank
  from items
  where items.user_id = match_user_id
    and items.deleted_at is null
    and items.fts @@ websearch_to_tsquery('english', search_query)
  order by rank desc
  limit match_count;
$$ language sql stable security invoker;
