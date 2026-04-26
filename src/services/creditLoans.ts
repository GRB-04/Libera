import { supabase } from '@/integrations/supabase/client'
import {
  calculateLateInstallment,
  calculateLoan,
  type CreateLoanInput,
} from '@/engine/debtEngine'

export async function createCreditLoan(input: CreateLoanInput) {
  const calculation = calculateLoan(input)

  const { data: loan, error: loanError } = await supabase
    .from('credit_loans')
    .insert({
      user_id: input.userId,
      principal_amount: calculation.principalAmount,
      total_amount: calculation.totalAmount,
      monthly_interest_rate: calculation.monthlyInterestRate,
      late_fee_rate: calculation.lateFeeRate,
      late_interest_daily_rate: calculation.lateInterestDailyRate,
      installments_count: input.installmentsCount,
      risk_level: input.riskLevel,
      status: 'active',
    })
    .select()
    .single()

  if (loanError) {
    throw loanError
  }

  const installmentsPayload = calculation.installments.map((installment) => ({
    loan_id: loan.id,
    user_id: input.userId,
    installment_number: installment.installmentNumber,
    due_date: installment.dueDate,
    base_amount: installment.baseAmount,
    total_due: installment.totalDue,
    status: 'pending',
  }))

  const { error: installmentsError } = await supabase
    .from('credit_installments')
    .insert(installmentsPayload)

  if (installmentsError) {
    throw installmentsError
  }

  const { error: fundError } = await supabase
    .from('protection_fund_entries')
    .insert({
      user_id: input.userId,
      loan_id: loan.id,
      type: 'reserve',
      amount: calculation.protectionFundReserve,
      description: 'Reserva automática de 20% dos juros para fundo de proteção.',
    })

  if (fundError) {
    throw fundError
  }

  return loan
}

export async function getUserLoans(userId: string) {
  const { data, error } = await supabase
    .from('credit_loans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getLoanInstallments(loanId: string) {
  const { data, error } = await supabase
    .from('credit_installments')
    .select('*')
    .eq('loan_id', loanId)
    .order('installment_number', { ascending: true })

  if (error) throw error

  return data
}

export async function updateOverdueInstallments(userId: string) {
  const { data: installments, error } = await supabase
    .from('credit_installments')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'paid')

  if (error) throw error

  for (const installment of installments ?? []) {
    const lateResult = calculateLateInstallment({
      baseAmount: Number(installment.base_amount),
      dueDate: installment.due_date,
      paidAmount: Number(installment.paid_amount ?? 0),
    })

    if (lateResult.status !== installment.status) {
      await supabase
        .from('credit_installments')
        .update({
          late_fee_amount: lateResult.lateFeeAmount,
          late_interest_amount: lateResult.lateInterestAmount,
          total_due: lateResult.totalDue,
          status: lateResult.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', installment.id)
    }
  }
}

export async function payInstallment(params: {
  installmentId: string
  amount: number
}) {
  const { data: installment, error: readError } = await supabase
    .from('credit_installments')
    .select('*')
    .eq('id', params.installmentId)
    .single()

  if (readError) throw readError

  const paidAmount = Number(installment.paid_amount ?? 0) + params.amount
  const totalDue = Number(installment.total_due)

  const isFullyPaid = paidAmount >= totalDue

  const { data, error } = await supabase
    .from('credit_installments')
    .update({
      paid_amount: paidAmount,
      paid_at: isFullyPaid ? new Date().toISOString() : installment.paid_at,
      status: isFullyPaid ? 'paid' : installment.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.installmentId)
    .select()
    .single()

  if (error) throw error

  return data
}