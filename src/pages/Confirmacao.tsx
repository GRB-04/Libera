import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { saveDebt, type DebtContract } from "@/engine/debtEngine";
import { toast } from "sonner";

const Confirmacao = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contract = location.state?.contract as DebtContract;

  useEffect(() => {
    async function init() {
      if (!contract) {
        navigate("/painel");
      } else {
        try {
          await saveDebt(contract);
          toast.success("Contrato assinado e salvo com sucesso!");
        } catch (err: any) {
          console.error(err);
          toast.error("Erro ao salvar contrato: " + (err.message || "Verifique as tabelas do banco."));
        }
      }
    }
    init();
  }, [contract, navigate]);

  if (!contract) return null;

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const firstInstallment = contract.installments[0];

  return (
    <AuthShell
      step={{ current: 5, total: 5, label: "Confirmação" }}
      title="Crédito liberado."
      subtitle="O valor já está caindo na sua conta via Pix."
      maxWidth="max-w-xl"
    >
      <div className="rounded-3xl border border-primary/40 bg-surface-elevated p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground glow-yellow">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-primary">Operação concluída</p>
          <div className="mt-3 font-display text-5xl font-semibold tabular-nums">{fmt(contract.principal_amount)}</div>
          <p className="mt-2 text-sm text-muted-foreground">em {contract.installments_count}x de {fmt(firstInstallment.amount)}</p>

          <div className="mt-8 grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border text-left">
            <div className="bg-surface p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Próxima parcela</div>
              <div className="mt-1 font-display">{formatDate(firstInstallment.due_date)}</div>
            </div>
            <div className="bg-surface p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contrato</div>
              <div className="mt-1 font-display">{contract.id}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Pague em dia e seu limite cresce automaticamente. Acompanhe tudo no seu painel.
      </p>

      <Link to="/painel" className="block mt-6">
        <Button variant="hero" size="lg" className="w-full">
          Ir para o painel <ArrowRight />
        </Button>
      </Link>
    </AuthShell>
  );
};

export default Confirmacao;
