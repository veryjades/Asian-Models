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
set local request.jwt.claims = '{"app_metadata":{"role":"tampered"}}';

select public.current_app_role() as invalid_role_falls_back_to_viewer;

rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"app_metadata":{"role":"viewer"}}';

do $$
begin
  begin
    insert into public.clients (company_name, contact_name, email)
    values ('__viewer_policy_probe__', 'Viewer Probe', 'viewer-probe@example.invalid');
    raise exception 'viewer client write unexpectedly succeeded';
  exception
    when insufficient_privilege then
      raise notice 'viewer client insert correctly rejected by RLS';
  end;
end;
$$;

rollback;

begin;
set local role authenticated;
set local request.jwt.claims = '{"app_metadata":{"role":"admin"}}';

insert into public.models (name, display_name, gender, category)
values ('__admin_policy_probe__', 'Admin Probe', 'test', 'test');

delete from public.models where name = '__admin_policy_probe__';
select 'admin delete succeeded inside rollback transaction' as admin_delete_result;

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
