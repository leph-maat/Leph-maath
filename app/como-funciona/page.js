export const metadata = {
  title: "Cómo funciona — Leph · MaatH",
  description: "Guía de uso de Leph · MaatH: consultar, reportar, corroborar y presentar descargos.",
};

export default function ComoFuncionaPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 relative z-10 text-gray-200">
      <header className="mb-8 text-center">
        <div className="text-3xl font-semibold leph-title mb-1">⟁ Cómo funciona</div>
        <p className="text-sm text-gray-400">
          Guía rápida de Leph · MaatH — reputación bidireccional para alquileres.
        </p>
      </header>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          1. Consultar reputación (gratis, sin registro)
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>Buscá por nombre, teléfono o dirección.</li>
          <li>3 consultas gratis por dispositivo.</li>
          <li>
            Al agotarlas: Informe Único ($5.000 ARS / 24hs) o Plan Pro
            ($12.000 ARS por mes, ilimitado).
          </li>
          <li>
            El resultado muestra reputación general (⟁ 0–5), reportes,
            estado (pendiente / verificado / en disputa / descartado) y
            corroboraciones.
          </li>
        </ul>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          2. Reportar (requiere cuenta)
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>Iniciá sesión con magic link (sin contraseña).</li>
          <li>7 días de trial gratis desde tu primer login.</li>
          <li>
            Completás rol, motivo, descripción, zona y podés adjuntar{" "}
            <strong>evidencia opcional</strong> (fotos o PDF).
          </li>
          <li>
            El reporte queda "pendiente" hasta sumar 2+ corroboraciones
            (pasa a "verificado") o recibir un descargo (puede pasar a "en
            disputa").
          </li>
        </ul>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          3. Corroborar
        </h2>
        <p className="text-sm text-gray-300">
          Si viviste algo similar con la misma persona, corroborá el reporte
          con tu propio comentario. Dos o más corroboraciones marcan el
          reporte como verificado.
        </p>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          4. Descargo
        </h2>
        <p className="text-sm text-gray-300">
          Si te reportaron y no estás de acuerdo, presentá tu versión de los
          hechos, con evidencia propia si querés. Queda visible junto al
          reporte.
        </p>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          5. Privacidad de los datos
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>
            Ningún dato personal se guarda en texto plano — se protege con
            hash criptográfico.
          </li>
          <li>No hay listados públicos ni buscadores masivos de personas.</li>
          <li>
            La evidencia adjunta se guarda en un espacio privado, solo para
            usuarios autenticados con permiso.
          </li>
        </ul>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">6. Pagos</h2>
        <p className="text-sm text-gray-300">
          Procesados con Mercado Pago (Checkout Pro). La activación de tu
          plan es automática apenas se confirma el pago.
        </p>
      </section>

      <p className="text-xs text-gray-500 text-center">
        ¿Dudas o problemas? Escribinos a{" "}
        <a
          href="mailto:lephbrc@gmail.com"
          className="text-[var(--leph-violet)] hover:underline"
        >
          lephbrc@gmail.com
        </a>
        .
      </p>
    </main>
  );
}

