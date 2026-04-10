<template>
  <UBlogPost :to="props.url" target="_blank" :title="props.title" :description="props.description" :image="props.image" :date="props.date" />
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  image: string
  date: string
  url: string
}>()
</script>
