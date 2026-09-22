import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/v1/storage/**',
      },
    ],
    // The backend (API_URL) runs on localhost in dev — Next 16 otherwise
    // blocks optimizing images from local IPs by default (SSRF hardening).
    // Harmless here: remotePatterns above already restricts this to the
    // backend's own storage-stream path, and a real prod API_URL won't be
    // "localhost" so this has no effect there.
    dangerouslyAllowLocalIP: true,
  },
}

export default nextConfig
