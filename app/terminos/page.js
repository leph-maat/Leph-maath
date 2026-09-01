export const metadata = {
  title: "Términos de Uso y Privacidad — Leph · MaatH",
  description:
    "Términos de uso y política de privacidad de Leph · MaatH.",
};

export default function TerminosPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 relative z-10 text-gray-200">
      <header className="mb-8 text-center">
        <div className="text-3xl font-semibold leph-title mb-1">
          ⟁ Términos de Uso y Privacidad
        </div>
        <p className="text-xs text-gray-500">
          Última actualización: [completar fecha]
        </p>
      </header>

      <p className="text-xs text-gray-500 mb-6 italic">
        Este documento es un punto de partida redactado para uso general. No
        reemplaza el asesoramiento de un abogado, especialmente por tratarse
        de una plataforma que aloja denuncias sobre terceros.
      </p>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          1. Qué es Leph · MaatH
        </h2>
        <p className="text-sm text-gray-300">
          Leph · MaatH ("la Plataforma") permite a usuarios consultar,
          reportar, corroborar y presentar descargos sobre experiencias de
          alquiler en zonas turísticas de Argentina. No es un organismo
          oficial, no reemplaza canales legales o policiales, y no garantiza
          la veracidad de los reportes cargados por los usuarios.
        </p>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          2. Naturaleza de los reportes
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>
            Los reportes son declaraciones de usuarios individuales, basadas
            en su experiencia personal.
          </li>
          <li>
            La Plataforma no verifica de forma independiente la veracidad de
            cada reporte antes de publicarlo.
          </li>
          <li>
            Quien reporta es responsable de la veracidad de lo declarado.
            Reportes falsos pueden constituir difamación o calumnia, y quien
            los publique asume esa responsabilidad personalmente.
          </li>
          <li>
            La Plataforma puede eliminar reportes manifiestamente falsos,
            difamatorios o que violen estos términos.
          </li>
        </ul>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          3. Derecho a réplica
        </h2>
        <p className="text-sm text-gray-300">
          Toda persona reportada puede presentar un descargo con su versión
          de los hechos, visible junto al reporte original.
        </p>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          4. Datos personales
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>
            Datos identificatorios (nombre, teléfono, dirección) se
            almacenan mediante hash criptográfico, no en texto plano.
          </li>
          <li>
            El email de cuenta se usa exclusivamente para autenticación y
            comunicación del servicio.
          </li>
          <li>
            No compartimos datos personales con terceros salvo requerimiento
            legal de autoridad competente.
          </li>
          <li>
            Podés solicitar la eliminación de tus datos escribiendo a{" "}
            <a
              href="mailto:lephbrc@gmail.com"
              className="text-[var(--leph-violet)] hover:underline"
            >
              lephbrc@gmail.com
            </a>
            , sujeto a excepciones necesarias para mantener la integridad de
            reportes ya corroborados.
          </li>
        </ul>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          5. Evidencia adjunta
        </h2>
        <p className="text-sm text-gray-300">
          Los archivos que se adjuntan a reportes o descargos se almacenan en
          un espacio privado. Quien sube evidencia declara tener derecho a
          hacerlo y que el contenido es genuino.
        </p>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          6. Pagos y planes
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>
            Procesados mediante Mercado Pago. No almacenamos datos de
            tarjetas.
          </li>
          <li>
            Informe Único: acceso completo por 24hs desde la confirmación
            del pago. Plan Pro: renovación mensual, acceso ilimitado
            mientras esté activo.
          </li>
          <li>
            No se realizan reembolsos una vez confirmado el pago, salvo
            error verificable del sistema.
          </li>
        </ul>
      </section>

      <section className="leph-glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-2 text-gray-100">
          7. Limitación de responsabilidad
        </h2>
        <p className="text-sm text-gray-300">
          La Plataforma no garantiza exactitud ni actualidad de los reportes,
          y no es responsable por decisiones que un usuario tome basándose
          en información consultada aquí. Usar la información para
          hostigar, discriminar o dañar a terceros está prohibido y puede
          resultar en suspensión de cuenta.
        </p>
      </section>

      <p className="text-xs text-gray-500 text-center">
        ¿Consultas sobre estos términos? Escribinos a{" "}
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

