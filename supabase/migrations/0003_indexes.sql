-- Vault: indexes

create index if not exists idx_items_user_id on items(user_id) where deleted_at is null;
create index if not exists idx_items_user_status on items(user_id, processing_status);
create index if not exists idx_items_user_type on items(user_id, item_type) where deleted_at is null;
create index if not exists idx_items_user_created on items(user_id, created_at desc) where deleted_at is null;
create index if not exists idx_items_user_favorite on items(user_id, is_favorite) where is_favorite = true and deleted_at is null;
create index if not exists idx_items_deleted_at on items(deleted_at) where deleted_at is not null;
create index if not exists idx_items_fts on items using gin(fts);
create index if not exists idx_items_source_domain on items(user_id, source_domain);
create index if not exists idx_items_trgm_title on items using gin(title gin_trgm_ops);

-- Vector index for semantic search (HNSW: fast approximate nearest neighbor).
create index if not exists idx_item_embeddings_vector on item_embeddings
  using hnsw (embedding vector_cosine_ops);
create index if not exists idx_item_embeddings_item on item_embeddings(item_id);
create index if not exists idx_item_embeddings_user on item_embeddings(user_id);

create index if not exists idx_tags_user on tags(user_id);
create index if not exists idx_item_tags_tag on item_tags(tag_id);

create index if not exists idx_collections_user on collections(user_id);
create index if not exists idx_collection_items_item on collection_items(item_id);

create index if not exists idx_receipts_user on receipts(user_id);
create index if not exists idx_receipts_return_deadline on receipts(user_id, return_deadline) where return_status = 'open';
create index if not exists idx_receipt_line_items_receipt on receipt_line_items(receipt_id);

create index if not exists idx_search_history_user on search_history(user_id, created_at desc);
create index if not exists idx_item_views_item on item_views(item_id);
create index if not exists idx_item_views_user on item_views(user_id, viewed_at desc);

create index if not exists idx_analytics_events_user on analytics_events(user_id, created_at desc);
