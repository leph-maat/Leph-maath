import './globals.css';

export const metadata = {
  title: 'Leph · MaatH',
  description: 'Reputación bidireccional para alquileres en zonas turísticas',
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#0a0a0f] text-gray-200 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
