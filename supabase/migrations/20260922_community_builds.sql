-- Community build gallery for Hunter Companion.
-- Run once in the Supabase SQL editor. Shared builds are explicitly public;
-- private local builds are never uploaded unless the user presses Share.

create table if not exists public.community_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_build_id text not null check (length(local_build_id) between 1 and 120),
  title text not null check (length(title) between 1 and 100),
  game text not null check (game in (
    'Monster Hunter: World',
    'Monster Hunter: Rise',
    'Monster Hunter: Wilds',
    'Monster Hunter: Generations Ultimate'
  )),
  weapon_type text not null check (length(weapon_type) between 1 and 60),
  build_type text not null check (build_type in ('DPS', 'ELEMENTAL', 'STATUS', 'CONFORTO', 'SUPORTE', 'PROGRESSÃO')),
  game_version text not null default 'Não informada' check (length(game_version) <= 60),
  author_name text not null default 'NomeCaçador' check (length(author_name) between 1 and 40),
  payload jsonb not null check (octet_length(payload::text) <= 65536),
  is_public boolean not null default true,
  published_at timestamptz not null default now(),
  constraint community_builds_owner_local_id unique (user_id, local_build_id)
);

create index if not exists community_builds_public_search_idx
  on public.community_builds (game, weapon_type, build_type, published_at desc)
  where is_public = true;

alter table public.community_builds enable row level security;
revoke all on public.community_builds from anon, authenticated;
grant select, insert, update, delete on public.community_builds to authenticated;

drop policy if exists "public builds and owner can read" on public.community_builds;
create policy "public builds and owner can read"
  on public.community_builds for select to authenticated
  using (is_public or auth.uid() = user_id);

drop policy if exists "owner can publish own builds" on public.community_builds;
create policy "owner can publish own builds"
  on public.community_builds for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "owner can update own builds" on public.community_builds;
create policy "owner can update own builds"
  on public.community_builds for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owner can remove own builds" on public.community_builds;
create policy "owner can remove own builds"
  on public.community_builds for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.prepare_community_build()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.payload := coalesce((
    select jsonb_object_agg(entry.key, entry.value)
      from jsonb_each(new.payload) entry
     where entry.key = any (array[
       'id', 'title', 'game', 'weapon', 'weaponId', 'type', 'armor', 'armorIds',
       'armorSkills', 'talisman', 'skills', 'decorations', 'icon', 'createdAt', 'updatedAt'
     ])
  ), '{}'::jsonb);
  select coalesce(nullif(left(u.raw_user_meta_data ->> 'display_name', 40), ''), 'NomeCaçador')
    into new.author_name
    from auth.users u
   where u.id = new.user_id;
  if new.author_name is null then
    new.author_name := 'NomeCaçador';
  end if;
  return new;
end;
$$;
revoke all on function public.prepare_community_build() from public, anon, authenticated;

drop trigger if exists prepare_community_build on public.community_builds;
create trigger prepare_community_build
  before insert or update on public.community_builds
  for each row execute function public.prepare_community_build();

create or replace function public.search_community_builds(
  game_filter text default null,
  weapon_filter text default null,
  type_filter text default null,
  result_limit integer default 40
)
returns table (
  id uuid,
  title text,
  game text,
  weapon_type text,
  build_type text,
  game_version text,
  author_name text,
  payload jsonb,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.id, b.title, b.game, b.weapon_type, b.build_type, b.game_version,
         b.author_name, b.payload, b.published_at
    from public.community_builds b
   where b.is_public = true
     and (game_filter is null or b.game = game_filter)
     and (weapon_filter is null or b.weapon_type = weapon_filter)
     and (type_filter is null or b.build_type = type_filter)
   order by b.published_at desc
   limit greatest(1, least(coalesce(result_limit, 40), 60));
$$;

revoke all on function public.search_community_builds(text, text, text, integer) from public;
grant execute on function public.search_community_builds(text, text, text, integer) to anon, authenticated;

comment on table public.community_builds is
  'Opt-in community builds. Contains only data a user explicitly publishes; never stores account email or private notes.';
