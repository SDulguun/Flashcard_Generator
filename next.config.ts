import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have types
import withPWA from "next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withNextIntl(withPWAConfig(nextConfig));
