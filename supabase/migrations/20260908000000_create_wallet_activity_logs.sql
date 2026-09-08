create table if not exists public.wallet_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('transfer', 'income_received')),
  amount numeric not null check (amount > 0),
  fee numeric not null default 0 check (fee >= 0),
  from_wallet_id uuid references public.wallets(id) on delete set null,
  to_wallet_id uuid references public.wallets(id) on delete set null,
  income_id uuid references public.income(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists wallet_activity_logs_user_created_at_idx
  on public.wallet_activity_logs (user_id, created_at desc);

alter table public.wallet_activity_logs enable row level security;

create policy "Users can view their wallet activity logs"
  on public.wallet_activity_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their wallet activity logs"
  on public.wallet_activity_logs for insert
  with check (auth.uid() = user_id);
