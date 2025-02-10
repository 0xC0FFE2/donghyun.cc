import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nanu.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'donghyun.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'donghyuncc-cloudfront-aws.ncloud.sbs',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['@uiw/react-markdown-preview', '@uiw/react-md-editor'],
};

module.exports = nextConfig;
