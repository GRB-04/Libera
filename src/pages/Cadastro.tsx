import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiberaLogo } from "@/components/LiberaLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Cadastro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nome || !form.cpf || !form.email || !form.telefone || !form.senha) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        data: {
          nome: form.nome,
          cpf: form.cpf,
          telefone: form.telefone,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao criar conta: " + error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Se não retornou sessão, pode ser que o usuário já exista.
      // Vamos tentar logar ele direto com a senha que ele acabou de digitar.
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha,
      });

      if (loginError) {
        toast.error("Atenção: Este e-mail já possui cadastro. Por favor, tente entrar com sua senha correta.");
        setLoading(false);
        return;
      }

      // Se logou com sucesso, redirecionamos
      const redirect = searchParams.get("redirect");
      navigate(redirect ? `/${redirect}` : "/conectar");
      return;
    }

    // Após o cadastro, verificar se tem redirecionamento (UX Progressiva)
    const redirect = searchParams.get("redirect");
    if (redirect) {
      navigate(`/${redirect}`);
    } else {
      // Se não tem, joga pro conectar como era antes
      navigate("/conectar");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8">
        <div className="mb-6 flex justify-center">
          <LiberaLogo size={90} />
        </div>

        <h1 className="mb-2 text-center font-display text-2xl font-semibold">
          Criar conta Libera
        </h1>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          Comece sua análise de crédito em poucos passos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Nome completo"
            value={form.nome}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            disabled={loading}
          />

          <input
            placeholder="CPF"
            value={form.cpf}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            disabled={loading}
          />

          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
          />

          <input
            placeholder="Celular"
            value={form.telefone}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Senha"
            value={form.senha}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            disabled={loading}
          />

          <Button className="w-full" type="submit" variant="hero" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/entrar" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}