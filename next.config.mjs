/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.BASE_PATH,
  env: {
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
