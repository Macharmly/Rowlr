alter table public.wallet_activity_logs
  drop constraint if exists wallet_activity_logs_activity_type_check;

alter table public.wallet_activity_logs
  add constraint wallet_activity_logs_activity_type_check
  check (activity_type in ('transfer', 'income_received', 'expense_paid', 'bill_paid'));

alter table public.wallet_activity_logs
  add column if not exists expense_id uuid references public.expenses(id) on delete set null,
  add column if not exists bill_id uuid references public.bills(id) on delete set null;
