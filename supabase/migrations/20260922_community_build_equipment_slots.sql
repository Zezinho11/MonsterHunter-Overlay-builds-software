-- Preserve the user's explicitly shared talisman and per-piece decorations.
-- Private notes, email and account metadata remain excluded.

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
       'armorSkills', 'talisman', 'talismanId', 'talismanSkills', 'talismanSlots',
       'skills', 'decorations', 'decorationSlots', 'icon', 'createdAt', 'updatedAt'
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
