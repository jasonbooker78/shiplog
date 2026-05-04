-- Fixes infinite recursion between projects and project_members RLS policies.
--
-- The cycle: projects "member read" queries project_members →
--            project_members "owner manages" queries projects → loop.
--
-- Solution: a security definer function checks project ownership outside RLS,
-- so project_members policies no longer trigger projects RLS.

-- Drop the conflicting policies
drop policy if exists "projects: member read" on public.projects;
drop policy if exists "members: owner manages" on public.project_members;
drop policy if exists "members: self read" on public.project_members;

-- Helper: checks ownership by querying projects with RLS bypassed
create or replace function public.current_user_owns_project(project_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects
    where id = project_uuid and owner_id = auth.uid()
  );
$$;

-- project_members: owner can manage via the function (no projects RLS triggered)
create policy "members: owner manages" on public.project_members
  for all using (public.current_user_owns_project(project_id));

-- project_members: member can read their own row (simple, no cross-table ref)
create policy "members: self read" on public.project_members
  for select using (user_id = auth.uid());

-- projects: member read (queries project_members, which is now safe — no cycle)
create policy "projects: member read" on public.projects
  for select using (
    exists (
      select 1 from public.project_members
      where project_id = id and user_id = auth.uid()
    )
  );
