<template>
  <USlideover
    v-model:open="isOpen"
    :ui="{ content: 'rounded-l-lg' }">
    <UBlogPost
      to="#" :title="props.title" :image="{
        src: imageUrl,
        alt: props.title,
        loading: 'lazy',
      }" :date="props.date" :badge="tagData" />
    <template #content>
      <UButton
        icon="lucide:x" color="neutral" variant="subtle"
        class="top-2 right-2 z-50 absolute" @click="isOpen = false" />
      <UBlogPost
        :title="props.title" :description="props.description" :image="imageUrl" :date="props.date"
        :badge="tagData" :ui="{ root: 'h-full min-h-full' }">
        <template #description>
          <MDC v-if="content" :value="content" />
          <span v-else class="mt-1 text-base text-pretty">{{ props.description }}</span>
        </template>

        <template #footer>
          <div class="flex justify-end p-2 w-full">
            <UButton v-if="props.url" :href="props.url" target="_blank" color="neutral" variant="subtle" icon="lucide:external-link">
              Visit Site
            </UButton>
          </div>
        </template>
      </UBlogPost>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'

const props = defineProps<{
  title: string
  description: string
  image: string
  date: string
  url: string | null
  tag: string
  type: string
}>()

const isOpen = ref(false)

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

const supabase = useSupabaseClient()

const { data: content } = useAsyncData(props.title, async () => {
  if (props.type === 'link') {
    return
  }
  const { data } = await supabase.from('bookmark_chunks').select('content').eq('title', props.title).single()
  return data?.content
})
</script>

<style>
.ease-in-out-custom {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
