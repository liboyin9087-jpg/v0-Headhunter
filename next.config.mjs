/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['v0headhun3763.builtwithrocket.new'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
