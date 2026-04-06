/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    stripe_public_key: process.env.STRIPE_PUBLIC_KEY,
  },
  images: {
    domains: [
      "hostaway-platform.s3.us-west-2.amazonaws.com",
      "images.unsplash.com",
    ],
  },
};
