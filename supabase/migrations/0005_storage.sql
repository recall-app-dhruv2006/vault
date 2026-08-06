-- Vault: private storage buckets + policies
-- Paths are always {user_id}/{item_id}/{filename}, so ownership can be
-- checked from the path itself via storage.foldername(name).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('originals', 'originals', false, 104857600, array[
    'image/jpeg','image/png','image/webp','image/heic',
    'application/pdf'
  ]),
  ('thumbnails', 'thumbnails', false, 10485760, array['image/jpeg','image/webp','image/png']),
  ('avatars', 'avatars', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "originals_owner_select" on storage.objects;
create policy "originals_owner_select" on storage.objects for select using (
  bucket_id = 'originals' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "originals_owner_insert" on storage.objects;
create policy "originals_owner_insert" on storage.objects for insert with check (
  bucket_id = 'originals' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "originals_owner_delete" on storage.objects;
create policy "originals_owner_delete" on storage.objects for delete using (
  bucket_id = 'originals' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "thumbnails_owner_select" on storage.objects;
create policy "thumbnails_owner_select" on storage.objects for select using (
  bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "thumbnails_owner_insert" on storage.objects;
create policy "thumbnails_owner_insert" on storage.objects for insert with check (
  bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "thumbnails_owner_delete" on storage.objects;
create policy "thumbnails_owner_delete" on storage.objects for delete using (
  bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_owner_select" on storage.objects;
create policy "avatars_owner_select" on storage.objects for select using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
