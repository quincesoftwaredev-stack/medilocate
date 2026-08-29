/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**'
      },

      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**'
      },
       {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**'
      }
    ]
  },
  async rewrites () {
    return [
      {
        source: '/robots.txt',
        destination: '/api/text/robots'
      },
      {
        source: '/sitemap.xml',
        destination: '/api/text/sitemap'
      }
    ]
  },
  async redirects () {
    return [
      { source: '/checkout/address', destination: '/checkout', permanent: false },
      { source: '/dashobard', destination: '/user', permanent: false },
      { source: '/medicines/prescription', destination: '/prescription', permanent: false },
      { source: '/prescriptions', destination: '/prescription', permanent: false },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/profile', destination: '/login', permanent: false },
      { source: '/profile/addresses', destination: '/login', permanent: false },
      { source: '/profile/edit', destination: '/login', permanent: false },
      { source: '/profile/settings', destination: '/login', permanent: false },
      { source: '/shop', destination: '/medicines', permanent: false },
      { source: '/specialties', destination: '/doctors', permanent: false },
      { source: '/terms-and-conditions', destination: '/terms', permanent: true },
      { source: '/product/:slug', destination: '/medicines', permanent: false },
      { source: '/order/:id', destination: '/orders/:id', permanent: false },
      { source: '/admin/order', destination: '/admin/orders', permanent: false },
      { source: '/admin/users', destination: '/admin/user', permanent: false },
      { source: '/admin/category/create', destination: '/admin/department/create', permanent: false }
    ]
  }
}

module.exports = nextConfig
