// Netlify EDGE Function (not a standard Function) — runs on infrastructure
// built for longer-running requests, which standard Functions time out on.
// The real Anthropic API key lives here as an environment variable, never in
// the HTML/JS the browser downloads. Set it in:
// Netlify dashboard > Site configuration > Environment variables > ANTHROPIC_API_KEY

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not set in this site's environment variables." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.text();
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body
    });
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Maps this edge function to the same URL the tool already calls —
// no changes needed in the HTML/JS.
export const config = { path: '/.netlify/functions/generate' };
