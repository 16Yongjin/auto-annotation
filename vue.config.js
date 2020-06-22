module.exports = {
  runtimeCompiler: true,
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devServer: {
      watchOptions: {
        ignored: [/node_modules/, /public/]
      }
    }
  }
}
