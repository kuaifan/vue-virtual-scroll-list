const path = require('path')
process.env.VUE_CLI_TEST = false

// https://cli.vuejs.org/config/#global-cli-config
module.exports = {
  publicPath: './',

  outputDir: path.resolve(__dirname, '../docs'),

  productionSourceMap: false
}
