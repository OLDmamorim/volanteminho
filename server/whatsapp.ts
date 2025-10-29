/**
 * WhatsApp notification helper using Twilio
 * Requires environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
 */

interface WhatsAppMessage {
  to: string; // Format: +351912345678
  message: string;
}

export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Twilio sandbox default

  if (!accountSid || !authToken) {
    console.warn("[WhatsApp] Twilio credentials not configured. Skipping message.");
    return false;
  }

  try {
    // Format phone number for WhatsApp
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const body = new URLSearchParams({
      From: formattedFrom,
      To: formattedTo,
      Body: message,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp] Failed to send message:", error);
      return false;
    }

    const result = await response.json();
    console.log("[WhatsApp] Message sent successfully:", result.sid);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return false;
  }
}

/**
 * Message templates for different notification types
 */
export function getWhatsAppTemplate(
  tipo: "novo_pedido" | "pedido_aprovado" | "pedido_rejeitado" | "pedido_confirmado" | "pedido_cancelado",
  data: {
    lojaNome: string;
    tipo: string;
    dataInicio: string;
    descricao?: string;
    observacoes?: string;
    portalUrl: string;
  }
): string {
  const templates = {
    novo_pedido: `🔔 *Novo Pedido de Apoio*

Loja: ${data.lojaNome}
Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.descricao ? `Descrição: ${data.descricao}` : ""}

👉 Aceder ao portal: ${data.portalUrl}`,

    pedido_aprovado: `✅ *Pedido Aprovado pelo Admin*

Loja: ${data.lojaNome}
Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Observações: ${data.observacoes}` : ""}

Por favor confirme ou cancele este pedido no portal.

👉 Aceder ao portal: ${data.portalUrl}`,

    pedido_rejeitado: `❌ *Pedido Rejeitado*

Loja: ${data.lojaNome}
Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Motivo: ${data.observacoes}` : ""}

Para mais informações, aceda ao portal.

👉 ${data.portalUrl}`,

    pedido_confirmado: `✅ *Pedido Confirmado*

O seu pedido de apoio foi confirmado!

Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Observações: ${data.observacoes}` : ""}

👉 Ver detalhes: ${data.portalUrl}`,

    pedido_cancelado: `⚠️ *Pedido Cancelado*

O seu pedido de apoio foi cancelado.

Tipo: ${data.tipo}
Data: ${data.dataInicio}
${data.observacoes ? `Motivo: ${data.observacoes}` : ""}

👉 Ver detalhes: ${data.portalUrl}`,
  };

  return templates[tipo];
}
