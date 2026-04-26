import { supabase } from '@/integrations/supabase/client'
import type { Transaction } from '@/engine/creditEngine'

type PluggyTransaction = {
  id: string
  accountId: string
  description?: string
  descriptionRaw?: string
  amount: number
  date: string
  category?: string
  type?: string
}

type PluggyResponse = {
  ok: boolean
  source: string
  debug?: unknown
  items: unknown[]
  accounts: unknown[]
  transactions: PluggyTransaction[]
  message?: string
  error?: string
}

export type PluggyFinancialData = {
  source: string
  rawTransactions: PluggyTransaction[]
  transactions: Transaction[]
  income: number
  expenses: number
  transactionCount: number
  message?: string
  security?: {
    fraudRisk: 'low' | 'medium' | 'high'
    fraudFlags: string[]
    cpfDetected: boolean
    ipCaptured: boolean
    decision: string
  }
}

function normalizePluggyTransaction(transaction: PluggyTransaction): Transaction {
  const amount = Number(transaction.amount)

  return {
    amount: Math.abs(amount),
    date: transaction.date,
    type: amount > 0 ? 'credit' : 'debit',
  }
}

export async function getMeuPluggyFinancialData(): Promise<PluggyFinancialData> {
  const localDataStr = localStorage.getItem('libera_financial_data')
  if (!localDataStr) {
    throw new Error('Nenhum dado financeiro encontrado. Por favor, conecte sua conta novamente no passo anterior.')
  }

  const data = JSON.parse(localDataStr)

  if (data.status === 'CONNECT_ONLY') {
    throw new Error(data.message || 'Dados financeiros ainda não liberados pela API.')
  }

  const rawTransactions: PluggyTransaction[] = []
  
  if (data.transactionsByAccount && Array.isArray(data.transactionsByAccount)) {
    for (const acc of data.transactionsByAccount) {
      if (acc.transactions && Array.isArray(acc.transactions)) {
        rawTransactions.push(...acc.transactions)
      }
    }
  }

  const transactions = rawTransactions.map(normalizePluggyTransaction)

  const income = transactions
    .filter((transaction) => transaction.type === 'credit')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const expenses = transactions
    .filter((transaction) => transaction.type === 'debit')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    source: 'Pluggy Open Finance',
    rawTransactions,
    transactions,
    income,
    expenses,
    transactionCount: transactions.length,
    message: data.security?.fraudFlags?.length ? 'Avisos: ' + data.security.fraudFlags.join(' | ') : undefined,
    security: data.security,
  }
}