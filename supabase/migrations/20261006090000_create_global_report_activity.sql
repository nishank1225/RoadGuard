-- Global RoadGuard report activity
-- Returns only aggregated daily counts.
-- Individual report rows are never exposed.

create or replace function public.get_global_report_activity(
  p_days integer default 365
)
returns table (
  report_date date,
  report_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    created_at::date as report_date,
    count(*)::bigint as report_count
  from public.reports
  where created_at >= current_date - greatest(
    least(coalesce(p_days, 365), 3650),
    1
  )
  group by created_at::date
  order by created_at::date;
$$;

-- Only authenticated users can call this function.
revoke all on function public.get_global_report_activity(integer)
from public;

grant execute on function public.get_global_report_activity(integer)
to authenticated;