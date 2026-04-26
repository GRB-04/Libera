import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiberaLogo } from "@/components/LiberaLogo";
import { BrandBackdrop } from "@/components/BrandBackdrop";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  "Lendo dados Open Finance...",
  "Buscando contas conectadas...",
  "Lendo transações bancárias...",
  "Avaliando estabilidade financeira...",
  "Calculando score comportamental...",
  "Definindo seu limite inicial...",
];

const Analisando = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let progressInterval: number | undefined;

    const startProgress = () => {
      progressInterval = window.setInterval(() => {
        setProgress((p) => {
          const next = Math.min(95, p + 2);
          setActiveStep(
            Math.min(steps.length - 1, Math.floor((next / 100) * steps.length))
          );
          return next;
        });
      }, 120);
    };

    const analyzeFinancialData = async () => {
      try {
        startProgress();

        const storedConnection = localStorage.getItem(
          "libera_open_finance_connection"
        );

        if (!storedConnection) {
          throw new Error("Nenhuma conexão Open Finance foi encontrada.");
        }

        const connection = JSON.parse(storedConnection);
        const itemId = connection?.itemId;

        if (!itemId) {
          throw new Error("O itemId da Pluggy não foi encontrado.");
        }

        const { data, error } = await supabase.functions.invoke(
          "get-financial-data",
          {
            body: {
              itemId,
            },
          }
        );

        if (error) {
          throw new Error(error.message || "Erro ao buscar dados financeiros.");
        }

        if (!data) {
          throw new Error("A Pluggy não retornou dados financeiros.");
        }

        localStorage.setItem("libera_financial_data", JSON.stringify(data));

        setProgress(100);
        setActiveStep(steps.length - 1);

        window.setTimeout(() => {
          navigate("/resultado");
        }, 700);
      } catch (err) {
        console.error("Erro na análise financeira:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível analisar seus dados financeiros.";

        setError(message);
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    };

    analyzeFinancialData();

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center">
      <BrandBackdrop />

      <div className="relative z-10 container max-w-xl text-center">
        <div className="flex justify-center text-primary animate-pulse-glow">
          <LiberaLogo showWordmark={false} size={64} />
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-primary">
          Analisando
        </p>

        <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Estamos lendo seu comportamento financeiro.
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Isso leva poucos segundos. Cada análise é única.
        </p>

        <div className="mt-10 h-[3px] w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 text-xs text-muted-foreground tabular-nums">
          {progress}%
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-left">
            <p className="text-sm font-medium text-red-400">
              Não conseguimos concluir a análise.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>

            <button
              onClick={() => navigate("/conectar")}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Conectar novamente
            </button>
          </div>
        )}

        {!error && (
          <ul className="mt-10 space-y-3 text-left">
            {steps.map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                  i < activeStep
                    ? "border-border bg-surface text-muted-foreground"
                    : i === activeStep
                    ? "border-primary/40 bg-surface-elevated text-foreground"
                    : "border-border bg-surface text-muted-foreground/60"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    i < activeStep
                      ? "bg-primary text-primary-foreground"
                      : "border border-border"
                  }`}
                >
                  {i < activeStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Analisando;