-- Sharing features: invite by email, member visibility, view-only token access
-- Run this in Supabase SQL editor.

-- 1. Allow members to see all collaborators in their project (not just their own row).
--    Uses a security definer function to avoid recursive RLS.
CREATE OR REPLACE FUNCTION public.current_user_is_project_member(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = project_uuid AND user_id = auth.uid()
  );
$$;

-- Drop the old "self read" policy and add one that lets members see all project members.
DROP POLICY IF EXISTS "members: self read" ON public.project_members;
CREATE POLICY "members: project read" ON public.project_members
  FOR SELECT USING (
    public.current_user_owns_project(project_id)
    OR public.current_user_is_project_member(project_id)
  );


-- 2. Look up a profile by email (for invite-by-email flow).
--    Returns minimal data; only callable by authenticated users.
CREATE OR REPLACE FUNCTION public.find_profile_by_email(p_email text)
RETURNS TABLE(id uuid, display_name text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.display_name, p.email
  FROM public.profiles p
  WHERE LOWER(p.email) = LOWER(p_email)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_profile_by_email(text) TO authenticated;


-- 3. View-only access via share token (callable by unauthenticated/anon users).
CREATE OR REPLACE FUNCTION public.get_project_by_share_token(p_token uuid)
RETURNS TABLE(
  id uuid, name text, client_name text, description text, slug text,
  owner_id uuid, created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.client_name, p.description, p.slug, p.owner_id, p.created_at
  FROM public.projects p
  JOIN public.project_share_tokens pst ON pst.project_id = p.id
  WHERE pst.token = p_token
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_project_by_share_token(uuid) TO anon;


CREATE OR REPLACE FUNCTION public.get_tasks_by_share_token(p_token uuid)
RETURNS TABLE(
  id text, project_id uuid, title text, description text, priority text,
  feature_area text, status text, source text, notes text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
BEGIN
  SELECT pst.project_id INTO v_project_id
  FROM public.project_share_tokens pst
  WHERE pst.token = p_token;

  IF v_project_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT t.id, t.project_id, t.title, t.description, t.priority,
         t.feature_area, t.status, t.source, t.notes, t.created_at, t.updated_at
  FROM public.tasks t
  WHERE t.project_id = v_project_id
  ORDER BY t.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tasks_by_share_token(uuid) TO anon;
