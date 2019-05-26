module.exports = {
  outputDir: 'build',
  productionSourceMap: false,
  css: {
    extract: false,
  },
  filenameHashing: false,
  chainWebpack: (config) => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  },
};