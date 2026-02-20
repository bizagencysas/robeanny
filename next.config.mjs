/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "robeanny.me",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

// PWA config wrapper if next-pwa is loaded successfully
let config = nextConfig;

try {
  const withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
  });
  config = withPWA(nextConfig);
} catch (e) {
  console.log("PWA module not found. Building without PWA support temporarily.");
}

export default config;
