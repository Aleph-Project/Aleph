/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Configura el proxy para redirigir las peticiones API al API Gateway
 async rewrites() {
    return [
      // Excluye explícitamente las rutas de NextAuth del rewrite
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*', // No reescribe, deja que Next.js maneje internamente
      },
      {
        source: '/api/:path*',
        destination: 'http://apigateway:8080/api/:path*',
      },
      // Ruta alternativa para evitar bloqueos por extensiones
      {
        source: '/_data/:path*',
        destination: 'http://songs-ms:3001/api/:path*',
      },
    ];
  },
}

export default nextConfig