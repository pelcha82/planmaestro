export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    // Envía el mensaje del chat de unidad a n8n
    const response = await fetch(env.WEBHOOK_UPDATE_UNIT_CHAT_URL, {
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
