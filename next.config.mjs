/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/pema",
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
