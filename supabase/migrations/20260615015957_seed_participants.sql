insert into public.participants (name, slug, password_hash)
values
  ('Henrique', 'henrique', crypt('14', gen_salt('bf', 12))),
  ('Cauã Victor', 'caua-victor', crypt('27', gen_salt('bf', 12))),
  ('Clarinha', 'clarinha', crypt('31', gen_salt('bf', 12))),
  ('Felipe', 'felipe', crypt('46', gen_salt('bf', 12))),
  ('João Victor', 'joao-victor', crypt('52', gen_salt('bf', 12))),
  ('Leonardo Filho', 'leonardo-filho', crypt('68', gen_salt('bf', 12))),
  ('Mariah Norat', 'mariah-norat', crypt('73', gen_salt('bf', 12))),
  ('Miguel Antônio', 'miguel-antonio', crypt('85', gen_salt('bf', 12))),
  ('Giullia', 'giullia', crypt('19', gen_salt('bf', 12))),
  ('Isabela', 'isabela', crypt('24', gen_salt('bf', 12))),
  ('Júlia Barros', 'julia-barros', crypt('37', gen_salt('bf', 12))),
  ('Lucas Gabriel', 'lucas-gabriel', crypt('41', gen_salt('bf', 12))),
  ('Hellô', 'hello', crypt('56', gen_salt('bf', 12))),
  ('Mariah Serrano', 'mariah-serrano', crypt('62', gen_salt('bf', 12))),
  ('Samuel', 'samuel', crypt('79', gen_salt('bf', 12))),
  ('Hanna', 'hanna', crypt('83', gen_salt('bf', 12))),
  ('Jaya', 'jaya', crypt('95', gen_salt('bf', 12))),
  ('Leo Azevedo', 'leo-azevedo', crypt('12', gen_salt('bf', 12))),
  ('Malu', 'malu', crypt('34', gen_salt('bf', 12))),
  ('Marina', 'marina', crypt('58', gen_salt('bf', 12))),
  ('Mariah Alves', 'mariah-alves', crypt('76', gen_salt('bf', 12)))
on conflict (slug) do update
set
  name = excluded.name,
  password_hash = excluded.password_hash;
