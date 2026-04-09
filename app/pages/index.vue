<template>
  <div class="gap-10 grid grid-cols-6 p-10 w-full">
    <UBlogPost
      v-for="i in 40" :key="i"
      class="w-full"
      title="Introducing Nuxt Icon v1"
      description="Discover Nuxt Icon v1 - a modern, versatile, and customizable icon solution for your Nuxt projects."
      image="https://nuxt.com/assets/blog/nuxt-icon/cover.png" date="2024-11-25"
      variant="subtle" />
  </div>
</template>

<script setup lang="ts">
// const supabase = useSupabaseClient()

// onMounted(() => {
//    console.log(supabase)
// })
</script>
