import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ecommerce-api-psp9.onrender.com',
        port: '',
        pathname: '/**',
      },
      {
	protocol: 'https',
	hostname: 'api.wizzzey.com',
	port: '',
	pathname: '/**'	
      }
    ],
  },
};

export default nextConfig;
