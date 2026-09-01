'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SiteHeader() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full border-b leph-border">
      <nav className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-200 hover:text-white transition">
          ⟁ Leph · MaatH
        </Link>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/como-funciona" className="hover:text-gray-200 transition">
            Cómo funciona
          </Link>
          <Link href="/terminos" className="hover:text-gray-200 transition">
            Términos
          </Link>

          {loading ? null : session ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1.5 rounded-full leph-border text-gray-200 hover:text-white transition"
              title="Cerrar sesión"
            >
              {session.user.email}
            </button>
          ) : (
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--leph-gold)] to-[var(--leph-violet)] text-black font-medium hover:opacity-90 transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

