/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 native bir modüldür; bundle edilmeden Node tarafında çalışmalıdır.
  serverExternalPackages: ["better-sqlite3"],
  // Görseller tamamen yereldir (public/images, public/uploads).
  // Dış kaynak (Unsplash vb.) kullanılmadığı için remotePatterns tanımı yoktur.
};

export default nextConfig;
