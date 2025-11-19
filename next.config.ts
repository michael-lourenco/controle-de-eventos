import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurar pacotes que devem ser tratados como externos no servidor
  // Isso evita que o webpack/Turbopack tente processá-los no cliente
  serverExternalPackages: [
    'googleapis',
    'google-auth-library',
    'gcp-metadata',
  ],
  webpack: (config, { isServer }) => {
    // Configurar para não fazer bundle de módulos Node.js no cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        os: false,
        path: false,
        https: false,
        http: false,
        buffer: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
      };
      
      // Garantir que googleapis e dependências sejam externos no cliente
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          'googleapis',
          'google-auth-library',
          'gcp-metadata'
        );
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          'googleapis',
          'google-auth-library',
          'gcp-metadata'
        ];
      } else {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
          'googleapis',
          'google-auth-library',
          'gcp-metadata'
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
