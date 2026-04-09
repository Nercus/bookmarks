// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@formkit/auto-animate/nuxt',
    '@nuxtjs/supabase'
  ],
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },
  compatibilityDate: '2025-01-15',
  typescript: {
    strict: true,
    typeCheck: true
  },
  eslint: {
    config: {
      standalone: false
    }
  },
  icon: {
    mode: 'svg',
    collections: ['fluent']
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false
  }
})
