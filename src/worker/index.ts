import { Hono } from "hono";
import { cors } from "hono/cors";
import { UserRegistrationSchema, TeacherRegistrationSchema } from "@/shared/types";
import { generateVerificationCode } from "./utils/codeGenerator";
import { sendVerificationEmail } from "./utils/emailSender";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for the frontend
app.use("/*", cors());

// User registration endpoint - WEBHOOK ONLY (NO DATABASE)
app.post("/api/register-user", async (c) => {
  try {
    const body = await c.req.json();
    const validated = UserRegistrationSchema.parse(body);
    const email = validated.correo.toLowerCase().trim();

    console.log('📝 [REGISTER] Iniciando registro para:', email);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    console.log('🔢 [REGISTER] Código generado:', verificationCode);

    // Send verification email via webhook
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      console.error('❌ [REGISTER] Error al enviar email');
      return c.json({ 
        error: "Error al enviar el código de verificación. Por favor intenta de nuevo." 
      }, 500);
    }

    console.log('✅ [REGISTER] Email de verificación enviado exitosamente');

    return c.json({ 
      success: true, 
      message: "Código de verificación enviado a tu correo",
      correo: email
    });
  } catch (error) {
    console.error('❌ [REGISTER] Error:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Error desconocido" }, 500);
  }
});

// Teacher registration endpoint - NO DATABASE
app.post("/api/register-teacher", async (c) => {
  try {
    const body = await c.req.json();
    const validated = TeacherRegistrationSchema.parse(body);

    // No database operations - just validate and return success
    return c.json({ 
      success: true, 
      message: "Maestro registrado exitosamente",
      correo: validated.correo
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Error desconocido" }, 500);
  }
});

// Email verification endpoint - WEBHOOK ONLY (NO DATABASE)
app.post("/api/verify-email", async (c) => {
  try {
    const body = await c.req.json();
    const { correo, code } = body;

    if (!correo || !code) {
      return c.json({ error: "Correo y código son requeridos" }, 400);
    }

    const email = correo.toLowerCase().trim();
    console.log('🔐 [VERIFY CODE] Verificando código para:', email, 'código:', code);
    
    // Send email and code to webhook for verification
    const webhookResponse = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/CONFIRMARCODIGO', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo: email, code }),
    });

    console.log('✅ [VERIFY CODE] Respuesta del webhook:', webhookResponse.status);

    if (!webhookResponse.ok) {
      console.error('❌ [VERIFY CODE] Error HTTP del webhook:', webhookResponse.status);
      return c.json({ error: "Error al verificar código con el servidor" }, 500);
    }

    const webhookData = await webhookResponse.text();
    console.log('📦 [VERIFY CODE] Respuesta del webhook (raw):', webhookData);

    // If webhook returns empty, code is incorrect
    if (!webhookData || webhookData.trim() === '') {
      console.error('❌ [VERIFY CODE] Webhook devolvió respuesta vacía - código incorrecto');
      return c.json({ error: "Código de verificación incorrecto" }, 401);
    }
    
    // The webhook returned data - code is correct
    console.log('✅ [VERIFY CODE] Webhook devolvió datos - código verificado exitosamente');
    
    return c.json({ 
      success: true, 
      message: "Email verificado exitosamente",
      correo: email,
      code: code
    });
  } catch (error) {
    console.error('❌ [VERIFY CODE] Error:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Error desconocido" }, 500);
  }
});

// Get teacher data endpoint - NO DATABASE (data comes from webhooks only)
app.get("/api/teacher/:id", async (c) => {
  try {
    // No database - data should be fetched from webhooks in the frontend
    return c.json({ error: "Endpoint obsoleto - use webhooks" }, 410);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener datos del maestro" }, 500);
  }
});

// Update teacher data endpoint - NO DATABASE (data updated via webhooks only)
app.put("/api/teacher/:id", async (c) => {
  try {
    // No database - data should be updated via webhooks
    return c.json({ error: "Endpoint obsoleto - use webhooks" }, 410);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Error desconocido" }, 500);
  }
});

// Login endpoint - WEBHOOK ONLY (NO DATABASE)
app.post("/api/login", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo;
    const code = body.code;

    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    if (!code) {
      return c.json({ error: "código de verificación es requerido" }, 400);
    }

    const email = correo.toLowerCase().trim();
    console.log('🔐 [LOGIN] Iniciando sesión con código de verificación');
    console.log('  - Correo:', email);
    console.log('  - Código:', code);
    
    // Send the email and code to the N8N webhook for validation
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/INICIODESECION', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo: email, code }),
    });

    console.log('✅ [LOGIN] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ [LOGIN] El webhook devolvió un error:', response.status);
      return c.json({ error: "Código de verificación inválido o expirado" }, 401);
    }

    // Get the response text (N8N may return text or JSON)
    const responseText = await response.text();
    console.log('📦 [LOGIN] Cuerpo de respuesta de N8N:', responseText);

    // Check if the response is empty (invalid code)
    if (!responseText || responseText.trim() === '') {
      console.error('❌ [LOGIN] Webhook devolvió respuesta vacía - código inválido');
      return c.json({ error: "Código de verificación inválido o expirado" }, 401);
    }

    // The webhook returned data - code is valid
    console.log('✅ [LOGIN] Webhook confirmó código válido - inicio de sesión exitoso');

    return c.json({ 
      success: true, 
      message: "Inicio de sesión exitoso",
      correo: email
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error en login:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Error desconocido" }, 500);
  }
});

// Endpoint to get teacher name from TIEMPOAHORRADO webhook
app.post("/api/get-teacher-name", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo;
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    console.log('👤 [TIEMPOAHORRADO] Obteniendo estadísticas para:', correo);
    
    // Call the TIEMPOAHORRADO webhook
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/TIEMPOAHORRADO', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo }),
    });

    console.log('✅ [TIEMPOAHORRADO] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TIEMPOAHORRADO] Error del webhook:', errorText);
      return c.json({ error: 'Error al obtener estadísticas' }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [TIEMPOAHORRADO] Datos recibidos (longitud):', responseText.length);
    console.log('📄 [TIEMPOAHORRADO] Respuesta completa:', responseText);

    // Parse the webhook response
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      console.log('🔍 [TIEMPOAHORRADO] Tipo de datos:', Array.isArray(parsedData) ? 'Array' : typeof parsedData);
      console.log('📋 [TIEMPOAHORRADO] Estructura completa:', JSON.stringify(parsedData, null, 2));
    } catch {
      console.error('❌ [TIEMPOAHORRADO] No se pudo parsear la respuesta como JSON');
      return c.json({ error: 'Respuesta del webhook inválida' }, 500);
    }

    // NUEVA ESTRUCTURA del webhook:
    // [{
    //   "conteo": {
    //     "planificaciones_diarias": 0,
    //     "planificaciones_unidad": 1
    //   },
    //   "calculos": {
    //     "horas_totales": 1.5,
    //     "monto_rd": 984
    //   },
    //   "resumen_texto": "Resultado: 1.5 horas acumuladas para un total de RD$ 984"
    // }]
    
    let stats = null;
    
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      const rawStats = parsedData[0];
      console.log('📊 [TIEMPOAHORRADO] Datos crudos del webhook:', JSON.stringify(rawStats, null, 2));
      
      // Transform the new structure to the format expected by frontend
      stats = {
        conteo_diaria: rawStats.conteo?.planificaciones_diarias || 0,
        conteo_unidad: rawStats.conteo?.planificaciones_unidad || 0,
        total_horas: rawStats.calculos?.horas_totales || 0,
        total_pesos: rawStats.calculos?.monto_rd || 0,
        resumen_final: rawStats.resumen_texto || ''
      };
      
      console.log('📊 [TIEMPOAHORRADO] Estadísticas transformadas:', JSON.stringify(stats, null, 2));
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // Check if it's already in the old format
      if (parsedData.conteo_diaria !== undefined || parsedData.total_horas !== undefined) {
        stats = parsedData;
        console.log('📊 [TIEMPOAHORRADO] Usando formato antiguo (objeto directo)');
      } else if (parsedData.conteo && parsedData.calculos) {
        // Transform the new structure
        stats = {
          conteo_diaria: parsedData.conteo?.planificaciones_diarias || 0,
          conteo_unidad: parsedData.conteo?.planificaciones_unidad || 0,
          total_horas: parsedData.calculos?.horas_totales || 0,
          total_pesos: parsedData.calculos?.monto_rd || 0,
          resumen_final: parsedData.resumen_texto || ''
        };
        console.log('📊 [TIEMPOAHORRADO] Transformado de nuevo formato (objeto)');
      } else {
        stats = parsedData;
      }
      console.log('📊 [TIEMPOAHORRADO] Estadísticas finales:', JSON.stringify(stats, null, 2));
    } else {
      console.error('❌ [TIEMPOAHORRADO] Formato de respuesta no reconocido');
      return c.json({ error: 'Formato de respuesta inválido' }, 500);
    }
    
    console.log('✅ [TIEMPOAHORRADO] Estadísticas procesadas exitosamente');

    return c.json({ 
      success: true, 
      data: stats
    });
  } catch (error) {
    console.error('❌ [TIEMPOAHORRADO] Error al obtener estadísticas:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener estadísticas" }, 500);
  }
});

// Resend verification code endpoint - WEBHOOK ONLY (NO DATABASE)
app.post("/api/send-to-n8n", async (c) => {
  try {
    const body = await c.req.json();
    const email = (body.correo || body.email || '').toLowerCase().trim();
    
    if (!email) {
      return c.json({ error: "Correo es requerido" }, 400);
    }

    console.log('🔄 [RESEND] Reenviando código de verificación para:', email);
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();

    console.log('🔢 [RESEND] Nuevo código generado:', verificationCode);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      console.error('❌ [RESEND] Error al enviar email');
      return c.json({ 
        error: "Error al enviar el código. Por favor intenta de nuevo." 
      }, 500);
    }

    console.log('✅ [RESEND] Código reenviado exitosamente');

    return c.json({ 
      success: true, 
      message: "Nuevo código enviado a tu correo"
    });
  } catch (error) {
    console.error('❌ [RESEND] Error:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al reenviar código" }, 500);
  }
});

// Proxy endpoint for teacher N8N webhook to avoid CORS issues
app.post("/api/send-teacher-to-n8n", async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('Enviando datos de maestro al webhook de N8N:', body);
    
    // Forward the request to the N8N webhook
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/2b437f86-685f-4fd9-a2e5-ca934995dd1c', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Respuesta de N8N (maestro):', response.status, response.statusText);

    // Get the response text (N8N may return text or JSON)
    const responseText = await response.text();
    console.log('Cuerpo de respuesta de N8N (maestro):', responseText);

    if (!response.ok) {
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: responseText
      }, 500);
    }

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    return c.json({ 
      success: true, 
      message: "Datos de maestro enviados exitosamente",
      webhookResponse: responseData
    });
  } catch (error) {
    console.error('Error al enviar datos de maestro a N8N:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al enviar datos del maestro al webhook" }, 500);
  }
});

// Proxy endpoint for initial teacher registration webhook
app.post("/api/send-initial-registration-to-n8n", async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('Enviando datos de registro inicial al webhook de N8N:', body);
    
    // Forward the request to the N8N webhook for teacher registration
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/2b437f86-685f-4fd9-a2e5-ca934995dd1c', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Respuesta de N8N (registro inicial):', response.status, response.statusText);

    // Get the response text (N8N may return text or JSON)
    const responseText = await response.text();
    console.log('Cuerpo de respuesta de N8N (registro inicial):', responseText);

    if (!response.ok) {
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: responseText
      }, 500);
    }

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Database removed - no backup needed

    return c.json({ 
      success: true, 
      message: "Datos de registro inicial enviados exitosamente",
      webhookResponse: responseData
    });
  } catch (error) {
    console.error('Error al enviar datos de registro inicial a N8N:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al enviar datos de registro inicial al webhook" }, 500);
  }
});

// Endpoint to get teacher profile - NO DATABASE (use webhooks)
app.post("/api/get-teacher-profile", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo;
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    console.log('👤 [GET PROFILE] Base de datos eliminada - no hay perfiles');
    
    return c.json({ 
      success: true, 
      data: null 
    });
  } catch (error) {
    console.error('❌ [GET PROFILE] Error:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener perfil del maestro" }, 500);
  }
});

// Proxy endpoint for unit planning N8N webhook to avoid CORS issues
app.post("/api/send-unit-planning-to-n8n", async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('✅ [UNIT PLANNING] Enviando planificación de unidad al webhook de N8N:', body);
    
    // Database removed - just use data from request
    console.log('📤 [UNIT PLANNING] Usando datos del request (sin base de datos)');
    
    let webhookPayload = { ...body };
    
    // Iniciar el webhook de forma asíncrona y usar waitUntil para mantener el Worker activo
    console.log('🚀 [UNIT PLANNING] Iniciando generación de planificación');
    console.log('📤 [UNIT PLANNING] Payload completo a enviar:', JSON.stringify(webhookPayload, null, 2));
    
    // Crear una promesa para el webhook que se ejecutará en segundo plano
    const webhookPromise = fetch('https://n8n.srv1144975.hstgr.cloud/webhook/9681bb69-8325-4943-bb6d-3b37e290d73a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    }).then(async (response) => {
      console.log('📥 [UNIT PLANNING] Respuesta de N8N:', response.status, response.statusText);
      const responseText = await response.text();
      console.log('📄 [UNIT PLANNING] Cuerpo de respuesta (longitud):', responseText.length);
      
      if (response.ok && responseText.length > 0) {
        console.log('✅ [UNIT PLANNING] Webhook procesó exitosamente');
        console.log('📋 [UNIT PLANNING] Respuesta (primeros 500 chars):', responseText.substring(0, 500));
      } else {
        console.error('❌ [UNIT PLANNING] Error del webhook:', response.status);
      }
      
      return responseText;
    }).catch(err => {
      console.error('❌ [UNIT PLANNING] Error al comunicarse con webhook:', err.message);
    });

    // Usar waitUntil para mantener el Worker activo mientras se procesa el webhook
    c.executionCtx.waitUntil(webhookPromise);

    // Responder inmediatamente al frontend para evitar timeouts del navegador
    console.log('✅ [UNIT PLANNING] Solicitud aceptada, procesando en segundo plano');
    
    return c.json({ 
      success: true, 
      message: "Planificación iniciada exitosamente",
      status: "processing"
    });
  } catch (error) {
    console.error('❌ [UNIT PLANNING] Error al enviar planificación de unidad a N8N:', error);
    
    let errorMessage = "Error al enviar planificación de unidad al webhook";
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "El webhook tardó demasiado en responder (timeout de 4 minutos)";
      } else {
        errorMessage = error.message;
      }
    }
    
    return c.json({ 
      success: false,
      error: errorMessage
    }, 500);
  }
});

// Endpoint to receive webhook responses from N8N - NO DATABASE
app.post("/api/webhook-response", async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('Recibiendo respuesta del webhook de N8N:', body);
    
    // Database removed - just acknowledge receipt
    return c.json({ 
      success: true, 
      message: "Respuesta del webhook recibida" 
    });
  } catch (error) {
    console.error('Error al procesar respuesta del webhook:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al procesar respuesta del webhook" }, 500);
  }
});

// Endpoint to get teacher account data
app.post("/api/get-teacher-account", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo;
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    console.log('📧 [MI CUENTA] Obteniendo datos de cuenta del maestro:', correo);
    
    // Call the N8N webhook to get teacher account data
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/93d89063-03bc-4c06-8c57-893776dbaa41', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo }),
    });

    console.log('✅ [MI CUENTA] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [MI CUENTA] Error del webhook:', errorText);
      return c.json({ error: 'Error al obtener datos del maestro' }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [MI CUENTA] Datos recibidos (longitud):', responseText.length);

    // Parse and return the webhook data
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('🔍 [MI CUENTA] Campos disponibles:', Object.keys(data));
      console.log('📋 [MI CUENTA] Datos completos:', JSON.stringify(data, null, 2));
    } catch {
      console.error('❌ [MI CUENTA] No se pudo parsear la respuesta como JSON');
      return c.json({ error: 'Respuesta del webhook inválida' }, 500);
    }

    return c.json({ 
      success: true, 
      data: data
    });
  } catch (error) {
    console.error('❌ [MI CUENTA] Error al obtener datos de cuenta:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener datos de cuenta" }, 500);
  }
});

// Endpoint to update teacher account data (centro educativo update)
app.post("/api/update-teacher-account", async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }
    
    if (!body.centro_educativo) {
      return c.json({ error: "centro_educativo es requerido" }, 400);
    }

    console.log('🏫 [ACTUALIZAR CENTRO] Actualizando centro educativo del maestro');
    console.log('  - Correo:', body.correo);
    console.log('  - Nuevo centro educativo:', body.centro_educativo);
    
    // Send correo and centro_educativo to the N8N webhook
    const webhookPayload = {
      correo: body.correo,
      centro_educativo: body.centro_educativo
    };
    
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/2b33fde5-d138-4726-adae-b4616d51822b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('✅ [ACTUALIZAR CENTRO] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ACTUALIZAR CENTRO] Error del webhook:', errorText);
      return c.json({ error: 'Error al actualizar centro educativo' }, 500);
    }

    await response.text(); // Consume response body
    console.log('🎉 [ACTUALIZAR CENTRO] Centro educativo actualizado confirmado por webhook');

    return c.json({ 
      success: true, 
      message: 'Centro educativo actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ [ACTUALIZAR CENTRO] Error al actualizar centro educativo:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al actualizar centro educativo" }, 500);
  }
});

// Endpoint to get section content from webhook
app.post("/api/get-section-content", async (c) => {
  try {
    const body = await c.req.json();
    const { seccion_solicitada, usuario_email, unidad_id } = body;
    
    if (!seccion_solicitada || !usuario_email || !unidad_id) {
      return c.json({ 
        error: "seccion_solicitada, usuario_email y unidad_id son requeridos" 
      }, 400);
    }

    console.log('🔍 [GET SECTION] Solicitando contenido de sección al webhook:', {
      seccion_solicitada,
      usuario_email,
      unidad_id
    });
    
    // Call N8N webhook to get section content
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/9425cc30-3ea8-46d3-b228-4ba52dec7d31', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: usuario_email,
        section_name: seccion_solicitada,
        unit_id: unidad_id
      }),
    });

    console.log('✅ [GET SECTION] Respuesta del webhook:', response.status);

    if (!response.ok) {
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`
      }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [GET SECTION] Contenido recibido del webhook');

    // Try to parse as JSON, fallback to text
    let content = '';
    try {
      const jsonResponse = JSON.parse(responseText);
      
      // The webhook might return content in different fields
      if (jsonResponse[seccion_solicitada]) {
        content = jsonResponse[seccion_solicitada];
      } else if (jsonResponse.content) {
        content = jsonResponse.content;
      } else if (jsonResponse.section_content) {
        content = jsonResponse.section_content;
      } else if (typeof jsonResponse === 'string') {
        content = jsonResponse;
      } else {
        // If it's an array, find the matching unit
        if (Array.isArray(jsonResponse)) {
          const matchingUnit = jsonResponse.find((item: any) => 
            item.unidad === unidad_id || item.unit_id === unidad_id
          );
          if (matchingUnit && matchingUnit[seccion_solicitada]) {
            content = matchingUnit[seccion_solicitada];
          }
        }
      }
    } catch {
      content = responseText;
    }

    console.log('📋 [GET SECTION] Contenido procesado, longitud:', content.length);

    return c.json({ 
      success: true, 
      content: content,
      section_name: seccion_solicitada
    });
  } catch (error) {
    console.error('❌ [GET SECTION] Error al obtener contenido de sección:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener contenido de la sección" }, 500);
  }
});

// Endpoint to get webhook responses for a teacher - NO DATABASE
app.get("/api/webhook-responses/:teacherId", async (c) => {
  try {
    // Database removed - data should come from webhooks only
    return c.json({ error: "Endpoint obsoleto - use webhooks" }, 410);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener respuestas del webhook" }, 500);
  }
});

// Endpoint to update a webhook response - NO DATABASE
app.put("/api/webhook-responses/:id", async (c) => {
  try {
    // Database removed - data should be updated via webhooks
    return c.json({ error: "Endpoint obsoleto - use webhooks" }, 410);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Error desconocido" }, 500);
  }
});

// Endpoint to send edit request to webhook
app.post("/api/send-edit-request-to-webhook", async (c) => {
  try {
    const body = await c.req.json();
    const { correo, section_name, instruction } = body;
    
    if (!correo || !section_name || !instruction) {
      return c.json({ error: "correo, section_name e instruction son requeridos" }, 400);
    }

    console.log('Enviando solicitud de edición al webhook de N8N:', { correo, section_name, instruction });
    
    // Send request to the N8N webhook
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/73f50b15-2291-42cb-a056-4e120f2abf3f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        correo,
        section_name,
        instruction
      }),
    });

    console.log('Respuesta del webhook de edición:', response.status, response.statusText);

    // Get the response text (N8N may return text or JSON)
    const responseText = await response.text();
    console.log('Cuerpo de respuesta del webhook de edición:', responseText);

    if (!response.ok) {
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: responseText
      }, 500);
    }

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Database removed - no backup needed

    return c.json({ 
      success: true, 
      message: "Solicitud de edición enviada exitosamente",
      webhookResponse: responseData
    });
  } catch (error) {
    console.error('Error al enviar solicitud de edición a N8N:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al enviar solicitud de edición al webhook" }, 500);
  }
});

// Endpoint to modify planning section with AI (using N8N webhook)
app.post("/api/ai-modify-section", async (c) => {
  try {
    const body = await c.req.json();
    const { section_content, instruction, section_name, correo, unit_id } = body;
    
    // Validate 3 mandatory fields (instruction can be empty for auto-loading)
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }
    
    if (!section_name) {
      return c.json({ error: "section_name es requerido" }, 400);
    }
    
    if (!unit_id) {
      return c.json({ error: "unit_id es requerido" }, 400);
    }
    
    // instruction can be empty - when empty, webhook will return current content
    const instructionText = instruction || '';
    
    // section_content is allowed to be empty - user might be adding content to an empty field
    const contentToModify = section_content || '';

    console.log('📤 [AI EDIT] Enviando solicitud al webhook');
    console.log('  - Correo:', correo);
    console.log('  - Sección:', section_name);
    console.log('  - Unidad:', unit_id);
    console.log('  - Instrucción:', instructionText === '' ? '(vacío - auto-carga)' : instructionText.substring(0, 100) + '...');
    
    // Call N8N webhook with 4 fields + section_content for context
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/73f50b15-2291-42cb-a056-4e120f2abf3f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction: instructionText,
        correo: correo,
        section_name: section_name,
        unit_id: unit_id,
        // Additional context field
        section_content: contentToModify
      }),
    });

    console.log('✅ [AI EDIT] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AI EDIT] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    // Get the response from the webhook
    const responseText = await response.text();
    console.log('📥 [AI EDIT] Contenido modificado recibido del webhook');

    // Try to parse as JSON, fallback to text
    let modifiedContent = responseText;
    try {
      const jsonResponse = JSON.parse(responseText);
      // The webhook might return the content in different fields
      if (jsonResponse.modified_content) {
        modifiedContent = jsonResponse.modified_content;
      } else if (jsonResponse.content) {
        modifiedContent = jsonResponse.content;
      } else if (jsonResponse.result) {
        modifiedContent = jsonResponse.result;
      } else if (typeof jsonResponse === 'string') {
        modifiedContent = jsonResponse;
      }
    } catch {
      // Use plain text response
      modifiedContent = responseText;
    }

    return c.json({ 
      success: true, 
      modified_content: modifiedContent.trim(),
      original_content: contentToModify
    });
  } catch (error) {
    console.error('❌ [AI EDIT] Error al modificar sección:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al procesar con webhook" }, 500);
  }
});

// Endpoint for daily planning chat - sends to specific webhook
app.post("/api/send-daily-chat-message", async (c) => {
  try {
    const body = await c.req.json();
    const { section, email, message, activityName, planningData } = body;
    
    // Validate 2 mandatory fields
    if (!section) {
      return c.json({ error: "section es requerido" }, 400);
    }
    
    if (!email) {
      return c.json({ error: "email es requerido" }, 400);
    }
    
    // Message can be empty for auto-loading activity content
    const messageText = message || "";

    console.log('📤 [DAILY CHAT] Enviando mensaje de chat diario al webhook');
    console.log('  - Email:', email);
    console.log('  - Sección (campo a modificar):', section);
    console.log('  - Mensaje:', messageText === '' ? '(vacío - auto-carga)' : messageText.substring(0, 100) + '...');
    console.log('  - Nombre de Actividad:', activityName || '(no especificado)');
    
    // Build complete webhook payload with ALL 18 fields from planningData
    const webhookPayload = {
      // Planning identification
      'section': section,  // Field name to modify
      'email': email,
      'message': messageText,
      
      // All 18 required fields from the database
      'CENTRO EDUCATIVO': planningData?.['CENTRO EDUCATIVO'] || planningData?.centroEducativo || '',
      'DOCENTE': planningData?.['DOCENTE'] || planningData?.docente || '',
      'MATERIA': planningData?.['MATERIA'] || planningData?.materia || planningData?.asignatura || '',
      'TEMA DEL DÍA': planningData?.['TEMA DEL DÍA'] || planningData?.['TEMA_DEL_DIA'] || planningData?.tema || planningData?.titulo || activityName || '',
      'COMPETENCIA ESPECÍFICA': planningData?.['COMPETENCIA ESPECÍFICA'] || planningData?.competenciaEspecifica || '',
      'INDICADORES DE LOGRO': planningData?.['INDICADORES DE LOGRO'] || planningData?.indicadoresLogro || '',
      'ESTRATEGIA DE ENSEÑANZA': planningData?.['ESTRATEGIA DE ENSEÑANZA'] || planningData?.estrategiaEnsenanza || '',
      'INTENCIÓN PEDAGÓGICA DEL DÍA': planningData?.['INTENCIÓN PEDAGÓGICA DEL DÍA'] || planningData?.intencionPedagogica || '',
      'SECUENCIA DIDACTICA': planningData?.['SECUENCIA DIDACTICA'] || planningData?.secuenciaDidactica || '',
      'ESTRATEGIA E INSTRUMENTO DE EVALUACION': planningData?.['ESTRATEGIA E INSTRUMENTO DE EVALUACION'] || planningData?.estrategiaInstrumentoEvaluacion || '',
      'RECURSOS DIDÁCTICOS': planningData?.['RECURSOS DIDÁCTICOS'] || planningData?.['RECURSOS DIDACTICOS'] || planningData?.recursosDidacticos || '',
      'CORREO': email,
      'COMPETENCIAS FUNDAMENTALES': planningData?.['COMPETENCIAS FUNDAMENTALES'] || planningData?.['COMPETENCIA FUNDAMENTALES'] || planningData?.competenciaFundamental || '',
      'EJE TRANSVERSAL': planningData?.['EJE TRANSVERSAL'] || planningData?.ejeTransversal || '',
      'VALORES Y ACTITUDES': planningData?.['VALORES Y ACTITUDES'] || planningData?.['VALAORES Y ACTITUDES'] || planningData?.valoresYActitudes || '',
      'Unidad': planningData?.['Unidad'] || planningData?.['UNIDAD'] || planningData?.unidad || '',
      'FECHA DE CREACION': planningData?.['FECHA DE CREACION'] || planningData?.createdAt || '',
      'GRADO': planningData?.['GRADO'] || planningData?.grado || ''
    };
    
    console.log('📦 [DAILY CHAT] Enviando planificación completa (18 campos)');
    console.log('   Webhook:', 'https://n8n.srv1144975.hstgr.cloud/webhook/20040596-1924-412c-b47b-8c7604ba8377');
    
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/20040596-1924-412c-b47b-8c7604ba8377', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('✅ [DAILY CHAT] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DAILY CHAT] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    // Get the response from the webhook as plain text
    const responseText = await response.text();
    console.log('📥 [DAILY CHAT] Respuesta recibida del webhook (texto plano)');

    // Return the plain text response directly
    const aiResponse = responseText.trim();

    console.log('🎉 [DAILY CHAT] Mensaje procesado exitosamente');

    return c.json({ 
      success: true, 
      response: aiResponse
    });
  } catch (error) {
    console.error('❌ [DAILY CHAT] Error al enviar mensaje:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al procesar mensaje de chat diario" }, 500);
  }
});

// Endpoint for manual section editing
app.post("/api/manual-edit-section", async (c) => {
  try {
    const body = await c.req.json();
    const { instruction, correo, section_name, unit_id } = body;
    
    // Validate 4 mandatory fields
    if (!instruction || instruction.trim() === '') {
      return c.json({ error: "instruction es requerido" }, 400);
    }
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }
    
    if (!section_name) {
      return c.json({ error: "section_name es requerido" }, 400);
    }
    
    if (!unit_id) {
      return c.json({ error: "unit_id es requerido" }, 400);
    }

    console.log('📤 [MANUAL EDIT] Enviando edición manual al webhook');
    console.log('  - Correo:', correo);
    console.log('  - Sección:', section_name);
    console.log('  - Unidad:', unit_id);
    console.log('  - Contenido:', instruction.substring(0, 100) + '...');
    
    // Call N8N webhook with 4 mandatory fields
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/73f50b15-2291-42cb-a056-4e120f2abf3f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction: instruction,
        correo: correo,
        section_name: section_name,
        unit_id: unit_id
      }),
    });

    console.log('✅ [MANUAL EDIT] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [MANUAL EDIT] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    await response.text(); // Consume response body
    console.log('💾 [MANUAL EDIT] Edición manual procesada exitosamente');

    return c.json({ 
      success: true, 
      message: 'Edición manual guardada exitosamente'
    });
  } catch (error) {
    console.error('❌ [MANUAL EDIT] Error al guardar edición manual:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al procesar edición manual" }, 500);
  }
});

// Endpoint to request a response from the webhook - NO DATABASE
app.post("/api/request-webhook-response", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo || body.email;
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    console.log('Solicitando respuesta del webhook para:', correo);
    
    // Send request to the N8N webhook with email only
    const response = await fetch('https://apocalipsis.app.n8n.cloud/webhook/d8929e7a-0df9-4e28-89ee-3a22ef58e5e3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        correo: correo
      }),
    });

    console.log('Respuesta del webhook:', response.status, response.statusText);

    // Get the response text (N8N may return text or JSON)
    const responseText = await response.text();

    if (!response.ok) {
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: responseText
      }, 500);
    }

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Database removed - just return the webhook response
    return c.json({ 
      success: true, 
      message: "Respuesta del webhook recibida",
      webhookResponse: responseData
    });
  } catch (error) {
    console.error('Error al solicitar respuesta del webhook:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al solicitar respuesta del webhook" }, 500);
  }
});

// Endpoint to save chat conversation - NO DATABASE
app.post("/api/save-chat-conversation", async (c) => {
  try {
    const body = await c.req.json();
    const { correo, unit_id, section_name, conversation_data } = body;
    
    if (!correo || !unit_id || !section_name || !conversation_data) {
      return c.json({ 
        error: "correo, unit_id, section_name y conversation_data son requeridos" 
      }, 400);
    }

    console.log('💬 [SAVE CHAT] Conversación recibida (no se guarda en BD)');
    console.log('  - Correo:', correo);
    console.log('  - Unidad:', unit_id);
    console.log('  - Sección:', section_name);
    console.log('  - Mensajes:', conversation_data.length);
    
    // Database removed - just acknowledge receipt
    return c.json({ 
      success: true, 
      message: "Conversación procesada (no persistida)" 
    });
  } catch (error) {
    console.error('❌ [SAVE CHAT] Error al procesar conversación:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al procesar conversación" }, 500);
  }
});

// Endpoint to get daily planning details - OLD WEBHOOK (for backward compatibility)
app.post("/api/get-daily-planning-by-activity-old", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo || body.CORREO;
    const nombreActividad = body.nombre_actividad || body.NOMBRE_ACTIVIDAD;
    const grado = body.grado || body.GRADO || '';
    const asignatura = body.asignatura || body.ASIGNATURA || '';
    const centroEducativo = body.centro_educativo || body.CENTRO_EDUCATIVO || '';
    const docente = body.docente || body.DOCENTE || '';
    
    if (!correo) {
      return c.json({ 
        error: "CORREO es requerido" 
      }, 400);
    }
    
    if (!nombreActividad) {
      return c.json({ 
        error: "NOMBRE_ACTIVIDAD es requerido" 
      }, 400);
    }

    console.log('📖 [VIEW DAILY PLANNING OLD] Obteniendo detalles de planificación diaria');
    console.log('  - CORREO:', correo);
    console.log('  - NOMBRE_ACTIVIDAD:', nombreActividad);
    console.log('  - GRADO:', grado);
    console.log('  - ASIGNATURA:', asignatura);
    console.log('  - CENTRO EDUCATIVO:', centroEducativo);
    console.log('  - DOCENTE:', docente);
    
    const webhookPayload = {
      CORREO: correo,
      NOMBRE_ACTIVIDAD: nombreActividad,
      GRADO: grado,
      ASIGNATURA: asignatura,
      'CENTRO EDUCATIVO': centroEducativo,
      DOCENTE: docente
    };
    
    console.log('📤 [VIEW DAILY PLANNING OLD] Enviando al webhook de visualización');
    console.log('   - Webhook: https://n8n.srv1144975.hstgr.cloud/webhook/a5de0afb-b2ae-4d46-8056-0f9bfefa282c');
    console.log('   - Payload:', JSON.stringify(webhookPayload));
    
    // Call N8N webhook to get daily planning details for visualization
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/a5de0afb-b2ae-4d46-8056-0f9bfefa282c', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('✅ [VIEW DAILY PLANNING OLD] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [VIEW DAILY PLANNING OLD] Error del webhook:', errorText);
      return c.json({ 
        success: false,
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [VIEW DAILY PLANNING OLD] Respuesta recibida (longitud):', responseText.length);

    // Handle empty responses gracefully
    if (!responseText || responseText.trim() === '') {
      console.log('⚠️ [VIEW DAILY PLANNING OLD] Webhook devolvió respuesta vacía');
      return c.json({ 
        success: false,
        error: "Webhook devolvió respuesta vacía"
      }, 404);
    }

    // Try to parse as JSON
    let planningData = null;
    
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('🔍 [VIEW DAILY PLANNING OLD] Estructura de respuesta:', Object.keys(jsonResponse));
      planningData = jsonResponse;
    } catch (parseError) {
      console.error('⚠️ [VIEW DAILY PLANNING OLD] No se pudo parsear la respuesta como JSON');
      console.error('⚠️ [VIEW DAILY PLANNING OLD] Respuesta raw:', responseText.substring(0, 500));
      return c.json({ 
        success: false,
        error: "Respuesta del webhook inválida" 
      }, 500);
    }

    console.log('📋 [VIEW DAILY PLANNING OLD] Detalles de planificación obtenidos exitosamente');

    return c.json({ 
      success: true, 
      data: planningData
    });
  } catch (error) {
    console.error('❌ [VIEW DAILY PLANNING OLD] Error al obtener detalles de planificación:', error);
    if (error instanceof Error) {
      return c.json({ 
        success: false,
        error: error.message 
      }, 500);
    }
    return c.json({ 
      success: false,
      error: "Error al obtener detalles de planificación del webhook" 
    }, 500);
  }
});

// Endpoint to get daily planning details - NEW WEBHOOK (for page load)
app.post("/api/get-daily-planning-details", async (c) => {
  try {
    const body = await c.req.json();
    const correo = body.correo || body.CORREO;
    const asignatura = body.asignatura || body.ASIGNATURA;
    const temaDia = body.tema_del_dia || body.TEMA_DEL_DIA;
    const grado = body.grado || body.GRADO || '';
    
    if (!correo) {
      return c.json({ 
        error: "CORREO es requerido" 
      }, 400);
    }
    
    if (!asignatura) {
      return c.json({ 
        error: "ASIGNATURA es requerida" 
      }, 400);
    }
    
    if (!temaDia) {
      return c.json({ 
        error: "TEMA_DEL_DIA es requerido" 
      }, 400);
    }

    console.log('📖 [DAILY PLANNING DETAILS] Obteniendo detalles completos de planificación');
    console.log('  - CORREO:', correo);
    console.log('  - ASIGNATURA:', asignatura);
    console.log('  - TEMA_DEL_DIA:', temaDia);
    console.log('  - GRADO:', grado);
    
    const webhookPayload = {
      CORREO: correo,
      ASIGNATURA: asignatura,
      TEMA_DEL_DIA: temaDia,
      GRADO: grado
    };
    
    console.log('📤 [DAILY PLANNING DETAILS] Enviando al webhook de detalles');
    console.log('   - Webhook: https://n8n.srv1144975.hstgr.cloud/webhook/3e96875c-487c-4781-b9fc-25cfb5dd0259');
    console.log('   - Payload:', JSON.stringify(webhookPayload));
    
    // Call N8N webhook to get complete daily planning details
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/3e96875c-487c-4781-b9fc-25cfb5dd0259', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('✅ [DAILY PLANNING DETAILS] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DAILY PLANNING DETAILS] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [DAILY PLANNING DETAILS] Respuesta recibida (longitud):', responseText.length);

    // Try to parse as JSON
    let planningData = null;
    
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('🔍 [DAILY PLANNING DETAILS] Estructura de respuesta:', Object.keys(Array.isArray(jsonResponse) ? jsonResponse[0] : jsonResponse));
      
      // If the response is an array, extract the first element
      if (Array.isArray(jsonResponse)) {
        console.log('📊 [DAILY PLANNING DETAILS] Respuesta es un array, extrayendo primer elemento');
        planningData = jsonResponse[0];
      } else {
        planningData = jsonResponse;
      }
      
      console.log('📋 [DAILY PLANNING DETAILS] Datos extraídos, campos disponibles:', Object.keys(planningData));
      console.log('🔎 [CRITICAL FIELDS] Verificando campos críticos:');
      console.log('   - INTENCIÓN PEDAGÓGICA:', planningData['INTENCIÓN PEDAGÓGICA'] ? '✓' : '✗');
      console.log('   - CONTENIDOS PROCEDIMENTALES:', planningData['CONTENIDOS PROCEDIMENTALES'] ? '✓' : '✗');
      console.log('   - MOMENTO DE INICIO:', planningData['MOMENTO DE INICIO'] ? '✓' : '✗');
      console.log('   - MOMENTO DE DESARROLLO:', planningData['MOMENTO DE DESARROLLO'] ? '✓' : '✗');
      console.log('   - MOMENTO DE CIERRE:', planningData['MOMENTO DE CIERRE'] ? '✓' : '✗');
      console.log('📄 [COMPLETE DATA] Objeto completo:', JSON.stringify(planningData, null, 2));
    } catch (parseError) {
      console.error('⚠️ [DAILY PLANNING DETAILS] No se pudo parsear la respuesta como JSON');
      console.error('⚠️ [DAILY PLANNING DETAILS] Respuesta raw:', responseText.substring(0, 500));
      return c.json({ error: "Respuesta del webhook inválida" }, 500);
    }

    console.log('📋 [DAILY PLANNING DETAILS] Detalles completos obtenidos exitosamente');

    return c.json({ 
      success: true, 
      data: planningData
    });
  } catch (error) {
    console.error('❌ [DAILY PLANNING DETAILS] Error al obtener detalles:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener detalles de planificación del webhook" }, 500);
  }
});

// Endpoint to get daily plannings (list view - FLOW 1)
app.post("/api/get-daily-plannings", async (c) => {
  try {
    const body = await c.req.json();
    const userEmail = body.correo || body.email || body.CORREO || body.email_usuario;
    
    if (!userEmail) {
      return c.json({ 
        error: "CORREO es requerido" 
      }, 400);
    }

    console.log('📅 [DAILY PLANNINGS - FLOW 1] Obteniendo lista de planificaciones diarias');
    console.log('  - CORREO:', userEmail);
    
    // FLOW 1: Send only CORREO to get list of daily plannings
    const webhookPayload = {
      CORREO: userEmail
    };
    
    console.log('📤 [DAILY PLANNINGS - FLOW 1] Enviando solo CORREO al webhook');
    console.log('   - Webhook: https://n8n.srv1144975.hstgr.cloud/webhook/02f93829-f2de-4efa-92e2-d9577b1f2b6b');
    console.log('   - Payload: { CORREO: "' + userEmail + '" }');
    
    // Call N8N webhook to get daily plannings list
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/02f93829-f2de-4efa-92e2-d9577b1f2b6b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('✅ [DAILY PLANNINGS] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DAILY PLANNINGS] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [DAILY PLANNINGS] Respuesta recibida (longitud):', responseText.length);

    // Try to parse as JSON
    let dailyPlannings = [];
    let rawResponse = null;
    
    try {
      const jsonResponse = JSON.parse(responseText);
      rawResponse = jsonResponse;
      
      console.log('🔍 [DAILY PLANNINGS] Estructura de respuesta:', Object.keys(jsonResponse));
      console.log('🔍 [DAILY PLANNINGS] Datos completos:', JSON.stringify(jsonResponse, null, 2));
      
      // The webhook might return plannings in different formats
      if (Array.isArray(jsonResponse)) {
        dailyPlannings = jsonResponse;
        console.log('📊 [DAILY PLANNINGS] Respuesta es un array directo');
      } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
        dailyPlannings = jsonResponse.data;
        console.log('📊 [DAILY PLANNINGS] Planificaciones en campo "data"');
      } else if (jsonResponse.plannings && Array.isArray(jsonResponse.plannings)) {
        dailyPlannings = jsonResponse.plannings;
        console.log('📊 [DAILY PLANNINGS] Planificaciones en campo "plannings"');
      } else {
        console.log('⚠️ [DAILY PLANNINGS] Formato de respuesta no reconocido:', jsonResponse);
        // If it's a single object, wrap it in an array
        dailyPlannings = [jsonResponse];
      }
    } catch (parseError) {
      console.error('⚠️ [DAILY PLANNINGS] No se pudo parsear la respuesta como JSON');
      console.error('⚠️ [DAILY PLANNINGS] Respuesta raw:', responseText.substring(0, 500));
    }

    console.log('📋 [DAILY PLANNINGS] Total de planificaciones procesadas:', dailyPlannings.length);
    
    if (dailyPlannings.length > 0) {
      console.log('📝 [DAILY PLANNINGS] Primera planificación completa:', JSON.stringify(dailyPlannings[0], null, 2));
      console.log('📝 [DAILY PLANNINGS] Campos disponibles:', Object.keys(dailyPlannings[0]));
    }

    return c.json({ 
      success: true, 
      data: dailyPlannings,
      raw_response: rawResponse
    });
  } catch (error) {
    console.error('❌ [DAILY PLANNINGS] Error al obtener planificaciones diarias:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener planificaciones diarias del webhook" }, 500);
  }
});

// Endpoint to get daily activities from webhook
app.post("/api/get-daily-activities", async (c) => {
  try {
    const body = await c.req.json();
    const { correo, unit_name, asignatura, grado, INDICADOR_DE_LOGRO } = body;
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    if (!unit_name) {
      return c.json({ error: "unit_name es requerido" }, 400);
    }

    console.log('📚 [GET ACTIVITIES] Obteniendo actividades del webhook');
    console.log('  - Correo:', correo);
    console.log('  - Nombre de unidad:', unit_name);
    console.log('  - Asignatura:', asignatura || '(no especificada)');
    console.log('  - Grado:', grado || '(no especificado)');
    console.log('  - Indicador de Logro:', INDICADOR_DE_LOGRO || '(no especificado)');
    
    const webhookPayload = {
      correo: correo,
      unit_name: unit_name,
      ASIGNATURA: asignatura || '',
      GRADO: grado || '',
      INDICADOR_DE_LOGRO: INDICADOR_DE_LOGRO || ''
    };
    
    console.log('📤 [GET ACTIVITIES] Enviando al webhook N8N:', JSON.stringify(webhookPayload));
    
    // Call N8N webhook to get activities
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/00e6074a-b63f-4769-a991-9671cee8ba24', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('✅ [GET ACTIVITIES] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GET ACTIVITIES] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [GET ACTIVITIES] Respuesta recibida (longitud):', responseText.length);

    // Try to parse as JSON, fallback to empty array
    let activities = [];
    let rawResponse = null;
    
    try {
      const jsonResponse = JSON.parse(responseText);
      rawResponse = jsonResponse;
      
      console.log('🔍 [GET ACTIVITIES] Estructura de respuesta:', Object.keys(jsonResponse));
      
      // The webhook might return activities in different formats
      if (Array.isArray(jsonResponse)) {
        activities = jsonResponse;
        console.log('📊 [GET ACTIVITIES] Respuesta es un array directo');
      } else if (jsonResponse.activities && Array.isArray(jsonResponse.activities)) {
        activities = jsonResponse.activities;
        console.log('📊 [GET ACTIVITIES] Actividades en campo "activities"');
      } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
        activities = jsonResponse.data;
        console.log('📊 [GET ACTIVITIES] Actividades en campo "data"');
      } else if (jsonResponse.RESPUESTA && Array.isArray(jsonResponse.RESPUESTA)) {
        activities = jsonResponse.RESPUESTA;
        console.log('📊 [GET ACTIVITIES] Actividades en campo "RESPUESTA"');
      } else {
        console.log('⚠️ [GET ACTIVITIES] Formato de respuesta no reconocido:', jsonResponse);
      }
    } catch (parseError) {
      console.error('⚠️ [GET ACTIVITIES] No se pudo parsear la respuesta como JSON');
      console.error('⚠️ [GET ACTIVITIES] Respuesta raw:', responseText.substring(0, 200));
    }

    console.log('📋 [GET ACTIVITIES] Total de actividades procesadas:', activities.length);
    
    if (activities.length > 0) {
      console.log('📝 [GET ACTIVITIES] Primera actividad:', JSON.stringify(activities[0]));
    }

    return c.json({ 
      success: true, 
      data: activities,
      raw_response: rawResponse
    });
  } catch (error) {
    console.error('❌ [GET ACTIVITIES] Error al obtener actividades:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener actividades del webhook" }, 500);
  }
});

// Endpoint to save chat response to webhook (DAILY PLANNING)
app.post("/api/save-chat-response", async (c) => {
  try {
    const body = await c.req.json();
    const { correo, unit_id, section_name, message_content, asignatura, tema_del_dia } = body;
    
    if (!correo || !unit_id || !section_name || !message_content) {
      return c.json({ 
        error: "correo, unit_id, section_name y message_content son requeridos" 
      }, 400);
    }

    console.log('💾 [SAVE RESPONSE - DAILY] Guardando respuesta del chat diario');
    console.log('  - Correo:', correo);
    console.log('  - Unidad:', unit_id);
    console.log('  - Sección:', section_name);
    console.log('  - Asignatura:', asignatura || '(no especificada)');
    console.log('  - Tema del Día:', tema_del_dia || '(no especificado)');
    
    // Send to N8N webhook
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/11fc4ef0-c673-4039-b902-c463cef5a725', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo,
        unit_id,
        section_name,
        message_content,
        asignatura: asignatura || '',
        tema_del_dia: tema_del_dia || ''
      }),
    });

    console.log('✅ [SAVE RESPONSE - DAILY] Respuesta del webhook:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SAVE RESPONSE - DAILY] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`
      }, 500);
    }

    await response.text(); // Consume response body
    console.log('🎉 [SAVE RESPONSE - DAILY] Respuesta guardada exitosamente');

    return c.json({ 
      success: true, 
      message: 'Respuesta guardada exitosamente'
    });
  } catch (error) {
    console.error('❌ [SAVE RESPONSE - DAILY] Error al guardar respuesta:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al guardar respuesta" }, 500);
  }
});

// Endpoint to save chat response to webhook (UNIT PLANNING)
app.post("/api/save-unit-chat-response", async (c) => {
  try {
    const body = await c.req.json();
    const { correo, unit_id, section_name, message_content, asignatura } = body;
    
    if (!correo || !unit_id || !section_name || !message_content) {
      return c.json({ 
        error: "correo, unit_id, section_name y message_content son requeridos" 
      }, 400);
    }

    console.log('💾 [SAVE RESPONSE - UNIT] Guardando respuesta del chat de unidad');
    console.log('  - Correo:', correo);
    console.log('  - Unidad:', unit_id);
    console.log('  - Sección:', section_name);
    console.log('  - Asignatura:', asignatura || '(no especificada)');
    
    // Send to N8N webhook for unit planning
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/EDITARPLANIFIACIONUNIDAD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo,
        unit_id,
        section_name,
        message_content,
        asignatura: asignatura || ''
      }),
    });

    console.log('✅ [SAVE RESPONSE - UNIT] Respuesta del webhook:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SAVE RESPONSE - UNIT] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`
      }, 500);
    }

    await response.text(); // Consume response body
    console.log('🎉 [SAVE RESPONSE - UNIT] Respuesta guardada exitosamente');

    return c.json({ 
      success: true, 
      message: 'Respuesta guardada exitosamente'
    });
  } catch (error) {
    console.error('❌ [SAVE RESPONSE - UNIT] Error al guardar respuesta:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al guardar respuesta" }, 500);
  }
});

// Endpoint to get saved chat conversations - NO DATABASE
app.post("/api/get-chat-conversations", async (c) => {
  try {
    const body = await c.req.json();
    const { correo } = body;
    
    if (!correo) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    console.log('📚 [GET CHATS] Base de datos eliminada - no hay conversaciones guardadas');
    
    // Database removed - return empty array
    return c.json({ 
      success: true, 
      data: []
    });
  } catch (error) {
    console.error('❌ [GET CHATS] Error:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener conversaciones" }, 500);
  }
});

// Endpoint to delete unit planning
app.post("/api/delete-unit-planning", async (c) => {
  try {
    const planningData = await c.req.json();
    
    console.log('🗑️ [DELETE UNIT PLANNING] Enviando planificación al webhook de eliminación');
    console.log('  - Datos:', planningData);
    
    // Send the planning data to the delete webhook
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/ELIMINARPLANIFICACIONPORUNIDAD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planningData),
    });

    console.log('✅ [DELETE UNIT PLANNING] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DELETE UNIT PLANNING] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    await response.text(); // Consume response body
    console.log('🎉 [DELETE UNIT PLANNING] Planificación eliminada exitosamente');

    return c.json({ 
      success: true, 
      message: 'Planificación eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ [DELETE UNIT PLANNING] Error al eliminar planificación:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al eliminar planificación" }, 500);
  }
});

// Endpoint to delete daily planning
app.post("/api/delete-daily-planning", async (c) => {
  try {
    const body = await c.req.json();
    const planningId = body.id;
    
    if (!planningId) {
      console.error('❌ [DELETE PLANNING] No se recibió ID de planificación');
      return c.json({ 
        error: "ID de planificación es requerido" 
      }, 400);
    }
    
    // Determine if this is a UUID or composite ID
    const isUUID = planningId.length > 30 && planningId.includes('-');
    
    console.log('🗑️ [DELETE PLANNING] Iniciando eliminación de planificación');
    console.log('  - ID:', planningId);
    console.log('  - Tipo:', isUUID ? 'UUID (nueva planificación)' : 'ID Compuesto (planificación vieja)');
    
    // Send only the ID to the delete webhook
    // The webhook will handle finding and deleting the planning based on this ID
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/ELIMINARPLANIFICACIONDIARIA', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: planningId
      }),
    });

    console.log('✅ [DELETE PLANNING] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DELETE PLANNING] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    await response.text(); // Consume response body
    console.log('🎉 [DELETE PLANNING] Planificación eliminada exitosamente');
    console.log('  - ID eliminado:', planningId);

    return c.json({ 
      success: true, 
      message: 'Planificación eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ [DELETE PLANNING] Error al eliminar planificación:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al eliminar planificación" }, 500);
  }
});

// Endpoint to get all user plannings from dashboard webhook
app.post("/api/get-dashboard-plannings", async (c) => {
  try {
    const body = await c.req.json();
    const userEmail = body.email || body.correo;
    
    if (!userEmail) {
      return c.json({ error: "email es requerido" }, 400);
    }

    console.log('📊 [DASHBOARD] Obteniendo planificaciones del usuario:', userEmail);
    
    // Call the webhook with the user's email
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/b5d1a794-50e1-402d-b03a-624283425719', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail }),
    });

    console.log('✅ [DASHBOARD] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DASHBOARD] Error del webhook:', errorText);
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`,
        details: errorText
      }, 500);
    }

    const responseText = await response.text();
    console.log('📦 [DASHBOARD] Datos recibidos (longitud):', responseText.length);

    // Handle empty responses gracefully
    if (!responseText || responseText.trim() === '') {
      console.log('⚠️ [DASHBOARD] Webhook devolvió respuesta vacía - retornando array vacío');
      return c.json({ 
        success: true, 
        data: []
      });
    }

    // Try to parse as JSON
    let planningsData = [];
    try {
      const jsonResponse = JSON.parse(responseText);
      
      // The webhook might return plannings in different formats
      if (Array.isArray(jsonResponse)) {
        planningsData = jsonResponse;
      } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
        planningsData = jsonResponse.data;
      } else if (jsonResponse.plannings && Array.isArray(jsonResponse.plannings)) {
        planningsData = jsonResponse.plannings;
      } else {
        // If it's a single object, wrap it in an array
        planningsData = [jsonResponse];
      }
    } catch (parseError) {
      console.error('⚠️ [DASHBOARD] No se pudo parsear la respuesta como JSON');
      console.error('⚠️ [DASHBOARD] Respuesta raw:', responseText.substring(0, 500));
      // Return empty array instead of error for graceful degradation
      return c.json({ 
        success: true, 
        data: []
      });
    }

    console.log('📋 [DASHBOARD] Total de planificaciones:', planningsData.length);

    return c.json({ 
      success: true, 
      data: planningsData
    });
  } catch (error) {
    console.error('❌ [DASHBOARD] Error al obtener planificaciones:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener planificaciones del webhook" }, 500);
  }
});

// ==================================================================================
// ENDPOINT: Obtener planificaciones por correo electrónico
// ==================================================================================
// ARQUITECTURA DE DATOS:
// 1. ALMACENAMIENTO (Backup): Guarda inmediatamente los datos del webhook en la base
//    de datos (tabla webhook_backups). Este paso es EXCLUSIVAMENTE para respaldo histórico.
// 2. RENDERIZADO: Devuelve los datos EN VIVO del webhook para visualización en la UI.
// 3. REGLA DE ORO: NO se lee la base de datos para mostrar información en la página.
//    La interfaz se alimenta 100% de los datos en tiempo real del webhook.
// ==================================================================================
app.post("/api/get-plannings-by-email", async (c) => {
  try {
    const body = await c.req.json();
    const userEmail = body.correo;
    
    if (!userEmail) {
      return c.json({ error: "correo es requerido" }, 400);
    }

    console.log('🔵 [WEBHOOK REQUEST] Obteniendo planificaciones del webhook para:', userEmail);
    
    // PASO 1: Obtener datos EN VIVO del webhook N8N
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/b5d1a794-50e1-402d-b03a-624283425719', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        correo: userEmail
      }),
    });

    console.log('✅ [WEBHOOK RESPONSE] Status:', response.status, response.statusText);

    if (!response.ok) {
      return c.json({ 
        error: `Error del webhook: ${response.status} ${response.statusText}`
      }, 500);
    }

    // PASO 2: Procesar respuesta del webhook
    const responseText = await response.text();
    console.log('📦 [WEBHOOK DATA] Datos recibidos, longitud:', responseText.length);

    // Try to parse as JSON, fallback to empty array
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = [];
    }

    // Ensure responseData is an array
    const plannings = Array.isArray(responseData) ? responseData : [responseData];

    console.log('📊 [PLANNINGS] Total de planificaciones recibidas:', plannings.length);

    // NO FILTRAR - el frontend maneja la duplicación por fecha
    // Enviar TODAS las planificaciones del webhook tal como llegan
    console.log('🚀 [RESPONSE] Enviando', plannings.length, 'planificaciones al frontend (sin filtrar)');
    
    return c.json({ 
      success: true, 
      data: plannings
    });
  } catch (error) {
    console.error('❌ [ERROR] Error al obtener planificaciones:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Error al obtener planificaciones del webhook" }, 500);
  }
});

export default app;
