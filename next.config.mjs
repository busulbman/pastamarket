/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: "export"` kaldırıldı: panel ve API route'ları Node.js runtime ister.
  images: { unoptimized: true },
};

export default nextConfig;
