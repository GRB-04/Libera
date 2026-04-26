import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QrCode, Copy, Info, ShieldCheck, Zap, TrendingUp, AlertCircle, HelpCircle } from "lucide-react";
import { LiberaLogo } from "@/components/LiberaLogo";
import { getMeuPluggyFinancialData, type PluggyFinancialData } from "@/services/pluggy";
import { analyzeCredit, type CreditAnalysisResult } from "@/engine/creditEngine";
import { getActiveDebt, calculateDynamicLimit, payInstallment, payAllInstallments, calculateDynamicScore, simulateLatePayment, type DebtContract } from "@/engine/debtEngine";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Painel() {
  const navigate = useNavigate();

  const [user, setUser] = useState<{ nome: string; email: string } | null>(null);
  const [limit, setLimit] = useState(0);
  const [score, setScore] = useState(0);
  const [debt, setDebt] = useState<DebtContract | null>(null);
  const [analysis, setAnalysis] = useState<CreditAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        setUser({
          nome: supabaseUser.user_metadata?.nome || "Usuário",
          email: supabaseUser.email || "",
        });
      } else {
        navigate("/entrar");
      }
    });
  }, [navigate]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const financialData = await getMeuPluggyFinancialData();
      const currentDebt = await getActiveDebt();
      
      const { data: profile } = await supabase.from('profiles').select('limit_bonus').single();
      const bonus = profile?.limit_bonus || 0;

      const creditAnalysis = analyzeCredit(financialData);
      setAnalysis(creditAnalysis);

      const dynamicLimit = calculateDynamicLimit(creditAnalysis.limit, currentDebt, bonus);
      const dynamicScore = calculateDynamicScore(creditAnalysis.score, currentDebt);
      
      setScore(dynamicScore);
      setLimit(dynamicLimit);
      setDebt(currentDebt);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do painel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    // Sincronização via Rádio (Broadcast)
    const channel = supabase.channel('payments');
    
    channel.on('broadcast', { event: 'paid' }, (payload) => {
      console.log('Sinal de pagamento recebido!', payload);
      toast.success("Pagamento reconhecido em tempo real!");
      loadDashboard();
    })
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function openQrModal(id: string) {
    setSelectedInstallmentId(id);
    setIsQrModalOpen(true);
  }

  async function handleLatePayment() {
    const success = await simulateLatePayment();
    if (success) {
      toast.error("Fatura marcada como atrasada. Limite bloqueado.");
      loadDashboard();
    }
  }

  async function handleSettleAll() {
    if (!debt) return;
    const success = await payAllInstallments(debt.id);
    if (success) {
      toast.success("Empréstimo quitado integralmente!");
      loadDashboard();
    }
  }

  if (!user) return null;

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const nextInstallment = debt?.installments.find(i => i.status === 'pending' || i.status === 'late');

  const qrUrl = debt && nextInstallment 
    ? `${window.location.origin}/pagamento-pix/${debt.id}/${nextInstallment.id}?amount=${nextInstallment.amount}`
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/">
            <LiberaLogo size={110} />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/conectar">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 transition-all">
                Atualizar Dados
              </Button>
            </Link>
            <Button variant="ghost" className="text-muted-foreground hidden sm:flex" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <section className="relative rounded-[2.5rem] border border-white/5 bg-surface-elevated/40 p-8 md:p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary mb-4">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.3em] font-bold">Acesso Seguro • Perfil Verificado</p>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Olá{user.nome ? `, ${user.nome.split(' ')[0]}` : ""}.
              </h1>

              <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
                Bem-vindo ao seu ecossistema financeiro. Aqui você tem controle total sobre seu crédito e evolução financeira.
              </p>

              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="group rounded-3xl border border-white/5 bg-background/60 p-6 hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(234,255,0,0.05)]">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status da Conta</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h2 className="font-display text-2xl font-bold text-emerald-400">Ativa</h2>
                  </div>
                </div>

                <div className="group rounded-3xl border border-white/5 bg-background/60 p-6 hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(234,255,0,0.05)] relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Score Libera</p>
                      <h2 className="font-display text-3xl font-bold text-primary">{score}</h2>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsExplainModalOpen(true)}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="group rounded-3xl border border-white/5 bg-background/60 p-6 hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(234,255,0,0.05)]">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Crédito Disponível</p>
                  <h2 className="font-display text-3xl font-bold">{fmt(limit)}</h2>
                </div>

                {debt && (
                  <div className="group rounded-3xl border border-white/5 bg-background/60 p-6 hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(234,255,0,0.05)]">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Saldo Devedor</p>
                    <h2 className="font-display text-3xl font-bold text-destructive/80">
                      {fmt(debt.installments.filter(i => i.status !== 'paid').reduce((acc, i) => acc + i.amount, 0))}
                    </h2>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Section */}
          {!debt && limit > 10 && (
            <section className="rounded-3xl border border-primary/20 bg-primary/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-primary">Crédito disponível para contratação!</h3>
                <p className="text-sm text-muted-foreground mt-1">Você pode solicitar até {fmt(limit)} com liberação via Pix em segundos.</p>
              </div>
              <Link to="/simular">
                <Button variant="hero" size="lg" className="px-10 h-14 text-lg">
                  Simular Agora <Zap className="ml-2 h-5 w-5 fill-black" />
                </Button>
              </Link>
            </section>
          )}

          {/* Active Debt Section */}
          {debt && nextInstallment && (
            <section className={`rounded-3xl border ${nextInstallment.status === 'late' ? 'border-destructive/30 bg-destructive/5' : 'border-white/5 bg-surface-elevated/20'} p-8`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {nextInstallment.status === 'late' ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-primary" />
                    )}
                    <h3 className={`text-xl font-bold ${nextInstallment.status === 'late' ? 'text-destructive' : 'text-foreground'}`}>
                      {nextInstallment.status === 'late' ? 'Fatura em Atraso' : 'Próximo Vencimento'}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {nextInstallment.status === 'late' 
                      ? 'Seu limite foi temporariamente bloqueado. Regularize sua situação para recuperar seu score.' 
                      : 'Mantenha seus pagamentos em dia para desbloquear bônus de limite progressivos.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Valor</p>
                    <p className="text-3xl font-display font-bold">{fmt(nextInstallment.amount)}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Data</p>
                    <p className={`text-2xl font-display font-bold ${nextInstallment.status === 'late' ? 'text-destructive' : ''}`}>{formatDate(nextInstallment.due_date)}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Parcela</p>
                    <p className="text-2xl font-display font-bold">
                      {debt.installments.filter(i => i.status === 'paid').length + 1} de {debt.installments_count}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {nextInstallment.status !== 'late' && (
                    <Button variant="outline" onClick={handleLatePayment} className="border-destructive/30 text-destructive/70 hover:bg-destructive/10">
                      Simular Atraso
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleSettleAll} className="border-primary/30 text-primary/70 hover:bg-primary/10">
                    Liquidar Tudo
                  </Button>
                  <Button variant="hero" onClick={() => openQrModal(nextInstallment.id)} className="px-8 h-12">
                    Pagar via Pix
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!debt && limit <= 10 && !loading && (
            <div className="text-center py-20 bg-surface-elevated/20 rounded-3xl border border-dashed border-white/10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">Sem ofertas disponíveis</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Conecte mais contas ou aguarde sua próxima análise automática de comportamento financeiro.</p>
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md bg-surface-elevated border-white/5 overflow-hidden rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Pagar com Pix</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo com o app do seu banco para liquidação instantânea.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-8 bg-background/50 rounded-3xl border border-white/5 mt-4">
            <div className="bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              {qrUrl && (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} 
                  alt="QR Code Pix" 
                  className="w-44 h-44"
                />
              )}
            </div>
            
            <div className="mt-8 flex items-center gap-2 w-full">
              <div className="flex-1 overflow-hidden bg-background border border-white/5 rounded-2xl p-4 text-[10px] text-muted-foreground font-mono">
                {qrUrl.slice(0, 40)}...
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl" onClick={() => {
                navigator.clipboard.writeText(qrUrl);
                toast.success("Código Copia e Cola copiado!");
              }}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <p className="text-[10px] text-center w-full text-muted-foreground uppercase tracking-widest">
              Sincronização em tempo real ativa
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explain Score Modal (Legal Compliance) */}
      <Dialog open={isExplainModalOpen} onOpenChange={setIsExplainModalOpen}>
        <DialogContent className="sm:max-w-lg bg-surface-elevated border-white/5 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Transparência: Seu Score Libera</DialogTitle>
            <DialogDescription>
              Entenda os fatores que compõem sua nota de crédito exclusiva.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-sm">Metodologia Ubíqua</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Diferente dos bancos tradicionais, analisamos seu comportamento financeiro real, fluxo de caixa e consistência de hábitos, não apenas dívidas passadas.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Principais Insights</h4>
              {analysis?.insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-background/50 border border-white/5">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <p className="text-sm text-muted-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="hero" className="w-full h-12" onClick={() => setIsExplainModalOpen(false)}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}