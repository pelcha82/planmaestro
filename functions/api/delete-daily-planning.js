export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    // Conecta con tu Webhook de Borrar
    const response = await fetch(env.WEBHOOK_DELETE_PLANNING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Si el webhook no devuelve JSON (a veces pasa al borrar), devolvemos éxito manual
    if (response.status === 200 || response.status === 204) {
         return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      headers: { "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
