<template>
  <UBlogPost :to="props.url" target="_blank" :title="props.title" :description="props.description" :image="imageUrl" :date="props.date" :badge="tagData" />
</template>

<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

const props = defineProps<{
  title: string
  description: string
  image: string
  date: string
  url: string
  tag: string
}>()

const { getTagStyle } = useTag()

const fallback = '/img/og_fallback.png'
const imageUrl = ref(props.image)

watch(() => props.image, (src) => {
  if (!import.meta.client) return
  const img = new window.Image()
  img.onload = () => {
    imageUrl.value = src
  }
  img.onerror = () => {
    imageUrl.value = fallback
  }
  img.src = src
}, { immediate: true })

const tagData = computed<BadgeProps>(() => {
  return getTagStyle(props.tag)
})
</script>

<style>
.ease-in-out-custom {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
