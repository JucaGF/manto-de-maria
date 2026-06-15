insert into public.participants (name, slug, password_hash)
values
  ('Aline', 'aline', crypt('43', gen_salt('bf', 12))),
  ('Lisandro', 'lisandro', crypt('92', gen_salt('bf', 12))),
  ('Joaquim', 'joaquim', crypt('67', gen_salt('bf', 12))),
  ('Clara Melo', 'clara-melo', crypt('38', gen_salt('bf', 12)))
on conflict (slug) do update
set
  name = excluded.name,
  password_hash = excluded.password_hash;
