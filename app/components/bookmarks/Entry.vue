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
  'Assets': { color: 'secondary', variant: 'solid' },
  'Coding': { color: 'success', variant: 'solid' },
  'Portfolio': { color: 'info', variant: 'solid' },
  'Tool': { color: 'warning', variant: 'solid' },
  'Typography': { color: 'primary', variant: 'outline' },
  'UI/UX': { color: 'error', variant: 'solid' },
  'Webdev': { color: 'secondary', variant: 'outline' },
} as const

const tagData = computed<BadgeProps>(() => {
  const style = tagStyleMap[props.tag as keyof typeof tagStyleMap] || { color: 'default', variant: 'outline' }
  return {
    label: props.tag as string,
    color: style.color,
    variant: style.variant,
  }
})
</script>
