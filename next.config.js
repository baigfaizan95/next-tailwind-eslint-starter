const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
const nextRuntimeDotenv = require("next-runtime-dotenv");
const path = require("path");
const withConfig = nextRuntimeDotenv();
const optimizedImages = require("next-optimized-images");
const withFonts = require("next-fonts");
const Dotenv = require("dotenv-webpack");
const withCSS = require("@zeit/next-css");
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  target: "server",
  analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ["browser", "both"].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: "static",
      reportFilename: "../bundles/server.html",
    },
    browser: {
      analyzerMode: "static",
      reportFilename: "../bundles/client.html",
    },
  },
  onDemandEntries: {
    maxInactiveAge: 100 * 1000,
    pagesBufferLength: 10,
  },
  workboxOpts: {
    swDest: "static/service-worker.js",
    runtimeCaching: [
      {
        urlPattern: /.png$/,
        handler: "CacheFirst",
      },
      {
        urlPattern: /api/,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "https-calls",
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
  webpack: (config) => {
    if (isDev) {
      config.module.rules.push({
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
      });
    }
    config.resolve.alias["~"] = path.join(__dirname);
    config.plugins.push(new Dotenv({ silent: true }));
    return config;
  },
  builds: [{ src: "next.config.js" }],
};

module.exports = withConfig(
  withPlugins(
    [[withFonts], [withBundleAnalyzer], [optimizedImages, { optimizeImages: false }]],
    withCSS(nextConfig)
  )
);
