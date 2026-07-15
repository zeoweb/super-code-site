/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Разрешаем картинки/превью с Bunny CDN. При необходимости добавьте свои домены.
    remotePatterns: [
      { protocol: "https", hostname: "**.b-cdn.net" },
      { protocol: "https", hostname: "**.mediadelivery.net" },
    ],
  },
};

export default nextConfig;
