/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: __dirname,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'trhfokxznsqlfiskhmxe.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(glb|gltf)$/,
            type: 'asset/resource',
        });

        // Handle texture images separately from Next.js image optimization
        config.module.rules.push({
            test: /lanyard\.png$/,
            type: 'asset/resource',
        });

        return config;
    },
}

module.exports = nextConfig
