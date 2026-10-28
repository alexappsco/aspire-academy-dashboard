import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

function resolveApiOrigin(): string {
  const hostApi = process.env.NEXT_PUBLIC_HOST_API;
  if (!hostApi) return 'https://api-staging.aspirekwt.com';
  try {
    return new URL(hostApi).origin;
  } catch {
    return 'https://api-staging.aspirekwt.com';
  }
}

const nextConfig: NextConfig = {
  // Self-hosted in Docker: the Dockerfile copies .next/standalone into the runtime image.
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  /**
   * Same-origin proxy for SignalR hubs.
   * Browser calls to api-staging /hubs are blocked by CORS; proxying via Next avoids that.
   */
  async rewrites() {
    const apiOrigin = resolveApiOrigin();
    return [
      {
        source: '/hubs/:path*',
        destination: `${apiOrigin}/hubs/:path*`,
      },
      // Safety net if a locale-prefixed hub request still slips through.
      {
        source: '/:locale(en|ar)/hubs/:path*',
        destination: `${apiOrigin}/hubs/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
