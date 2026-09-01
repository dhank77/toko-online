-- Storage policies for the "products" bucket.
-- Public bucket: files are readable via public URLs.
-- Authenticated users (admins signed in via Supabase auth) may upload/update/delete images.

create policy "products public read"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "products authenticated insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'products' );

create policy "products authenticated update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'products' );

create policy "products authenticated delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'products' );