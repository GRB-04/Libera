const SAVE_ANALYSIS_URL =
  "https://zspcvabqdkbkopfakjbm.supabase.co/functions/v1/save-analysis";

export async function saveAnalysis(data: any, result: any) {
  const security = data?.security || {};

  const payload = {
    score: result.score,
    limit: result.limit,
    income: result.income,
    expenses: result.expenses,
    balance: result.balance,
    transactionCount: result.transactionCount,
    fraudRisk: result.fraudRisk || security.fraudRisk || "low",
    decision: security.decision || result.decision || "eligible",
    rawData: data,
  };

  const response = await fetch(SAVE_ANALYSIS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  console.log("SAVE ANALYSIS STATUS:", response.status);
  console.log("SAVE ANALYSIS RESPONSE:", text);

  let responseData: any;

  try {
    responseData = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida da função save-analysis: ${text}`);
  }

  if (!response.ok) {
    throw new Error(responseData?.error || "Erro ao salvar análise.");
  }

  return responseData;
}