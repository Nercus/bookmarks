<template>
  <UApp>
    <NuxtLoadingIndicator />
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/img/logo.png' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

const title = 'Bookmarks'
const description = 'A simple way I use to save and organize my bookmarks. Built with Nuxt 3 and Supabase.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/img/og-image.png',
  twitterCard: 'summary_large_image',
})
</script>
