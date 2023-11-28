import { withAxiom } from 'next-axiom';
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = withAxiom({
  reactStrictMode: true,
  images: {
    domains: ["images.clerk.dev"],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
});

export default config;
