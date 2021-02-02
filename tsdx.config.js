const postcss = require('rollup-plugin-postcss');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
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
