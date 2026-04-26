import { LiberaLogo } from "./LiberaLogo";

export const SiteFooter = () => {
  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="container py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <LiberaLogo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Crédito sem burocracia para quem o sistema esqueceu.
            Comportamento financeiro real, decisões transparentes.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Produto</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/#como-funciona" className="hover:text-primary transition-colors">Como funciona</a></li>
            <li><a href="/#diferenciais" className="hover:text-primary transition-colors">Diferenciais</a></li>
            <li><a href="/simular" className="hover:text-primary transition-colors">Simular crédito</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Confiança</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/#seguranca" className="hover:text-primary transition-colors">Segurança</a></li>
            <li><a href="/#seguranca" className="hover:text-primary transition-colors">Open Finance</a></li>
            <li><a href="/#seguranca" className="hover:text-primary transition-colors">Privacidade</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Libera. Crédito sem burocracia.</p>
          <p className="tracking-[0.2em] uppercase">Feito no Brasil</p>
        </div>
      </div>
    </footer>
  );
};
