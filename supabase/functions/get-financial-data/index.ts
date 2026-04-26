import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getPluggyApiKey() {
  const clientId = Deno.env.get("PLUGGY_CLIENT_ID");
  const clientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais da Pluggy não configuradas.");
  }

  const response = await fetch("https://api.pluggy.ai/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId,
      clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao autenticar na Pluggy: ${errorText}`);
  }

  const data = await response.json();
  return data.apiKey;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { itemId, userAgent } = await req.json();

    if (!itemId) {
      throw new Error("itemId não informado.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase Service Role não configurado.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ip = getIp(req);
    const apiKey = await getPluggyApiKey();

    const itemResponse = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
      },
    });

    if (!itemResponse.ok) {
      const errorText = await itemResponse.text();
      throw new Error(`Erro ao buscar item: ${errorText}`);
    }

    const item = await itemResponse.json();

    const accountsResponse = await fetch(
      `https://api.pluggy.ai/accounts?itemId=${itemId}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
        },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      throw new Error(`Erro ao buscar contas: ${errorText}`);
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.results || [];

    const transactionsByAccount = [];

    for (const account of accounts) {
      const transactionsResponse = await fetch(
        `https://api.pluggy.ai/transactions?accountId=${account.id}&pageSize=500`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": apiKey,
          },
        }
      );

      if (!transactionsResponse.ok) {
        const errorText = await transactionsResponse.text();
        throw new Error(
          `Erro ao buscar transações da conta ${account.id}: ${errorText}`
        );
      }

      const transactionsData = await transactionsResponse.json();

      transactionsByAccount.push({
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        transactions: transactionsData.results || [],
      });
    }

    const transactionsCount = transactionsByAccount.reduce(
      (total, account) => total + account.transactions.length,
      0
    );

    const accountWithCpf = accounts.find((account: any) => account.taxNumber);
    const cpf = accountWithCpf?.taxNumber
      ? onlyDigits(String(accountWithCpf.taxNumber))
      : "";

    const cpfHash = cpf ? await sha256(cpf) : null;
    const accountOwner = accountWithCpf?.owner || null;

    const fraudFlags: string[] = [];
    let fraudRisk: "low" | "medium" | "high" = "low";

    if (!cpfHash) {
      fraudFlags.push("CPF não encontrado nos dados bancários.");
      fraudRisk = "medium";
    }

    if (cpfHash) {
      const { data: sameCpfConnections } = await supabase
        .from("user_connections")
        .select("id, item_id")
        .eq("cpf_hash", cpfHash)
        .neq("item_id", itemId)
        .limit(5);

      if (sameCpfConnections && sameCpfConnections.length > 0) {
        fraudFlags.push(
          "Este CPF já foi associado a outra conexão no LIBERA."
        );
        fraudRisk = "high";
      }
    }

    if (ip !== "unknown") {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: sameIpConnections } = await supabase
        .from("user_connections")
        .select("id")
        .eq("ip", ip)
        .gte("created_at", since)
        .limit(10);

      if (sameIpConnections && sameIpConnections.length >= 3) {
        fraudFlags.push(
          "Múltiplas conexões foram detectadas no mesmo IP em 24 horas."
        );

        if (fraudRisk !== "high") {
          fraudRisk = "medium";
        }
      }
    }

    if (transactionsCount < 5) {
      fraudFlags.push(
        "Poucas transações disponíveis para validar o comportamento financeiro."
      );

      if (fraudRisk === "low") {
        fraudRisk = "medium";
      }
    }

    await supabase.from("user_connections").upsert(
      {
        item_id: itemId,
        cpf_hash: cpfHash,
        account_owner: accountOwner,
        ip,
        user_agent: userAgent || req.headers.get("user-agent") || "unknown",
        item_status: item.status,
        accounts_count: accounts.length,
        transactions_count: transactionsCount,
        fraud_risk: fraudRisk,
        fraud_flags: fraudFlags,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "item_id",
      }
    );

    return new Response(
      JSON.stringify({
        status: item.status,
        item,
        accounts,
        transactionsByAccount,
        security: {
          fraudRisk,
          fraudFlags,
          cpfDetected: Boolean(cpfHash),
          ipCaptured: ip !== "unknown",
          decision:
            fraudRisk === "high"
              ? "manual_review"
              : fraudRisk === "medium"
              ? "limited_credit"
              : "eligible",
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao buscar dados financeiros.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});