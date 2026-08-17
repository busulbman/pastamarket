/** @type {import('next').NextConfig} */

const nextConfig = {
  // better-sqlite3 native bir modüldür; bundle edilmeden Node tarafında çalışır.
  // JSON modunda hiç kullanılmadığı için harici listeye de alınmaz.
  // better-sqlite3 lib/db.ts içinde createRequire ile çalışma zamanında
  // yüklenir; webpack onu hiç görmediği için harici listeye gerek yoktur.
  serverExternalPackages: [],

  // Görseller tamamen yereldir (public/images, public/uploads).
  // Dış kaynak (Unsplash vb.) kullanılmadığı için remotePatterns tanımı yoktur.

};

export default nextConfig;
