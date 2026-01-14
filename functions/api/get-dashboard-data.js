export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    // Conecta con n8n para pedir las planificaciones recientes
    const response = await fetch(env.WEBHOOK_GET_DASHBOARD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    return new Response(JSON.stringify(responseData), {
      headers: { "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
