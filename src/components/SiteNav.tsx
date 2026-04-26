import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LiberaLogo } from "./LiberaLogo";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/#como-funciona", label: "Como funciona" },
  { to: "/#diferenciais", label: "Diferenciais" },
  { to: "/#seguranca", label: "Segurança" },
  { to: "/#futuro", label: "Futuro" },
];

export const SiteNav = () => {
  const { pathname } = useLocation();
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link
          to="/"
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="Voltar para início"
        >
          <LiberaLogo size={130} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <NavLink to="/painel">
              <Button variant="hero" size="sm">
                Acessar Painel
              </Button>
            </NavLink>
          ) : (
            <NavLink to="/entrar">
              <Button variant="hero" size="sm">
                Entrar
              </Button>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};