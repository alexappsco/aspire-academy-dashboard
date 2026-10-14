import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Self-hosted in Docker: the Dockerfile copies .next/standalone into the runtime image.
  output: 'standalone',
};

export default withNextIntl(nextConfig);
