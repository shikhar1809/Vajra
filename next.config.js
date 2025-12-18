/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['trhfokxznsqlfiskhmxe.supabase.co'],
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
