import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight } from "lucide-react";
import { getMeuPluggyFinancialData } from "@/services/pluggy";
import { analyzeCredit } from "@/engine/creditEngine";
import { calculateDynamicLimit, simulateContract, getActiveDebt } from "@/engine/debtEngine";
import { supabase } from "@/integrations/supabase/client";

const Simular = () => {
  const navigate = useNavigate();
  const [limite, setLimite] = useState(0);
  const [valor, setValor] = useState([50]);
  const [parcelas, setParcelas] = useState([6]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/entrar");
          return;
        }

        const financialData = await getMeuPluggyFinancialData();
        const currentDebt = await getActiveDebt();
        const analysis = analyzeCredit(financialData);
        
        // Buscar bônus do perfil
        const { data: profile } = await supabase.from('profiles').select('limit_bonus').single();
        const bonus = profile?.limit_bonus || 0;

        const dynLimit = Math.max(0, calculateDynamicLimit(analysis.limit, currentDebt, bonus));
        setLimite(dynLimit);
        
        // Se o limite for muito baixo, o slider pode bugar se o valor inicial for maior que o max
        const initialValue = Math.min(dynLimit, 800);
        setValor([Math.max(10, initialValue)]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const taxaMensal = 0.029; // 2.9% a.m.
  const calc = useMemo(() => {
    const v = valor[0];
    const n = parcelas[0];
    const i = taxaMensal;
    const parcela = (v * i) / (1 - Math.pow(1 + i, -n));
    return {
      parcela,
      total: parcela * n,
      cet: ((Math.pow(1 + i, 12) - 1) * 100).toFixed(1),
    };
  }, [valor, parcelas]);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function handleConfirm() {
    const contract = simulateContract(valor[0], parcelas[0], taxaMensal);
    navigate("/confirmacao", { state: { contract } });
  }

  if (loading) {
    return (
      <AuthShell
        step={{ current: 4, total: 5, label: "Simulação" }}
        title="Simule seu crédito."
        subtitle="Carregando suas informações..."
        maxWidth="max-w-3xl"
      >
        <p className="text-muted-foreground mt-8 text-center">Buscando limite disponível...</p>
      </AuthShell>
    );
  }

  if (limite < 10) {
    return (
      <AuthShell
        step={{ current: 4, total: 5, label: "Simulação" }}
        title="Limite insuficiente."
        subtitle="Seu limite disponível atual é menor que R$ 10."
        maxWidth="max-w-3xl"
      >
        <div className="mt-8">
          <Button onClick={() => navigate("/painel")} variant="hero" size="lg" className="w-full">
            Voltar para o Painel <ArrowRight />
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      step={{ current: 4, total: 5, label: "Simulação" }}
      title="Simule seu crédito."
      subtitle="Sem pegadinhas. CET claro, parcela fixa e tudo explicado antes de você confirmar."
      maxWidth="max-w-3xl"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-surface-elevated p-6 space-y-8">
          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Valor</label>
              <span className="font-display text-2xl font-semibold tabular-nums">{fmt(valor[0])}</span>
            </div>
            <Slider value={valor} onValueChange={setValor} min={10} max={limite} step={10} className="mt-4" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>R$ 10</span><span>{fmt(limite)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Parcelas</label>
              <span className="font-display text-2xl font-semibold tabular-nums">{parcelas[0]}x</span>
            </div>
            <Slider value={parcelas} onValueChange={setParcelas} min={2} max={12} step={1} className="mt-4" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>2x</span><span>12x</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-primary/30 bg-card-soft bg-surface-elevated p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="relative space-y-5">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Sua proposta</p>
            <Row label="Parcela mensal" value={fmt(calc.parcela)} highlight />
            <Row label="Total a pagar" value={fmt(calc.total)} />
            <Row label="Taxa mensal" value="2,9% a.m." />
            <Row label="CET anual" value={`${calc.cet}%`} />
            <Row label="Liberação" value="Pix imediato" />
          </div>
        </div>
      </div>

      <Button onClick={handleConfirm} variant="hero" size="lg" className="mt-8 w-full">
        Confirmar contratação <ArrowRight />
      </Button>
    </AuthShell>
  );
};

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex items-baseline justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <span className={`font-display tabular-nums ${highlight ? "text-2xl text-primary font-semibold" : "text-base"}`}>{value}</span>
  </div>
);

export default Simular;
