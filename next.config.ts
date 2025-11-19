import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurar pacotes que devem ser tratados como externos no servidor
  // Isso evita que o webpack tente processá-los no cliente
  serverExternalPackages: [
    'googleapis',
    'google-auth-library',
    'gcp-metadata',
    'gtoken',
    'googleapis-common',
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
        http2: false,
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
          'gcp-metadata',
          'gtoken',
          'googleapis-common'
        );
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          'googleapis',
          'google-auth-library',
          'gcp-metadata',
          'gtoken',
          'googleapis-common'
        ];
      } else {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
          'googleapis',
          'google-auth-library',
          'gcp-metadata',
          'gtoken',
          'googleapis-common'
        ];
      }
    } else {
      // No servidor, também marcar como externos para evitar problemas
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          'googleapis',
          'google-auth-library',
          'gcp-metadata',
          'gtoken',
          'googleapis-common'
        );
      }
    }
    return config;
  },
};

export default nextConfig;
