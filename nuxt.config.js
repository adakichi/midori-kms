import colors from 'vuetify/es5/util/colors'

export default {
  //IPアドレスで外部からアクセス可能にする為追加
  server: {
    // host: '192.168.101.204' // デフォルト: localhost
    host: process.env.DEPLOY_HOST // デフォルト: localhost
  },

  //auth middleware設定
  router:{
    //アクセス制限を解除する場合は、下記をコメントアウトしてください。
    //アクセス制限をONにしている場合、制限をしないページには auth:false　を設定してください。
    middleware:['auth']
  },

  //auth情報追加
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get', propertyName: 'user' }
        },
        // tokenRequired: true,
        // tokenType: 'bearer'
      }
    },
    redirect:{
      login:  '/users/login',
      logout: '/users/login',
      home:   '/'
    }
},

  // 追加部分:dir構成を変更
  srcDir:'./client',

  // 追加部分:serverMiddlewareを設定
  serverMiddleware:["~~/api/"],

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s | midori-kms',
    title: 'midori-kms',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    "~assets/css/common.css"
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/moment'
  ],

  //momentを追加
  moment:{
    lacales:['ja']
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL:process.env.API_BASE_URL
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      },
      options:{customeProperties:true},
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }

}
