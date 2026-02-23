/**
 * Configurazione CRACO per risolvere la compatibilità con design-react-kit (ESM)
 * e per disabilitare postcss-svgo che causa errori con i CSS di bootstrap-italia.
 */
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Permette l'importazione di moduli ESM senza specificare l'estensione del file
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      // Sostituisce il plugin CssMinimizer con una configurazione che disabilita svgo
      // per evitare errori con i data URI SVG URL-encoded di bootstrap-italia.min.css
      if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.map((plugin) => {
          if (plugin && plugin.constructor && plugin.constructor.name === 'CssMinimizerPlugin') {
            return new CssMinimizerPlugin({
              minimizerOptions: {
                preset: ['default', { svgo: false }],
              },
            });
          }
          return plugin;
        });
      }

      return webpackConfig;
    },
  },
};
