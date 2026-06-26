import "@supabase/functions-js/edge-runtime.d.ts"

const session = new Supabase.ai.Session('gte-small');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {...corsHeaders} })
  }

  const { input } = await req.json();

  // Generate the embedding from the user input
  const embedding = await session.run(input, {
    mean_pool: true,
    normalize: true,
  });

  // Return the embedding
  return new Response(
    JSON.stringify({ embedding }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders  } }
  );
});
