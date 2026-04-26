import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);

  if (Number.isNaN(number) || !Number.isFinite(number)) {
    return fallback;
  }

  return number;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error);
  }

  return String(error);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Método não permitido.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL não encontrada na Edge Function.");
    }

    if (!serviceRoleKey) {
      throw new Error("SERVICE_ROLE_KEY não encontrada na Edge Function.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      score,
      limit,
      income,
      expenses,
      balance,
      transactionCount,
      fraudRisk,
      decision,
      rawData,
    } = body;

    const payload = {
      score: Math.round(toNumber(score, 300)),
      limit_value: toNumber(limit, 0),
      income: toNumber(income, 0),
      expenses: toNumber(expenses, 0),
      balance: toNumber(balance, 0),
      transaction_count: Math.round(toNumber(transactionCount, 0)),
      fraud_risk: fraudRisk || "low",
      decision: decision || "eligible",
      raw_data: rawData || null,
    };

    const { data, error } = await supabase
      .from("analyses")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Erro Supabase ao inserir em analyses: ${JSON.stringify(error)}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: data,
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
    const message = getErrorMessage(error);

    console.error("SAVE_ANALYSIS_ERROR:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
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