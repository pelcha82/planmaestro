export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    // Conecta con n8n para borrar la unidad
    const response = await fetch(env.WEBHOOK_DELETE_UNIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Si borra correctamente pero no devuelve texto, asumimos éxito
    if (response.ok) {
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
