/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "img.youtube.com",
      "drive.google.com",
    ],
  },
};

export default nextConfig;
