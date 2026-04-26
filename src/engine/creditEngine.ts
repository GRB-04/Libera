import type { PluggyFinancialData } from '@/services/pluggy'

export type Transaction = {
  amount: number
  date: string
  type: 'credit' | 'debit'
  description?: string
}

export type CreditAnalysisResult = {
  score: number
  limit: number
  risk: 'low' | 'medium' | 'high'
  decision: 'approved' | 'conservative' | 'denied'
  insights: string[]
  metrics: {
    avgIncome: number
    incomeStdDev: number
    expenseRatio: number
    savingsRate: number
    transactionCount: number
    circularityIndex: number
  }
}

function groupByMonth(transactions: Transaction[]) {
  const map: Record<string, Transaction[]> = {}

  transactions.forEach((transaction) => {
    const month = transaction.date.slice(0, 7)

    if (!map[month]) {
      map[month] = []
    }

    map[month].push(transaction)
  })

  return map
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function stdDev(values: number[]) {
  if (values.length === 0) return 0
  const avg = average(values)
  const variance =
    values.reduce((sum, value) => {
      return sum + Math.pow(value - avg, 2)
    }, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Detects "Circular Money" (money going in and out to inflate score)
 */
function calculateCircularity(income: number, expenses: number): number {
  if (income === 0) return 0
  // If income and expenses are very close and very high, it might be circular money
  const diff = Math.abs(income - expenses)
  const ratio = diff / income
  return ratio < 0.05 ? 1 : 0 // 1 means high circularity suspicion
}

export function analyzeCredit(data: PluggyFinancialData): CreditAnalysisResult {
  const transactions = data.transactions || []
  const security = data.security
  const MIN_TRANSACTIONS = 45 // Increased from 30 for more rigor
  const insights: string[] = []

  let score = 450 // Lowered base score
  let risk: 'low' | 'medium' | 'high' = 'low'
  let decision: 'approved' | 'conservative' | 'denied' = 'approved'
  let limit = 0

  const monthly = groupByMonth(transactions)
  const monthlyIncome: number[] = []
  const monthlyExpense: number[] = []

  Object.values(monthly).forEach((transactionsInMonth) => {
    let income = 0
    let expense = 0
    transactionsInMonth.forEach((transaction) => {
      if (transaction.type === 'credit' && transaction.amount > 0) {
        income += transaction.amount
      }
      if (transaction.type === 'debit') {
        expense += Math.abs(transaction.amount)
      }
    })
    monthlyIncome.push(income)
    monthlyExpense.push(expense)
  })

  const avgIncome = average(monthlyIncome)
  const incomeStdDev = stdDev(monthlyIncome)
  const avgExpense = average(monthlyExpense)
  const expenseRatio = avgExpense / (avgIncome || 1)
  const savingsRate = (avgIncome - avgExpense) / (avgIncome || 1)
  const circularityIndex = calculateCircularity(avgIncome, avgExpense)

  // 1. Transaction volume & rigor
  if (transactions.length < MIN_TRANSACTIONS) {
    risk = 'high'
    insights.push('Seu histórico financeiro tem poucas movimentações, o que impossibilita uma análise de risco precisa no momento.')
    score -= 150
  } else {
    insights.push('Volume de transações adequado para análise.')
    score += 30
  }

  // 2. Income & Stability
  if (avgIncome < 800) { // Increased threshold from 500
    risk = 'high'
    insights.push('A renda média identificada não atende aos requisitos mínimos de segurança da plataforma.')
    score -= 200
  } else {
    if (incomeStdDev > avgIncome * 0.4) { // More rigorous threshold (0.4 vs 0.5)
      risk = risk === 'high' ? 'high' : 'medium'
      insights.push('Identificamos uma alta volatilidade na sua renda mensal, o que sugere instabilidade financeira.')
      score -= 80
    } else {
      insights.push('Padrão de renda mensal apresenta consistência satisfatória.')
      score += 50
    }
  }

  // 3. Commitment & Savings
  if (expenseRatio > 0.85) { // More rigorous (0.85 vs 0.95)
    risk = risk === 'high' ? 'high' : 'medium'
    insights.push('Seu comprometimento de renda atual é elevado, o que aumenta o risco de inadimplência.')
    score -= 120
  } else if (savingsRate < 0.1) {
    insights.push('Sua capacidade de poupança mensal está abaixo do nível recomendado para novas linhas de crédito.')
    score -= 40
  } else {
    insights.push('Boa gestão de fluxo de caixa e reserva financeira.')
    score += 60
  }

  // 4. Behavioral & Fraud (Circular Money)
  if (circularityIndex > 0.8 && avgIncome > 2000) {
    risk = 'high'
    score -= 250
    insights.push('Detectamos padrões de movimentação circular (entradas e saídas simétricas), o que desqualifica a renda informada.')
  }

  // 5. Security & Device Risk
  if (security) {
    if (security.fraudRisk === 'high' || security.fraudFlags?.includes('multiple_accounts')) {
      risk = 'high'
      score -= 400
      insights.push('Inconsistências de segurança detectadas no dispositivo ou histórico de acesso.')
    } else if (security.fraudRisk === 'medium') {
      risk = risk === 'high' ? 'high' : 'medium'
      score -= 150
      insights.push('Alertas de segurança preventivos limitam a concessão de crédito total.')
    }
    
    if (!security.cpfDetected) {
      insights.push('Não foi possível realizar a prova de vida digital através da validação do CPF bancário.')
      risk = 'high'
    }
  }

  score = Math.max(0, Math.min(1000, Math.round(score)))

  // Conservative multipliers
  if (risk === 'high') {
    decision = 'denied'
    limit = 0
  } else if (risk === 'medium' || score < 600) {
    decision = 'conservative'
    limit = avgIncome > 0 ? avgIncome * 0.15 : 0 // Reduced from 0.25
  } else {
    decision = 'approved'
    limit = avgIncome > 0 ? avgIncome * 0.30 : 0 // Reduced from 0.40
  }

  return {
    score,
    limit: Math.round(limit),
    risk,
    decision,
    insights,
    metrics: {
      avgIncome,
      incomeStdDev,
      expenseRatio,
      savingsRate,
      transactionCount: transactions.length,
      circularityIndex,
    },
  }
}