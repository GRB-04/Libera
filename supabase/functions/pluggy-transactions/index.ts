import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const PLUGGY_API_URL = 'https://api.pluggy.ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

async function readJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function authenticatePluggy() {
  const clientId = Deno.env.get('PLUGGY_CLIENT_ID')
  const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET não configurado.')
  }

  console.log('GERANDO API KEY VIA /auth')

  const response = await fetch(`${PLUGGY_API_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      clientSecret,
    }),
  })

  const body = await readJson(response)

  if (!response.ok) {
    throw new Error(
      `Erro AUTH Pluggy ${response.status}: ${JSON.stringify(body)}`,
    )
  }

  const apiKey = String(body?.apiKey ?? '').trim()

  if (!apiKey) {
    throw new Error(`AUTH Pluggy não retornou apiKey: ${JSON.stringify(body)}`)
  }

  console.log('API KEY GERADA COM SUCESSO')

  return apiKey
}

async function pluggyGet(apiKey: string, path: string) {
  const response = await fetch(`${PLUGGY_API_URL}${path}`, {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
    },
  })

  const body = await readJson(response)

  if (!response.ok) {
    throw new Error(
      `Erro GET Pluggy ${path} ${response.status}: ${JSON.stringify(body)}`,
    )
  }

  return body
}

function getDateRange() {
  const to = new Date()
  const from = new Date()

  from.setMonth(from.getMonth() - 12)

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const apiKey = await authenticatePluggy()

    const itemsResponse = await pluggyGet(apiKey, '/items')
    const items = itemsResponse?.results ?? []

    const validItems = items.filter((item: any) => {
      return String(item.status ?? '').toLowerCase() === 'updated'
    })

    const allAccounts: any[] = []
    const allTransactions: any[] = []
    const transactionErrors: any[] = []

    const { from, to } = getDateRange()

    for (const item of validItems) {
      const accountsResponse = await pluggyGet(
        apiKey,
        `/accounts?itemId=${item.id}`,
      )

      const accounts = accountsResponse?.results ?? []

      allAccounts.push(...accounts)

      for (const account of accounts) {
        try {
          const transactionsResponse = await pluggyGet(
            apiKey,
            `/transactions?accountId=${account.id}&from=${from}&to=${to}`,
          )

          allTransactions.push(...(transactionsResponse?.results ?? []))
        } catch (error) {
          transactionErrors.push({
            accountId: account.id,
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    return jsonResponse({
      ok: true,
      source: 'Pluggy',
      debug: {
        itemsFound: items.length,
        validItemsFound: validItems.length,
        accountsFound: allAccounts.length,
        transactionsFound: allTransactions.length,
        transactionErrors,
      },
      items: validItems,
      accounts: allAccounts,
      transactions: allTransactions,
    })
  } catch (error) {
    console.error('ERRO GERAL:', error)

    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})