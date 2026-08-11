'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const ZONAS = ['bariloche', 'villa_la_angostura', 'san_martin_de_los_andes', 'otra'];

function useSession() {
  const [session, setSession] = useState(undefined); // undefined = cargando

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return session;
}

function Login() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enviar = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="leph-border rounded-2xl p-6 bg-white/[0.02] text-center">
        <p className="text-sm text-gray-200">
          Te mandamos un link mágico a <span className="text-[var(--leph-gold)]">{email}</span>.
        </p>
        <p className="text-xs text-gray-500 mt-2">Abrilo desde este mismo dispositivo para entrar.</p>
      </div>
    );
  }

  return (
    <div className="leph-border rounded-2xl p-6 bg-white/[0.02]">
      <h2 className="text-lg font-medium mb-2 text-gray-100">Iniciá sesión</h2>
      <p className="text-xs text-gray-500 mb-4">
        Necesario para reportar, corroborar o presentar un descargo. Sin contraseña — te mandamos un link a tu email.
      </p>
      <input
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-black/30 leph-border rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--leph-violet)] mb-3"
      />
      <button
        onClick={enviar}
        disabled={loading || !email}
        className="w-full bg-gradient-to-r from-[var(--leph-gold)] to-[var(--leph-violet)] text-black font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition disabled:opacity-40"
      >
        {loading ? 'Enviando…' : 'Enviarme el link'}
      </button>
      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </div>
  );
}

function SessionBar({ session }) {
  return (
    <div className="flex justify-between items-center text-xs text-gray-500 mb-4 max-w-2xl mx-auto px-1">
      <span>{session.user.email}</span>
      <button
        onClick={() => supabase.auth.signOut()}
        className="hover:text-gray-300 transition"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState('consultar');
  const session = useSession();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-6 text-center">
        <div className="text-3xl font-semibold leph-title mb-1">⟁ Leph · MaatH</div>
        <p className="text-sm text-gray-400">
          Reputación bidireccional para alquileres — inquilinos y propietarios,
          zonas turísticas.
        </p>
      </header>

      {session && <SessionBar session={session} />}

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
      {tab === 'reportar' && (session ? <Reportar /> : <Login />)}
      {tab === 'corroborar' && (session ? <Corroborar /> : <Login />)}
      {tab === 'descargo' && (session ? <Descargo /> : <Login />)}
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

async function subirEvidencia(files) {
  if (!files || files.length === 0) return [];
  const paths = [];
  for (const file of files) {
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('evidencias-maath')
      .upload(path, file);
    if (error) throw new Error('Error subiendo evidencia: ' + error.message);
    paths.push(path);
  }
  return paths;
}

function FileInput({ onChange, files }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-500 mb-1">
        Evidencia (fotos, capturas — opcional)
      </label>
      <input
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={(e) => onChange(Array.from(e.target.files))}
        className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-gray-200 file:text-xs hover:file:bg-white/20"
      />
      {files && files.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{files.length} archivo(s) seleccionado(s)</p>
      )}
    </div>
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
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const enviar = async () => {
    if (!motivo || !descripcion || (!persona && !telefono && !direccion)) {
      setMsg({ estado: 'error', texto: 'Completá motivo, descripción y al menos un dato del reportado.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    try {
      const evidenciaPaths = await subirEvidencia(files);
      const { data, error } = await supabase.rpc('crear_reporte', {
        p_rol: rol,
        p_motivo: motivo,
        p_descripcion: descripcion,
        p_persona: persona || null,
        p_telefono: telefono || null,
        p_direccion: direccion || null,
        p_zona: zona,
        p_evidencia_paths: evidenciaPaths.length > 0 ? evidenciaPaths : null,
      });
      if (error) throw error;
      setMsg({ estado: 'ok', texto: `Reporte creado (id: ${data}).` });
      setMotivo('');
      setDescripcion('');
      setFiles([]);
    } catch (err) {
      setMsg({ estado: 'error', texto: err.message });
    } finally {
      setLoading(false);
    }
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
      <FileInput files={files} onChange={setFiles} />
      <Button onClick={enviar} disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar reporte'}
      </Button>
      <Resultado estado={msg.estado} mensaje={msg.texto} />
    </Card>
  );
}

function Corroborar() {
  const [reporteId, setReporteId] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const enviar = async () => {
    if (!reporteId) {
      setMsg({ estado: 'error', texto: 'Completá el ID del reporte.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    const { error } = await supabase.rpc('corroborar_reporte', {
      p_reporte_id: reporteId,
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
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ estado: '', texto: '' });

  const enviar = async () => {
    if (!reporteId || !texto) {
      setMsg({ estado: 'error', texto: 'Completá el ID del reporte y tu descargo.' });
      return;
    }
    setLoading(true);
    setMsg({ estado: '', texto: '' });
    try {
      const evidenciaPaths = await subirEvidencia(files);
      const { data, error } = await supabase.rpc('presentar_descargo', {
        p_reporte_id: reporteId,
        p_texto: texto,
        p_evidencia_paths: evidenciaPaths.length > 0 ? evidenciaPaths : null,
      });
      if (error) throw error;
      setMsg({ estado: 'ok', texto: `Descargo presentado (id: ${data}).` });
      setTexto('');
      setFiles([]);
    } catch (err) {
      setMsg({ estado: 'error', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-medium mb-4 text-gray-100">Presentar descargo</h2>
      <p className="text-xs text-gray-500 mb-3">
        Si te reportaron y querés dar tu versión antes de que se confirme el reporte.
      </p>
      <Input placeholder="ID del reporte" value={reporteId} onChange={(e) => setReporteId(e.target.value)} />
      <Textarea placeholder="Tu versión de los hechos" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <FileInput files={files} onChange={setFiles} />
      <Button onClick={enviar} disabled={loading}>
        {loading ? 'Enviando…' : 'Presentar descargo'}
      </Button>
      <Resultado estado={msg.estado} mensaje={msg.texto} />
    </Card>
  );
}
