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
    // Usar el nombre del servicio en lugar de la IP directa
    return [
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