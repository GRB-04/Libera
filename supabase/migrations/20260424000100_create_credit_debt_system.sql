create table if not exists public.credit_loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  principal_amount numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  monthly_interest_rate numeric(5,4) not null default 0.05,
  late_fee_rate numeric(5,4) not null default 0.02,
  late_interest_daily_rate numeric(5,4) not null default 0.0033,

  installments_count integer not null,
  status text not null default 'active'
    check (status in ('active', 'paid', 'late', 'defaulted', 'cancelled')),

  risk_level text not null
    check (risk_level in ('low', 'medium', 'high')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_installments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.credit_loans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  installment_number integer not null,
  due_date date not null,

  base_amount numeric(12,2) not null,
  late_fee_amount numeric(12,2) not null default 0,
  late_interest_amount numeric(12,2) not null default 0,
  total_due numeric(12,2) not null,

  paid_amount numeric(12,2) not null default 0,
  paid_at timestamptz,

  status text not null default 'pending'
    check (status in ('pending', 'paid', 'late', 'defaulted')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.protection_fund_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  loan_id uuid references public.credit_loans(id) on delete set null,

  type text not null
    check (type in ('reserve', 'loss_cover', 'adjustment')),

  amount numeric(12,2) not null,
  description text,

  created_at timestamptz not null default now()
);

alter table public.credit_loans enable row level security;
alter table public.credit_installments enable row level security;
alter table public.protection_fund_entries enable row level security;

create policy "Users can view own loans"
on public.credit_loans
for select
using (auth.uid() = user_id);

create policy "Users can view own installments"
on public.credit_installments
for select
using (auth.uid() = user_id);

create policy "Users can insert own loans"
on public.credit_loans
for insert
with check (auth.uid() = user_id);

create policy "Users can insert own installments"
on public.credit_installments
for insert
with check (auth.uid() = user_id);

create policy "Users can update own installments"
on public.credit_installments
for update
using (auth.uid() = user_id);

create policy "Users can update own loans"
on public.credit_loans
for update
using (auth.uid() = user_id);