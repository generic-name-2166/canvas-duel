const basePath = "/canvas-duel";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  output: "export",
  reactStrictMode: true,
  basePath,
};

export default nextConfig;
