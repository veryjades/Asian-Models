-- Manual verification probes for the Phase 2 policy boundary.
-- Run with a privileged SQL editor connection. Every data mutation is rolled back.

begin;
set local role authenticated;
set local request.jwt.claims = '{"app_metadata":{"role":"viewer"}}';

select public.current_app_role() as viewer_role;
select count(*) as viewer_model_rows from public.models;

do $$
begin
  begin
    insert into public.models (name, display_name, gender, category)
    values ('__viewer_policy_probe__', 'Viewer Probe', 'test', 'test');
    raise exception 'viewer write unexpectedly succeeded';
  exception
    when insufficient_privilege then
      raise notice 'viewer insert correctly rejected by RLS';
  end;
end;
$$;

rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"app_metadata":{"role":"editor"}}';

insert into public.models (name, display_name, gender, category)
values ('__editor_policy_probe__', 'Editor Probe', 'test', 'test');

select count(*) as editor_insert_rows
from public.models
where name = '__editor_policy_probe__';

rollback;
