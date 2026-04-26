import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiberaLogo } from "@/components/LiberaLogo";
import { payInstallment } from "@/engine/debtEngine";
import { CheckCircle2, CreditCard, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PagamentoPix() {
  const { debtId, installmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const amount = Number(searchParams.get("amount") || 0);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  async function handleConfirm() {
    if (!installmentId) return;
    
    setLoading(true);
    
    try {
      // 1. Atualiza o banco de dados de verdade
      const success = await payInstallment(installmentId);
      
      if (success) {
        setLoading(false);
        setSuccess(true);
        toast.success("Pagamento confirmado com sucesso!");
      } else {
        throw new Error("Erro ao atualizar status da parcela.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao processar pagamento: " + err.message);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative rounded-full bg-emerald-500/10 border border-emerald-500/50 p-6">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-display font-bold text-foreground">Sucesso!</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            O seu pagamento de <span className="text-foreground font-semibold">{fmt(amount)}</span> foi processado e reconhecido.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/60">
            A tela do seu computador já foi atualizada automaticamente.
          </p>
          
          <Button 
            className="mt-12 w-full h-14 text-lg rounded-2xl group" 
            variant="outline"
            onClick={() => navigate("/")}
          >
            Voltar para o Painel
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-surface-elevated/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-10">
          <LiberaLogo size={120} />
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold mb-4">
            <Zap className="h-3 w-3 fill-primary" />
            Pagamento Instantâneo
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Pagar Fatura</h1>
          <p className="text-sm text-muted-foreground">
            Confirme os dados abaixo para liquidar sua parcela agora mesmo via Pix.
          </p>
        </div>

        <div className="bg-background/40 rounded-3xl p-6 border border-white/5 mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Valor do Pagamento</p>
          <p className="text-4xl font-display font-bold text-primary">{fmt(amount)}</p>
          
          <div className="mt-6 space-y-4 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Destinatário</span>
              <span className="text-sm font-medium">Libera Fintech LTDA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Identificador</span>
              <span className="text-sm font-mono text-xs opacity-60">#{installmentId?.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Transação 100% criptografada e segura</span>
          </div>
        </div>

        <Button 
          className="w-full h-16 text-xl font-display rounded-2xl shadow-[0_20px_50px_rgba(234,255,0,0.2)] hover:shadow-[0_20px_60px_rgba(234,255,0,0.3)] transition-all" 
          variant="hero" 
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Processando...
            </div>
          ) : (
            "Confirmar Pagamento"
          )}
        </Button>
        
        <p className="text-[10px] text-center mt-8 text-muted-foreground uppercase tracking-[0.25em] font-medium opacity-50">
          Libera Secure Gateway
        </p>
      </div>
    </div>
  );
}
