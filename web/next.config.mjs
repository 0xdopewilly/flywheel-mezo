/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mezo Passport -> orangekit ships some packages as untranspiled TypeScript.
  transpilePackages: ["@mezo-org/passport", "@mezo-org/orangekit", "@mezo-org/orangekit-smart-account", "@mezo-org/orangekit-contracts"],
  webpack: (config, { isServer }) => {
    // The wallet stack only renders in the browser (/app loads it with ssr: false). On the server,
    // wagmi's Base Account connector pulls in the Coinbase CDP SDK and its optional x402 peers, which
    // are not installed. Stub them out of the server bundle.
    if (isServer) {
      config.resolve.alias = { ...config.resolve.alias, "@coinbase/cdp-sdk": false };
    }
    // MetaMask SDK optionally imports a React Native module.
    config.resolve.alias = { ...config.resolve.alias, "@react-native-async-storage/async-storage": false };
    config.externals = [...(Array.isArray(config.externals) ? config.externals : []), "pino-pretty", "lokijs", "encoding"];
    return config;
  },
};
export default nextConfig;
