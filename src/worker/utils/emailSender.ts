/**
 * Send verification code email via webhook
 * This keeps the external email sending logic but removes user storage dependency
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    console.log('📧 [EMAIL] Enviando código de verificación a:', email);
    console.log('🔢 [EMAIL] Código:', code);
    
    const webhookPayload = { 
      correo: email,
      code: code 
    };
    
    console.log('📤 [EMAIL] Payload al webhook:', JSON.stringify(webhookPayload));
    
    const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/c9b76bb4-71d3-47ea-b231-a99b6e2c3937', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('📥 [EMAIL] Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [EMAIL] Error del webhook de email:', response.status);
      console.error('❌ [EMAIL] Detalles:', errorText);
      return false;
    }

    const responseText = await response.text();
    console.log('✅ [EMAIL] Código enviado exitosamente');
    console.log('📄 [EMAIL] Respuesta:', responseText.substring(0, 200));
    return true;
  } catch (error) {
    console.error('❌ [EMAIL] Error al enviar código:', error);
    return false;
  }
}
