-- Task assignees table
create table public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id text references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(task_id, user_id)
);

alter table public.task_assignees enable row level security;

-- Security definer function to check task access without RLS recursion
create or replace function public.current_user_can_access_task(task_id_param text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.tasks t
    join public.projects p on p.id = t.project_id
    where t.id = task_id_param
    and (
      p.owner_id = auth.uid() or
      exists (
        select 1 from public.project_members pm
        where pm.project_id = p.id and pm.user_id = auth.uid()
      )
    )
  );
$$;

create policy "task_assignees: project access" on public.task_assignees
  for all using (public.current_user_can_access_task(task_id));

-- Enable Realtime for tasks and task_assignees
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_assignees;
