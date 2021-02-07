const postcss = require('rollup-plugin-postcss');
const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          postcssPresetEnv(),
          cssnano({
            preset: ['default', {
              discardComments: {
                removeAll: true,
              },
            }]
          }),
          autoprefixer(),
        ],
        inject: true,
        extract: 'index.css',
        module: true,
        camelCase: true,
        sass: true,
      })
    );
    return config;
  },
};
