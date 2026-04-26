import { supabase } from "@/integrations/supabase/client";

export type Installment = {
  id: string
  due_date: string
  amount: number
  status: 'pending' | 'paid' | 'late'
}

export type DebtContract = {
  id: string
  total_amount: number
  principal_amount: number
  installments_count: number
  monthly_rate: number
  created_at: string
  installments: Installment[]
  status: 'active' | 'paid' | 'defaulted'
  user_id?: string
}

export async function getActiveDebt(): Promise<DebtContract | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: debts, error } = await supabase
    .from('debts')
    .select('*, installments(*)')
    .eq('user_id', session.user.id)
    .in('status', ['active', 'defaulted'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !debts || debts.length === 0) return null;

  const debt = debts[0];
  return {
    id: debt.id,
    principal_amount: debt.principal_amount,
    total_amount: debt.total_amount,
    installments_count: debt.installments_count,
    monthly_rate: debt.monthly_rate,
    created_at: debt.created_at,
    status: debt.status,
    user_id: debt.user_id,
    installments: (debt.installments || []).map((i: any) => ({
      id: i.id,
      due_date: i.due_date,
      amount: i.amount,
      status: i.status
    }))
  };
}

export async function saveDebt(contract: DebtContract) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Usuário não autenticado");

  // Save Debt
  const { error: debtError } = await supabase
    .from('debts')
    .insert({
      id: contract.id,
      user_id: session.user.id,
      principal_amount: contract.principal_amount,
      total_amount: contract.total_amount,
      installments_count: contract.installments_count,
      monthly_rate: contract.monthly_rate,
      status: 'active'
    });

  if (debtError) throw debtError;

  // Save Installments
  const installmentsToInsert = contract.installments.map(i => ({
    id: i.id,
    debt_id: contract.id,
    due_date: i.due_date,
    amount: i.amount,
    status: 'pending'
  }));

  const { error: instError } = await supabase
    .from('installments')
    .insert(installmentsToInsert);

  if (instError) throw instError;
}

export async function payInstallment(installmentId: string) {
  const { error } = await supabase
    .from('installments')
    .update({ status: 'paid' })
    .eq('id', installmentId);

  if (error) return false;

  // Check if all installments are paid to close the debt
  const { data: installment } = await supabase
    .from('installments')
    .select('debt_id')
    .eq('id', installmentId)
    .single();

  if (installment) {
    const { data: remaining } = await supabase
      .from('installments')
      .select('id')
      .eq('debt_id', installment.debt_id)
      .neq('status', 'paid');

    if (remaining && remaining.length === 0) {
      await supabase
        .from('debts')
        .update({ status: 'paid' })
        .eq('id', installment.debt_id);
        
      // Award bonus for on-time payment
      const { data: profile } = await supabase.from('profiles').select('limit_bonus').single();
      const currentBonus = profile?.limit_bonus || 0;
      
      const { data: debt } = await supabase.from('debts').select('principal_amount').eq('id', installment.debt_id).single();
      if (debt) {
        await supabase.from('profiles').update({ 
          limit_bonus: currentBonus + (debt.principal_amount * 0.15) 
        }).eq('id', (await supabase.auth.getUser()).data.user?.id);
      }
    }
  }

  // Trigger broadcast for real-time UI updates
  const channel = supabase.channel('payments');
  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'paid',
        payload: { installmentId }
      });
    }
  });

  return true;
}

export async function payAllInstallments(debtId: string) {
  const { error: instError } = await supabase
    .from('installments')
    .update({ status: 'paid' })
    .eq('debt_id', debtId);

  if (instError) return false;

  await supabase
    .from('debts')
    .update({ status: 'paid' })
    .eq('id', debtId);

  // Trigger broadcast
  const channel = supabase.channel('payments');
  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'paid',
        payload: { debtId }
      });
    }
  });

  return true;
}

export function calculateDynamicLimit(baseLimit: number, debt: DebtContract | null, bonus: number = 0): number {
  if (!debt) {
    return baseLimit + bonus
  }

  if (debt.status === 'defaulted') {
    return 0
  }

  const paidInstallments = debt.installments.filter((i) => i.status === 'paid').length
  const paidRatio = paidInstallments / debt.installments_count
  const principalPaid = debt.principal_amount * paidRatio

  const available = baseLimit - debt.principal_amount + principalPaid + bonus
  return Math.max(0, Math.round(available))
}

export function calculateDynamicScore(baseScore: number, debt: DebtContract | null): number {
  if (!debt) return baseScore

  if (debt.status === 'defaulted') {
    return Math.max(0, baseScore - 200)
  }

  const paidInstallments = debt.installments.filter((i) => i.status === 'paid').length
  return Math.min(1000, baseScore + (paidInstallments * 20))
}

export async function simulateLatePayment() {
  const debt = await getActiveDebt();
  if (!debt || debt.status === 'paid' || debt.status === 'defaulted') return false

  const nextInstallment = debt.installments.find((i) => i.status === 'pending')
  if (!nextInstallment) return false

  await supabase.from('installments').update({ status: 'late' }).eq('id', nextInstallment.id);
  await supabase.from('debts').update({ status: 'defaulted' }).eq('id', debt.id);

  return true;
}

export function simulateContract(
  principalAmount: number,
  installmentsCount: number,
  monthlyRate: number = 0.029,
): DebtContract {
  const i = monthlyRate
  const n = installmentsCount
  const parcela = (principalAmount * i) / (1 - Math.pow(1 + i, -n))
  const totalAmount = parcela * n

  const installments: Installment[] = []
  for (let idx = 1; idx <= n; idx++) {
    const date = new Date()
    date.setMonth(date.getMonth() + idx)
    installments.push({
      id: `inst-${Math.random().toString(36).substr(2, 9)}`,
      due_date: date.toISOString(),
      amount: parcela,
      status: 'pending',
    })
  }

  return {
    id: `LBR-${Math.floor(Math.random() * 9000) + 1000}`,
    principal_amount: principalAmount,
    total_amount: totalAmount,
    installments_count: installmentsCount,
    monthly_rate: monthlyRate,
    created_at: new Date().toISOString(),
    installments,
    status: 'active',
  }
}