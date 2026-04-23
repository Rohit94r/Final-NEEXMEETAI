import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.neexmeet.com",
          },
        ],
        destination: "https://neexmeet.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
