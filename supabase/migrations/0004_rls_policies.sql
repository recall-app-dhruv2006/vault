-- Vault: Row Level Security
-- Every user-owned table is locked to auth.uid() = user_id. Join tables are
-- locked through their parent's ownership via EXISTS subqueries. No table
-- relies on frontend filtering — the service-role client (which bypasses
-- RLS) is only ever used server-side for background processing.

alter table profiles enable row level security;
alter table items enable row level security;
alter table item_embeddings enable row level security;
alter table tags enable row level security;
alter table item_tags enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table receipts enable row level security;
alter table receipt_line_items enable row level security;
alter table search_history enable row level security;
alter table item_views enable row level security;
alter table user_settings enable row level security;
alter table subscriptions enable row level security;
alter table analytics_events enable row level security;

-- profiles ------------------------------------------------------------
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- items -----------------------------------------------------------------
drop policy if exists "items_select_own" on items;
create policy "items_select_own" on items for select using (auth.uid() = user_id);
drop policy if exists "items_insert_own" on items;
create policy "items_insert_own" on items for insert with check (auth.uid() = user_id);
drop policy if exists "items_update_own" on items;
create policy "items_update_own" on items for update using (auth.uid() = user_id);
drop policy if exists "items_delete_own" on items;
create policy "items_delete_own" on items for delete using (auth.uid() = user_id);

-- item_embeddings ---------------------------------------------------------
drop policy if exists "item_embeddings_select_own" on item_embeddings;
create policy "item_embeddings_select_own" on item_embeddings for select using (auth.uid() = user_id);
drop policy if exists "item_embeddings_insert_own" on item_embeddings;
create policy "item_embeddings_insert_own" on item_embeddings for insert with check (auth.uid() = user_id);
drop policy if exists "item_embeddings_delete_own" on item_embeddings;
create policy "item_embeddings_delete_own" on item_embeddings for delete using (auth.uid() = user_id);

-- tags --------------------------------------------------------------------
drop policy if exists "tags_all_own" on tags;
create policy "tags_all_own" on tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- item_tags (ownership via parent items row) -------------------------------
drop policy if exists "item_tags_select_own" on item_tags;
create policy "item_tags_select_own" on item_tags for select using (
  exists (select 1 from items where items.id = item_tags.item_id and items.user_id = auth.uid())
);
drop policy if exists "item_tags_insert_own" on item_tags;
create policy "item_tags_insert_own" on item_tags for insert with check (
  exists (select 1 from items where items.id = item_tags.item_id and items.user_id = auth.uid())
  and exists (select 1 from tags where tags.id = item_tags.tag_id and tags.user_id = auth.uid())
);
drop policy if exists "item_tags_delete_own" on item_tags;
create policy "item_tags_delete_own" on item_tags for delete using (
  exists (select 1 from items where items.id = item_tags.item_id and items.user_id = auth.uid())
);

-- collections ---------------------------------------------------------------
drop policy if exists "collections_all_own" on collections;
create policy "collections_all_own" on collections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- collection_items ------------------------------------------------------------
drop policy if exists "collection_items_select_own" on collection_items;
create policy "collection_items_select_own" on collection_items for select using (
  exists (select 1 from collections where collections.id = collection_items.collection_id and collections.user_id = auth.uid())
);
drop policy if exists "collection_items_insert_own" on collection_items;
create policy "collection_items_insert_own" on collection_items for insert with check (
  exists (select 1 from collections where collections.id = collection_items.collection_id and collections.user_id = auth.uid())
  and exists (select 1 from items where items.id = collection_items.item_id and items.user_id = auth.uid())
);
drop policy if exists "collection_items_delete_own" on collection_items;
create policy "collection_items_delete_own" on collection_items for delete using (
  exists (select 1 from collections where collections.id = collection_items.collection_id and collections.user_id = auth.uid())
);

-- receipts ---------------------------------------------------------------------
drop policy if exists "receipts_all_own" on receipts;
create policy "receipts_all_own" on receipts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- receipt_line_items (ownership via parent receipt) -----------------------------
drop policy if exists "receipt_line_items_select_own" on receipt_line_items;
create policy "receipt_line_items_select_own" on receipt_line_items for select using (
  exists (select 1 from receipts where receipts.id = receipt_line_items.receipt_id and receipts.user_id = auth.uid())
);
drop policy if exists "receipt_line_items_write_own" on receipt_line_items;
create policy "receipt_line_items_write_own" on receipt_line_items for all using (
  exists (select 1 from receipts where receipts.id = receipt_line_items.receipt_id and receipts.user_id = auth.uid())
) with check (
  exists (select 1 from receipts where receipts.id = receipt_line_items.receipt_id and receipts.user_id = auth.uid())
);

-- search_history ------------------------------------------------------------------
drop policy if exists "search_history_all_own" on search_history;
create policy "search_history_all_own" on search_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- item_views -----------------------------------------------------------------------
drop policy if exists "item_views_all_own" on item_views;
create policy "item_views_all_own" on item_views for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_settings ----------------------------------------------------------------------
drop policy if exists "user_settings_all_own" on user_settings;
create policy "user_settings_all_own" on user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- subscriptions ------------------------------------------------------------------------
drop policy if exists "subscriptions_select_own" on subscriptions;
create policy "subscriptions_select_own" on subscriptions for select using (auth.uid() = user_id);
-- Inserts/updates to subscriptions happen only via the service-role client
-- (Stripe webhook handler), never directly from an authenticated user.

-- analytics_events ----------------------------------------------------------------------
drop policy if exists "analytics_events_insert_own" on analytics_events;
create policy "analytics_events_insert_own" on analytics_events for insert with check (auth.uid() = user_id);
drop policy if exists "analytics_events_select_own" on analytics_events;
create policy "analytics_events_select_own" on analytics_events for select using (auth.uid() = user_id);
