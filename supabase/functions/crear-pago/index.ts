import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PRECIOS: Record<string, { monto: number; titulo: string }> = {
  informe_unico: { monto: 3000, titulo: "Leph MaatH - Informe unico" },
  pro_mensual: { monto: 6000, titulo: "Leph MaatH - Plan Pro (mensual)" },
};

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    let plan = "pro_mensual";
    try {
      const body = await req.json();
      if (body?.plan && PRECIOS[body.plan]) plan = body.plan;
    } catch (_) {
      // sin body -> default pro_mensual
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }
    const userId = userData.user.id;
    const userEmail = userData.user.email;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: token, error: tokenError } = await adminClient.rpc("obtener_token_mp");
    if (tokenError || !token) {
      return new Response(JSON.stringify({ error: "Error de configuracion de pagos" }), { status: 500 });
    }

    const siteUrl = "https://leph-maath.vercel.app";
    const { monto, titulo } = PRECIOS[plan];

    const preferenceRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: titulo,
            quantity: 1,
            unit_price: monto,
            currency_id: "ARS",
          },
        ],
        payer: { email: userEmail },
        external_reference: `${userId}:${plan}`,
        back_urls: {
          success: siteUrl,
          failure: siteUrl,
          pending: siteUrl,
        },
        auto_return: "approved",
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/pago-webhook`,
      }),
    });

    const preference = await preferenceRes.json();

    if (!preferenceRes.ok) {
      return new Response(JSON.stringify({ error: "Error creando preferencia", detalle: preference }), { status: 500 });
    }

    return new Response(JSON.stringify({ init_point: preference.init_point }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
