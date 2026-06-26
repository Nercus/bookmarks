import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: CORS_HEADERS })
    }

    const { url, title, content, chunk_index } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      )
    }

    if ((!url && !title) || !content || chunk_index === undefined) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: url or title, content, and chunk_index are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase
      .from('bookmark_chunks')
      .insert({
        url,
        title,
        chunk_index,
        content,
      })

    if (error) {
      console.error('Failed to insert bookmark chunk:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to insert bookmark chunk',
          details: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        url,
        title,
        chunk_index,
        message: 'Chunk saved successfully',
      }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    )
  }
  catch (error) {
    console.error('Error in chunk-insert function:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    )
  }
})
