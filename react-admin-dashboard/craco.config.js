const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add bundle analyzer plugin when REACT_APP_BUNDLE_ANALYZER is true
      if (process.env.REACT_APP_BUNDLE_ANALYZER === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      }

      // Optimize splitChunks configuration
      if (webpackConfig.optimization) {
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          name: false,
          cacheGroups: {
            // Extract Material-UI into its own chunk
            mui: {
              test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
              name: 'mui',
              chunks: 'all',
              priority: 30,
            },
            // Extract React and related packages into vendor chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 20,
            },
            // Extract other large dependencies
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        };
      }

      return webpackConfig;
    },
  },
};