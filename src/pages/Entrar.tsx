import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiberaLogo } from "@/components/LiberaLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Entrar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !senha) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
      return;
    }

    // Se tiver um redirect na URL, mandar pra lá, senão vai pro painel
    const redirect = searchParams.get("redirect");
    if (redirect) {
      navigate(`/${redirect}`);
    } else {
      navigate("/painel");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8">
        <div className="mb-6 flex justify-center">
          <LiberaLogo size={90} />
        </div>

        <h1 className="mb-2 text-center font-display text-2xl font-semibold">
          Bem-vindo de volta
        </h1>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          Entre com seu e-mail e senha para acessar sua conta.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            disabled={loading}
          />

          <Button className="w-full" type="submit" variant="hero" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}