-- profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

-- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text default '',
  description text default '',
  slug text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- tasks
create table public.tasks (
  id text primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text default '',
  priority text default 'medium',
  feature_area text default '',
  status text default 'todo',
  source text default 'manual',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- project_members (collaborators)
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'editor',
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- project_share_tokens (view-only links)
create table public.project_share_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  token uuid default gen_random_uuid() unique not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.project_members enable row level security;
alter table public.project_share_tokens enable row level security;

-- profiles: users see/update their own
create policy "profiles: own" on public.profiles for all using (auth.uid() = id);

-- projects: owner or member can see
create policy "projects: owner" on public.projects for all using (auth.uid() = owner_id);
create policy "projects: member read" on public.projects for select using (
  exists (select 1 from public.project_members where project_id = id and user_id = auth.uid())
);

-- tasks: accessible if user can access the project
create policy "tasks: project access" on public.tasks for all using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
    and (p.owner_id = auth.uid() or exists (
      select 1 from public.project_members pm where pm.project_id = p.id and pm.user_id = auth.uid()
    ))
  )
);

-- project_members: owner manages, member reads own row
create policy "members: owner manages" on public.project_members for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);
create policy "members: self read" on public.project_members for select using (user_id = auth.uid());

-- share tokens: owner manages
create policy "share_tokens: owner" on public.project_share_tokens for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);
-- share tokens: public can read by token (for view-only route)
create policy "share_tokens: public read" on public.project_share_tokens for select using (true);
