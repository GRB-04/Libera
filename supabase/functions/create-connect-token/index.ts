import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const PLUGGY_API_URL = 'https://api.pluggy.ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const clientId = Deno.env.get('PLUGGY_CLIENT_ID')
    const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      return jsonResponse(
        {
          error: 'PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET não configurado.',
        },
        500,
      )
    }

    const authResponse = await fetch(`${PLUGGY_API_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
      }),
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.apiKey) {
      return jsonResponse(
        {
          error: 'Erro ao autenticar na Pluggy.',
          details: authData,
        },
        500,
      )
    }

    const connectTokenResponse = await fetch(
      `${PLUGGY_API_URL}/connect_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': authData.apiKey,
        },
        body: JSON.stringify({}),
      },
    )

    const connectTokenData = await connectTokenResponse.json()

    if (!connectTokenResponse.ok) {
      return jsonResponse(
        {
          error: 'Erro ao criar connect token.',
          details: connectTokenData,
        },
        500,
      )
    }

    return jsonResponse(connectTokenData)
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao criar connect token.',
      },
      500,
    )
  }
})