import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["sibche.com", "www.webpouya.com", "http://localhost:8000"],
  },
  env: {
    GOLANG_API_URL: process.env.GOLANG_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;
