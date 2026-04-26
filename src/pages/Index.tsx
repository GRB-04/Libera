import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiberaLogo } from "@/components/LiberaLogo";
import { BrandBackdrop } from "@/components/BrandBackdrop";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Activity,
  TrendingUp,
  Eye,
  Zap,
  Layers,
  Lock,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteNav />

      {/* HERO */}
      <section className="relative pt-20 pb-28 md:pt-24 md:pb-36">
        <BrandBackdrop />

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center -mt-4">
            <div className="flex justify-center">
              <LiberaLogo size={200} />
            </div>

            <p className="mt-3 text-base md:text-lg text-muted-foreground">
              crédito sem burocracia.
            </p>

            <h1 className="mt-5 font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight text-balance">
              Crédito que <span className="text-gradient-yellow">entende</span>{" "}
              você.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
              A Libera analisa seu comportamento financeiro real para oferecer
              crédito justo, rápido e transparente para trabalhadores autônomos.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={isLoggedIn ? "/painel" : "/cadastro"}>
                <Button variant="hero" size="xl" className="group">
                  {isLoggedIn ? "Acessar seu Painel" : "Começar agora"}
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <a href="#como-funciona">
                <Button variant="glass" size="xl">
                  Como funciona
                </Button>
              </a>
            </div>

            <p className="mt-7 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Sem holerite • Sem fila • Decisão em segundos
            </p>
          </div>

          <div className="relative mt-16 mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
              {[
                { k: "+38M", v: "autônomos no Brasil" },
                { k: "0", v: "documentos em papel" },
                { k: "<60s", v: "para uma decisão" },
                { k: "100%", v: "explicável" },
              ].map((s) => (
                <div key={s.k} className="bg-surface-elevated p-6 text-center">
                  <div className="font-display text-3xl md:text-4xl font-semibold text-primary">
                    {s.k}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="relative py-24 md:py-32 border-t border-border/60"
      >
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Como funciona
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">
              Quatro passos.
              <br />
              <span className="text-muted-foreground">Zero burocracia.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-px bg-border rounded-2xl overflow-hidden border border-border md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                title: "Conecte seus dados",
                desc: "Open Finance com consentimento explícito. Você decide o que compartilhar.",
                icon: Fingerprint,
              },
              {
                n: "02",
                title: "Analisamos seu comportamento",
                desc: "Renda real, frequência, fluxo de caixa e consistência ao longo do tempo.",
                icon: Activity,
              },
              {
                n: "03",
                title: "Receba uma proposta",
                desc: "Limite inicial conservador, taxa justa e explicação clara da decisão.",
                icon: CheckCircle2,
              },
              {
                n: "04",
                title: "Seu limite evolui",
                desc: "Pague em dia e o limite cresce. Score dinâmico que acompanha sua vida.",
                icon: TrendingUp,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-surface-elevated p-8 group hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs tracking-[0.3em] text-muted-foreground">
                    {s.n}
                  </span>
                  <s.icon className="h-5 w-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="mt-8 font-display text-xl font-semibold">
                  {s.title}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section
        id="diferenciais"
        className="relative py-24 md:py-32 border-t border-border/60 bg-surface"
      >
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Diferenciais
              </p>

              <h2 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">
                Não é mais um app de empréstimo.
              </h2>

              <p className="mt-6 text-muted-foreground leading-relaxed">
                A Libera é uma plataforma de crédito responsável. Cada decisão é
                construída sobre dados reais, transparência total e respeito ao
                seu dinheiro.
              </p>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Activity,
                  t: "Score comportamental",
                  d: "Avaliação dinâmica e baseada em padrão financeiro real, não em cadastro antigo.",
                },
                {
                  icon: TrendingUp,
                  t: "Limite dinâmico",
                  d: "Cresce com pagamentos em dia e estabilidade da sua renda.",
                },
                {
                  icon: Eye,
                  t: "Transparência total",
                  d: "Cada decisão vem com motivos. Sem caixa preta.",
                },
                {
                  icon: Lock,
                  t: "Controle dos dados",
                  d: "Você consente, revoga e visualiza tudo o que é usado.",
                },
                {
                  icon: Layers,
                  t: "Risco progressivo",
                  d: "Começamos pequeno e evoluímos junto. Crédito que não te quebra.",
                },
                {
                  icon: Zap,
                  t: "Aprovação rápida",
                  d: "Decisão em menos de 60s. Liberação via Pix em seguida.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="rounded-2xl border border-border bg-card-soft bg-surface-elevated p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold">
                    {c.t}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section
        id="seguranca"
        className="relative py-24 md:py-32 border-t border-border/60"
      >
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Segurança e confiança
              </p>

              <h2 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight text-balance">
                Seus dados.
                <br />
                Suas regras.
              </h2>

              <p className="mt-6 text-muted-foreground leading-relaxed">
                Operamos no padrão Open Finance regulado pelo Banco Central.
                Coletamos só o necessário, explicamos cada decisão e protegemos
                contra fraude com camadas de monitoramento contínuo.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Open Finance",
                  "LGPD",
                  "Criptografia ponta a ponta",
                  "Antifraude ativo",
                ].map((b) => (
                  <span
                    key={b}
                    className="text-xs uppercase tracking-[0.2em] rounded-full border border-border px-3 py-1.5 text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  t: "Consentimento claro",
                  d: "Você autoriza, em linguagem simples, exatamente o que será analisado.",
                },
                {
                  t: "Uso mínimo de dados",
                  d: "Só pedimos o que é necessário para a análise — nada além.",
                },
                {
                  t: "Decisões explicáveis",
                  d: "Aprovação ou negativa sempre com motivo. Sem black-box.",
                },
                {
                  t: "Proteção contra fraude",
                  d: "Monitoramento de comportamento e sinais de risco em tempo real.",
                },
              ].map((it, i) => (
                <div
                  key={it.t}
                  className="flex gap-4 rounded-xl border border-border bg-surface-elevated p-5"
                >
                  <div className="font-display text-sm text-primary">
                    {(i + 1).toString().padStart(2, "0")}
                  </div>

                  <div>
                    <h3 className="font-display font-semibold">{it.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {it.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FUTURO */}
      <section
        id="futuro"
        className="relative py-24 md:py-32 border-t border-border/60 bg-surface overflow-hidden"
      >
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Futuro da plataforma
            </p>

            <h2 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">
              O que vem por aí.
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              Estamos construindo um ecossistema completo de crédito
              comportamental.
            </p>
          </div>

          <div className="mt-12 overflow-hidden">
            <div className="flex gap-3 animate-marquee w-max">
              {[
                "Integração Uber",
                "Integração iFood",
                "Open Finance completo",
                "Score em tempo real",
                "Prevenção a fraude",
                "Renegociação inteligente",
                "Integração Uber",
                "Integração iFood",
                "Open Finance completo",
                "Score em tempo real",
                "Prevenção a fraude",
                "Renegociação inteligente",
              ].map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="shrink-0 rounded-full border border-border bg-surface-elevated px-6 py-3 font-display text-sm tracking-wide"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-24 md:py-32 border-t border-border/60">
        <BrandBackdrop variant="minimal" />

        <div className="container relative z-10 text-center">
          <div className="flex justify-center">
            <LiberaLogo size={120} />
          </div>

          <h2 className="mx-auto mt-8 max-w-3xl font-display text-4xl md:text-6xl font-semibold tracking-tight text-balance">
            Crédito baseado em{" "}
            <span className="text-gradient-yellow">quem você é</span> na
            prática.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Não em documentos antigos. Comece em menos de um minuto.
          </p>

          <div className="mt-10 flex justify-center">
            <Link to={isLoggedIn ? "/painel" : "/cadastro"}>
              <Button variant="hero" size="xl">
                {isLoggedIn ? "Acessar Painel" : "Começar agora"} <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}