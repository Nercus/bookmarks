<template>
  <UBlogPost :to="props.url" target="_blank" :title="props.title" :description="props.description" :image="props.image" :date="props.date" :badge="tagData" />
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

const tagStyleMap = {
  'Art': { color: 'primary', variant: 'solid' },
  'Assets': { color: 'success', variant: 'solid' },
  'Coding': { color: 'warning', variant: 'solid' },
  'Portfolio': { color: 'error', variant: 'solid' },
  'Tool': { color: 'primary', variant: 'subtle' },
  'Typography': { color: 'success', variant: 'subtle' },
  'UI/UX': { color: 'warning', variant: 'subtle' },
  'Webdev': { color: 'error', variant: 'subtle' },
} as const

const tagData = computed<BadgeProps>(() => {
  const style = tagStyleMap[props.tag as keyof typeof tagStyleMap] || { color: 'default', variant: 'subtle' }
  return {
    label: props.tag as string,
    color: style.color,
    variant: style.variant,
  }
})
</script>
