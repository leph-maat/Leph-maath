// supabase/functions/webhook-pago/index.ts
// Mercado Pago llama a esta URL cuando el estado de un pago cambia.
// Si el pago está aprobado, activa la cuenta del usuario (marcar_pago).

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (topic !== 'payment' || !id) {
      return new Response('ok', { status: 200 });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: accessToken } = await admin.rpc('_leer_token_mp');

    const pagoResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const pago = await pagoResponse.json();

    if (pago.status === 'approved' && pago.external_reference) {
      await admin.rpc('marcar_pago', { p_user_id: pago.external_reference });
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('error', { status: 500 });
  }
});
