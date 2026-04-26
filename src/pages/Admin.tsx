import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeCredit, type CreditAnalysisResult } from "@/engine/creditEngine";
import { getMeuPluggyFinancialData } from "@/services/pluggy";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
};

const getRiskLabel = (risk?: string) => {
  if (risk === "high") return "Alto";
  if (risk === "medium") return "Médio";
  return "Baixo";
};

const getDecisionLabel = (decision?: string) => {
  if (decision === "denied") return "Negado";
  if (decision === "conservative") return "Conservador";
  if (decision === "approved") return "Aprovado";
  return "Não definido";
};

const Admin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<CreditAnalysisResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const stored = localStorage.getItem("libera_financial_data");
        if (stored) {
          setData(JSON.parse(stored));
        }

        const financialData = await getMeuPluggyFinancialData();
        const analysis = analyzeCredit(financialData);
        setResult(analysis);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  if (!data || !result) {
    return (
      <div className="min-h-screen bg-black p-10 text-white">
        <button
          onClick={() => navigate("/resultado")}
          className="mb-8 rounded-full border border-gray-800 px-5 py-3 text-sm text-gray-300 transition hover:border-green-400 hover:text-green-400"
        >
          ← Voltar
        </button>

        <p>Nenhum dado encontrado.</p>
      </div>
    );
  }

  const security = data?.security || {
    fraudRisk: "low",
    fraudFlags: [],
    cpfDetected: false,
    ipCaptured: false,
    decision: "eligible",
  };

  const fraudFlags = Array.isArray(security?.fraudFlags)
    ? security.fraudFlags
    : [];

  return (
    <div className="min-h-screen bg-black p-8 text-white md:p-12">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/resultado")}
          className="mb-8 rounded-full border border-gray-800 px-5 py-3 text-sm text-gray-300 transition hover:border-green-400 hover:text-green-400"
        >
          ← Voltar para resultado
        </button>

        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-yellow-400">
          Libera Admin
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Painel interno de análise
        </h1>

        <p className="mt-4 max-w-2xl text-gray-400">
          Área interna para visualizar dados técnicos, segurança da análise,
          flags antifraude e dados brutos retornados pela integração.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-800 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">Score</p>
            <p className="mt-2 text-3xl font-semibold">{result.score}</p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">Limite</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(result.limit)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">Renda</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(result.metrics.avgIncome)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">Transações</p>
            <p className="mt-2 text-2xl font-semibold">
              {result.metrics.transactionCount}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-6 text-yellow-300">
          <h2 className="text-xl font-semibold">Segurança da análise</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-4">
            <div>
              <p className="text-sm opacity-80">Risco antifraude</p>
              <p className="mt-1 text-2xl font-bold">
                {getRiskLabel(security.fraudRisk)}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-80">Identidade validada</p>
              <p className="mt-1 text-2xl font-bold">
                {security.cpfDetected ? "Sim" : "Não"}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-80">IP capturado</p>
              <p className="mt-1 text-2xl font-bold">
                {security.ipCaptured ? "Sim" : "Não"}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-80">Decisão interna</p>
              <p className="mt-1 text-xl font-bold">
                {getDecisionLabel(security.decision)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold opacity-90">Flags:</p>

            {fraudFlags.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {fraudFlags.map((flag: string, index: number) => (
                  <li key={index}>• {flag}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm">Nenhuma flag encontrada.</p>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-800 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Insights do Motor de Crédito</h2>
          {result.insights && result.insights.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {result.insights.map((insight: string, idx: number) => (
                <li key={idx}>• {insight}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-400">Nenhum insight gerado.</p>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-gray-800 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Dados brutos</h2>

          <pre className="mt-5 max-h-[500px] overflow-auto rounded-2xl bg-black p-5 text-xs text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Admin;