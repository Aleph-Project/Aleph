const path = require('path');
/** @type {import('next').NextConfig} */
module.exports = {
  // output: 'export',
  ssr: true,
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  webpack: (config, { isServer }) => {
    // Agregar aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks')
    };
    
    return config;
  },

  async rewrites() {
    return [
      // Excluye explícitamente las rutas de NextAuth del rewrite
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*', // No reescribe, deja que Next.js maneje internamente
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
}
