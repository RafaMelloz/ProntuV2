/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com', // Apenas o hostname
                pathname: '/**' // Permite todas as paths
            }
        ]
    },
    async headers() {
        return [
            {
                source: '/api/feedback', // Aplica as regras para todas as rotas de API
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: process.env.LANDING_URL
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,HEAD,POST', // Métodos permitidos
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization', // Cabeçalhos permitidos
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true', // Permite envio de cookies e credenciais
                    }
                ],
            },
        ];
    },
};

export default nextConfig;
