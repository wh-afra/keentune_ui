/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/var': {
      target: 'http://121.43.179.166:8082', //'http://39.102.55.119:8082',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/cmd': {
      target: 'http://121.43.179.166:8082', 
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/read': {
      target: 'http://39.102.55.119:8082',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/etc': {
      target: 'http://39.102.55.119:8082',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  test: {
    '/api/': {
      target: '',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
