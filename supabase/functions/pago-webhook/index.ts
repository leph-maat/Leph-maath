import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");

    if (topic && topic !== "payment") {
      return new Response("ok", { status: 200 });
    }
    if (!paymentId) {
      return new Response("sin id", { status: 200 });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: token } = await adminClient.rpc("obtener_token_mp");
    if (!token) {
      return new Response("sin token", { status: 500 });
    }

    // Nunca confiamos en el body de la notificacion: consultamos el pago
    // real a la API de Mercado Pago.
    const pagoRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const pago = await pagoRes.json();

    if (pagoRes.ok && pago.status === "approved" && pago.external_reference) {
      const [userId, plan] = String(pago.external_reference).split(":");
      const { error } = await adminClient.rpc("marcar_pago", {
        p_user_id: userId,
        p_plan: plan || "pro_mensual",
      });
      if (error) {
        console.error("Error marcando pago:", error);
        return new Response("error interno", { status: 500 });
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
});
