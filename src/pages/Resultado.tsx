import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { analyzeCredit, type CreditAnalysisResult } from '@/engine/creditEngine'
import { getMeuPluggyFinancialData } from '@/services/pluggy'
import { supabase } from '@/integrations/supabase/client'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getUserMessage(analysis: CreditAnalysisResult | null) {
  if (!analysis) {
    return 'Estamos analisando seus dados financeiros com segurança.'
  }

  if (analysis.decision === 'denied') {
    if (analysis.metrics.transactionCount < 30) {
      return 'Não conseguimos liberar crédito agora porque seu histórico financeiro ainda é insuficiente.'
    }

    if (analysis.metrics.avgIncome < 500) {
      return 'Não conseguimos liberar crédito agora porque não identificamos renda recorrente suficiente.'
    }

    if (analysis.metrics.expenseRatio > 0.9) {
      return 'Não conseguimos liberar crédito agora porque seus gastos estão muito próximos ou acima da renda identificada.'
    }

    return 'Não conseguimos liberar crédito agora com segurança.'
  }

  if (analysis.decision === 'conservative') {
    return 'Seu crédito foi aprovado com limite conservador por segurança financeira.'
  }

  return 'Seu crédito foi aprovado com base no seu comportamento financeiro.'
}

export default function Resultado() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<CreditAnalysisResult | null>(null)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)
  const [sourceMessage, setSourceMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true)
        setError(null)

        const financialData = await getMeuPluggyFinancialData()

        const result = analyzeCredit(financialData)

        setAnalysis(result)
        setIncome(financialData.income)
        setExpenses(financialData.expenses)
        setTransactionCount(financialData.transactionCount)
        setSourceMessage(financialData.message ?? null)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar a análise.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [])

  const availableLimit = useMemo(() => {
    if (!analysis) return 0

    if (analysis.decision === 'denied') {
      return 0
    }

    return analysis.limit
  }, [analysis])

  const userMessage = getUserMessage(analysis)

  async function handleSimularClick() {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      navigate('/simular')
    } else {
      navigate('/cadastro?redirect=simular')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <section className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-400">
            Libera Score
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight">
            Analisando seus dados
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Estamos buscando suas informações reais via MeuPluggy com segurança.
          </p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <section className="mx-auto max-w-6xl">
          <Link
            to="/conectar"
            className="inline-flex rounded-full border border-slate-800 px-6 py-3 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-emerald-400"
          >
            ← Voltar para conexão
          </Link>

          <h1 className="mt-10 text-5xl font-semibold tracking-tight">
            Não foi possível analisar
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-red-400">{error}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/conectar"
            className="inline-flex rounded-full border border-slate-800 px-6 py-3 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-emerald-400"
          >
            ← Voltar para conexão
          </Link>

          {availableLimit > 0 ? (
            <button
              onClick={handleSimularClick}
              className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:bg-emerald-300"
            >
              Simular crédito →
            </button>
          ) : (
            <Link
              to="/conectar"
              className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-6 py-3 font-semibold text-emerald-400 transition hover:bg-emerald-400/20"
            >
              Nova análise
            </Link>
          )}
        </div>

        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-400">
            Libera Score
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-tight">
            Resultado da análise
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
            {userMessage}
          </p>

          {sourceMessage && (
            <p className="mt-4 text-sm text-yellow-400">{sourceMessage}</p>
          )}

          <p className="mt-4 text-sm text-emerald-400">
            Análise feita usando dados do MeuPluggy.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-slate-800 bg-white/[0.03] p-8">
          <p className="text-slate-400">Limite disponível</p>

          <h2 className="mt-4 text-7xl font-bold tracking-tight text-emerald-400">
            {formatCurrency(availableLimit)}
          </h2>

          {analysis?.decision === 'denied' && (
            <p className="mt-5 max-w-2xl text-sm text-slate-400">
              Por segurança, nenhum crédito foi liberado nesta análise.
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-6">
            <p className="text-slate-400">Score</p>
            <p className="mt-4 text-3xl font-semibold">
              {analysis?.score ?? 300}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-6">
            <p className="text-slate-400">Renda</p>
            <p className="mt-4 text-3xl font-semibold">
              {formatCurrency(income)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-6">
            <p className="text-slate-400">Gastos</p>
            <p className="mt-4 text-3xl font-semibold">
              {formatCurrency(expenses)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-6">
            <p className="text-slate-400">Transações</p>
            <p className="mt-4 text-3xl font-semibold">{transactionCount}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-white/[0.03] p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Decisão interna
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-slate-400">Status</p>
              <p className="mt-2 text-xl font-semibold">
                {analysis?.decision === 'approved'
                  ? 'Aprovado'
                  : analysis?.decision === 'conservative'
                    ? 'Conservador'
                    : 'Negado'}
              </p>
            </div>

            <div>
              <p className="text-slate-400">Risco</p>
              <p className="mt-2 text-xl font-semibold">
                {analysis?.risk === 'low'
                  ? 'Baixo'
                  : analysis?.risk === 'medium'
                    ? 'Médio'
                    : 'Alto'}
              </p>
            </div>

            <div>
              <p className="text-slate-400">Média mensal estimada</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(analysis?.metrics.avgIncome ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {analysis?.insights && analysis.insights.length > 0 && (
          <div className="mt-8 rounded-3xl border border-slate-800 bg-white/[0.03] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Por que chegamos nessa decisão?
            </p>

            <ul className="mt-6 space-y-3">
              {analysis.insights.map((insight, i) => (
                <li key={i} className="flex gap-3 text-slate-300">
                  <span className="text-emerald-400">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}