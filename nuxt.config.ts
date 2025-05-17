import vue from '@vitejs/plugin-vue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  build: {
    transpile: ['trpc-nuxt'],
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-security',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.ts',
      },
      {
        code: 'id',
        name: 'Indonesia',
        file: 'id.ts',
      },
    ],
    lazy: true,
    defaultLocale: 'en',
    langDir: './',
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: false,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  piniaPluginPersistedstate: {
    key: 'nuxtreez_%id',
    cookieOptions: {
      sameSite: 'lax',
    },
    storage: 'localStorage',
  },
  security: {
    strict: false,
    headers: {
      crossOriginResourcePolicy: 'same-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? false : 'credentialless', // USE ONLY IN DEV MODE
      contentSecurityPolicy: {
        'base-uri': ["'none'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'https://ui-avatars.com'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'script-src': ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'"],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'development' ? false : true, // USE ONLY IN DEV MODE
      },
      originAgentCluster: '?1',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: {
        maxAge: 15552000, // 180 days
        includeSubdomains: true,
      },
      xContentTypeOptions: 'nosniff',
      xDNSPrefetchControl: 'off',
      xDownloadOptions: 'noopen',
      xFrameOptions: 'SAMEORIGIN',
      xPermittedCrossDomainPolicies: 'none',
      xXSSProtection: '0',
      permissionsPolicy: {
        camera: [],
        'display-capture': [],
        fullscreen: [],
        geolocation: [],
        microphone: [],
      },
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 4000000, // Consider increasing to 4-5MB, default 2MB
      maxUploadFileRequestInBytes: 8000000, // 8MB
      throwError: true,
    },
    rateLimiter: {
      tokensPerInterval: 100, // Reduce to 100 for better protection, default 150 requests
      interval: 300000, // 5 Minutes
      headers: true, // Enable headers to help clients track their rate limit, default false
      driver: {
        name: 'lru-cache', // 'memory' is more efficient than 'lruCache' for small-medium apps
      },
      throwError: true,
    },
    // xssValidator: {
    //   throwError: true,
    // },
    xssValidator: false,
    corsHandler: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      preflight: {
        statusCode: 204,
      },
    },
    allowedMethodsRestricter: {
      methods: '*',
      throwError: true,
    },
    hidePoweredBy: true,
    basicAuth: false,
    enabled: true,
    csrf: {
      https: process.env.NODE_ENV === 'production',
      cookieKey: 'XSRF-TOKEN', // "__Host-csrf" if https is true otherwise just "csrf"
      cookie: {
        // CookieSerializeOptions from unjs/cookie-es
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
      },
      methodsToProtect: ['POST', 'PUT', 'PATCH'],
      encryptSecret: process.env.NUXT_CSRF_SECRET_KEY,
      addCsrfTokenToEventCtx: false, // default false, to run useCsrfFetch on server set it to true
      headerName: 'x-csrf-token',
    },
    nonce: true,
    removeLoggers: true,
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: false,
      nitroHeaders: true,
      exportToPresets: true,
    },
    sri: true,
  },
  runtimeConfig: {
    betterAuthSecret: '',
    jwtSecretKey: '',
    jwtRefreshSecretKey: '',
    databaseUrl: '',
    mysqlHost: '',
    mysqlPort: '',
    mysqlUser: '',
    mysqlPassword: '',
    mysqlDatabase: '',
    redisPort: '',
    redisHost: '',
    redisUsername: '',
    redisPassword: '',
    redisDb: 0,
    encryptionAlgorithm: '',
    encryptionPassword: '',
    encryptionSalt: '',
    public: {
      auth: {
        redirectUserTo: '/dashboard',
        redirectGuestTo: '/',
      },
      baseUrl: '',
      appName: 'Treez Nuxtify',
    },
  },
  nitro: {
    rollupConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      plugins: [vue()],
    },
  },
  typescript: {
    typeCheck: false,
  },
  vite: {
    plugins: [
      {
        apply: 'build',
        name: 'vite-plugin-ignore-sourcemap-warnings',
        configResolved(config) {
          const originalOnWarn = config.build.rollupOptions.onwarn
          config.build.rollupOptions.onwarn = (warning, warn) => {
            if (warning.code === 'SOURCEMAP_BROKEN' && warning.plugin === '@tailwindcss/vite:generate:build') {
              return
            }

            if (originalOnWarn) {
              originalOnWarn(warning, warn)
            } else {
              warn(warning)
            }
          }
        },
      },
    ],
  },
})
