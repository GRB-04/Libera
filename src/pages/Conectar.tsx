import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  ArrowRight,
  Banknote,
  Receipt,
  Activity,
} from "lucide-react";
import { PluggyConnect } from "react-pluggy-connect";

const CREATE_CONNECT_TOKEN_URL =
  "https://zspcvabqdkbkopfakjbm.supabase.co/functions/v1/create-connect-token";

const GET_FINANCIAL_DATA_URL =
  "https://zspcvabqdkbkopfakjbm.supabase.co/functions/v1/get-financial-data";

const consentItems = [
  {
    id: "saldo",
    icon: Banknote,
    t: "Saldos e fluxo de conta",
    d: "Para entender sua estabilidade financeira.",
  },
  {
    id: "rendas",
    icon: Receipt,
    t: "Recebimentos e frequência de renda",
    d: "Para reconhecer sua renda real, mesmo informal.",
  },
  {
    id: "comp",
    icon: Activity,
    t: "Padrões de comportamento",
    d: "Para construir um score justo e dinâmico.",
  },
];

function extractItemId(item: any) {
  return (
    item?.item?.id ||
    item?.id ||
    item?.itemId ||
    item?.data?.itemId ||
    item?.data?.item?.id ||
    null
  );
}

export default function Conectar() {
  const navigate = useNavigate();

  const [granted, setGranted] = useState<Record<string, boolean>>({
    saldo: true,
    rendas: true,
    comp: true,
  });

  const [connectToken, setConnectToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [statusText, setStatusText] = useState("");

  const allOk = Object.values(granted).every(Boolean);

  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function tentarBuscarDadosFinanceiros(itemId: string, rawItem?: any) {
    let finalData: any = null;

    for (let tentativa = 1; tentativa <= 6; tentativa++) {
      try {
        setStatusText(`Sincronizando dados financeiros... ${tentativa}/6`);

        const response = await fetch(GET_FINANCIAL_DATA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId,
            userAgent: navigator.userAgent,
          }),
        });

        const data = await response.json();

        console.log("STATUS PLUGGY:", data);

        if (response.ok && data?.status === "UPDATED") {
          finalData = data;
          break;
        }

        await sleep(1800);
      } catch (error) {
        console.warn("Busca server-side bloqueada/indisponível:", error);
        break;
      }
    }

    localStorage.setItem(
      "libera_open_finance_connection",
      JSON.stringify({
        connected: true,
        itemId,
        rawItem: rawItem || null,
        connectedAt: new Date().toISOString(),
        mode: finalData ? "pluggy-api" : "pluggy-connect",
      })
    );

    if (finalData) {
      localStorage.setItem("libera_financial_data", JSON.stringify(finalData));
    } else {
      localStorage.setItem(
        "libera_financial_data",
        JSON.stringify({
          status: "CONNECT_ONLY",
          itemId,
          rawItem: rawItem || null,
          message:
            "Conta conectada via Pluggy Connect. API server-side ainda não liberada para dados completos.",
        })
      );
    }

    navigate("/analisando");
  }

  async function handleConnect() {
    try {
      setLoading(true);
      setErro("");
      setStatusText("Criando conexão segura...");

      const response = await fetch(CREATE_CONNECT_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao criar conexão Open Finance.");
      }

      if (!data?.accessToken) {
        throw new Error("Token da Pluggy não foi retornado.");
      }

      setConnectToken(data.accessToken);
      setStatusText("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a conexão Open Finance."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSuccess(item: any) {
    try {
      setLoading(true);
      setErro("");
      setStatusText("Conta conectada. Preparando análise...");

      const itemId = extractItemId(item);

      console.log("RETORNO COMPLETO DA PLUGGY:", item);
      console.log("ITEM ID:", itemId);

      if (!itemId) {
        throw new Error("A Pluggy não retornou o itemId.");
      }

      await tentarBuscarDadosFinanceiros(itemId, item);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a conexão."
      );
    } finally {
      setLoading(false);
      setStatusText("");
    }
  }

  function handleError(error: any) {
    console.error("ERRO PLUGGY:", error);
    setErro("Erro ao conectar com o banco.");
  }

  function resetConnection() {
    setConnectToken("");
    setErro("");
    setLoading(false);
    setStatusText("");
  }

  return (
    <AuthShell
      step={{ current: 2, total: 5, label: "Open Finance" }}
      title="Conecte seus dados com segurança."
      subtitle="Você autoriza apenas o necessário."
      maxWidth="max-w-2xl"
    >
      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.25em]">
            Consentimento explícito
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {consentItems.map((it) => (
            <label
              key={it.id}
              htmlFor={it.id}
              className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
            >
              <Checkbox
                id={it.id}
                checked={granted[it.id]}
                onCheckedChange={(v) =>
                  setGranted({ ...granted, [it.id]: Boolean(v) })
                }
                className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <it.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-semibold">{it.t}</h3>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">{it.d}</p>
              </div>
            </label>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Coletamos apenas os dados necessários para calcular o score e proteger
          a análise contra fraude. O acesso pode ser revogado pelo usuário.
        </p>
      </div>

      {statusText && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          {statusText}
        </div>
      )}

      {erro && (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {erro}
        </div>
      )}

      {!connectToken ? (
        <div className="mt-8">
          <Button
            onClick={handleConnect}
            disabled={!allOk || loading}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {loading ? "Preparando conexão..." : "Conectar Open Finance"}
            {!loading && <ArrowRight />}
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <PluggyConnect
            connectToken={connectToken}
            includeSandbox={true}
            onSuccess={handleSuccess}
            onError={handleError}
            onClose={() => {
              console.log("Pluggy fechado pelo usuário.");
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={resetConnection}
          >
            Gerar nova conexão
          </Button>
        </div>
      )}
    </AuthShell>
  );
}