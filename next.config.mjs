/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com', // Apenas o hostname
                pathname: '/**' // Adiciona isso para permitir todas as paths
            }
        ]
    }
};

export default nextConfig;
