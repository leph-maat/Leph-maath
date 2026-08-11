'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const ZONAS = ['bariloche', 'villa_la_angostura', 'san_martin_de_los_andes', 'otra'];

export default function Home() {
  const [tab, setTab] = useState('consultar');

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-10 text-center">
        <div className="text-3xl font-semibold leph-title mb-1">⟁ Leph · MaatH</div>
        <p className="text-sm text-gray-400">
          Reputación bidireccional para alquileres — inquilinos y propietarios,
          zonas turísticas.
        </p>
      </header>

      <nav className="flex gap-2 mb-8 justify-center flex-wrap">
        {[
          ['consultar', 'Consultar'],
          ['reportar', 'Reportar'],
          ['corroborar', 'Corroborar'],
          ['descargo', 'Descargo'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm transition leph-border ${
              tab === key
                ? 'bg-[var(--leph-violet)]/20 text-white leph-glow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'consultar' && <Consultar />}
      {tab === 'reportar' && <Reportar />}
      {tab === 'corroborar' && <Corroborar />}
      {tab === 'descargo' && <Descargo />}
    </main>
  );
}

function Card({ children }) {
  return (
    <div className="leph-border rounded-2xl p-6 bg-white/[0.02] backdrop-blur">
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-black/30 leph-border rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--leph-violet)] mb-3"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full bg-black/30 leph-border rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--leph-violet)] mb-3 min-h-[100px]"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-black/30 leph-border rounded-lg px-3 py-2 text-sm text-gray-100 mb-3"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-gradient-to-r from-[var(--leph-gold)] to-[var(--leph-violet)] text-black font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Resultado({ estado, mensaje }) {
  if (!mensaje) return null;
  const color =
    estado === 'error' ? 'text-red-400' : estado === 'ok' ? 'text-emerald-400' : 'text-gray-400';
  return <p className={`text-sm mt-3 ${color}`}>{mensaje}</p>;
}

function Consultar() {
  const [persona, setPersona] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zona, setZona] = useState('');
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const buscar = async () => {
    if (!persona && !telefono && !direccion) {
      setMsg({ estado: 'error', texto: 'Ingresá al menos un dato para buscar.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    const { data, error } = await supabase.rpc('consultar_reporte', {
      p_persona: persona || null,
      p_telefono: telefono || null,
      p_direccion: direccion || null,
      p_zona: zona || null,
    });
    setLoading(false);
    if (error) {
      setMsg({ estado: 'error', texto: 'Error al consultar: ' + error.message });
      return;
    }
    setResultados(data);
    if (data.length === 0) {
      setMsg({ estado: 'info', texto: 'Sin reportes encontrados para esos datos.' });
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-medium mb-4 text-gray-100">Consultar reputación</h2>
      <Input placeholder="Nombre completo (opcional)" value={persona} onChange={(e) => setPersona(e.target.value)} />
      <Input placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      <Input placeholder="Dirección (opcional)" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      <Select value={zona} onChange={(e) => setZona(e.target.value)} options={['', ...ZONAS]} />
      <Button onClick={buscar} disabled={loading}>
        {loading ? 'Buscando…' : 'Buscar'}
      </Button>
      <Resultado estado={msg.estado} mensaje={msg.texto} />

      {resultados && resultados.length > 0 && (
        <div className="mt-5 space-y-3">
          {resultados.map((r) => (
            <div key={r.id} className="leph-border rounded-lg p-3 bg-black/20">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="uppercase tracking-wide">{r.rol}</span>
                <span
                  className={
                    r.estado === 'verificado'
                      ? 'text-emerald-400'
                      : r.estado === 'en_disputa'
                      ? 'text-amber-400'
                      : 'text-gray-400'
                  }
                >
                  {r.estado} · {r.corroboraciones} corrob.
                </span>
              </div>
              <p className="text-sm text-gray-200 font-medium">{r.motivo}</p>
              <p className="text-sm text-gray-400">{r.descripcion}</p>
              <p className="text-xs text-gray-500 mt-1">{r.zona} · id: {r.id}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Reportar() {
  const [rol, setRol] = useState('inquilino');
  const [persona, setPersona] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zona, setZona] = useState('bariloche');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [reportanteId, setReportanteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const enviar = async () => {
    if (!motivo || !descripcion || !reportanteId || (!persona && !telefono && !direccion)) {
      setMsg({ estado: 'error', texto: 'Completá motivo, descripción, tu identificador y al menos un dato del reportado.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    const { data, error } = await supabase.rpc('crear_reporte', {
      p_rol: rol,
      p_motivo: motivo,
      p_descripcion: descripcion,
      p_reportante_id: reportanteId,
      p_persona: persona || null,
      p_telefono: telefono || null,
      p_direccion: direccion || null,
      p_zona: zona,
    });
    setLoading(false);
    if (error) {
      setMsg({ estado: 'error', texto: 'Error al reportar: ' + error.message });
      return;
    }
    setMsg({ estado: 'ok', texto: `Reporte creado (id: ${data}).` });
    setMotivo('');
    setDescripcion('');
  };

  return (
    <Card>
      <h2 className="text-lg font-medium mb-4 text-gray-100">Crear reporte</h2>
      <Select value={rol} onChange={(e) => setRol(e.target.value)} options={['inquilino', 'propietario', 'inmobiliaria']} />
      <Input placeholder="Nombre completo del reportado (opcional)" value={persona} onChange={(e) => setPersona(e.target.value)} />
      <Input placeholder="Teléfono del reportado (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      <Input placeholder="Dirección/propiedad (opcional)" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      <Select value={zona} onChange={(e) => setZona(e.target.value)} options={ZONAS} />
      <Input placeholder="Motivo (corto, ej: no devolvió depósito)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      <Textarea placeholder="Descripción detallada" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <Input placeholder="Tu identificador (email o teléfono, se hashea)" value={reportanteId} onChange={(e) => setReportanteId(e.target.value)} />
      <Button onClick={enviar} disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar reporte'}
      </Button>
      <Resultado estado={msg.estado} mensaje={msg.texto} />
    </Card>
  );
}

function Corroborar() {
  const [reporteId, setReporteId] = useState('');
  const [reportanteId, setReportanteId] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const enviar = async () => {
    if (!reporteId || !reportanteId) {
      setMsg({ estado: 'error', texto: 'Completá el ID del reporte y tu identificador.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    const { error } = await supabase.rpc('corroborar_reporte', {
      p_reporte_id: reporteId,
      p_reportante_id: reportanteId,
      p_comentario: comentario || null,
    });
    setLoading(false);
    if (error) {
      setMsg({ estado: 'error', texto: 'Error: ' + error.message });
      return;
    }
    setMsg({ estado: 'ok', texto: 'Corroboración registrada.' });
    setComentario('');
  };

  return (
    <Card>
      <h2 className="text-lg font-medium mb-4 text-gray-100">Corroborar un reporte</h2>
      <Input placeholder="ID del reporte" value={reporteId} onChange={(e) => setReporteId(e.target.value)} />
      <Input placeholder="Tu identificador (se hashea)" value={reportanteId} onChange={(e) => setReportanteId(e.target.value)} />
      <Textarea placeholder="Comentario adicional (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
      <Button onClick={enviar} disabled={loading}>
        {loading ? 'Enviando…' : 'Corroborar'}
      </Button>
      <Resultado estado={msg.estado} mensaje={msg.texto} />
    </Card>
  );
}

function Descargo() {
  const [reporteId, setReporteId] = useState('');
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const enviar = async () => {
    if (!reporteId || !texto) {
      setMsg({ estado: 'error', texto: 'Completá el ID del reporte y tu descargo.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    const { data, error } = await supabase.rpc('presentar_descargo', {
      p_reporte_id: reporteId,
      p_texto: texto,
    });
    setLoading(false);
    if (error) {
      setMsg({ estado: 'error', texto: 'Error: ' + error.message });
      return;
    }
    setMsg({ estado: 'ok', texto: `Descargo presentado (id: ${data}).` });
    setTexto('');
  };

  return (
    <Card>
      <h2 className="text-lg font-medium mb-4 text-gray-100">Presentar descargo</h2>
      <p className="text-xs text-gray-500 mb-3">
        Si te reportaron y querés dar tu versión antes de que se confirme el reporte.
      </p>
      <Input placeholder="ID del reporte" value={reporteId} onChange={(e) => setReporteId(e.target.value)} />
      <Textarea placeholder="Tu versión de los hechos" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <Button onClick={enviar} disabled={loading}>
        {loading ? 'Enviando…' : 'Presentar descargo'}
      </Button>
      <Resultado estado={msg.estado} mensaje={msg.texto} />
    </Card>
  );
}
