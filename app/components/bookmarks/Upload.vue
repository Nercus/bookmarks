<template>
  <UModal v-model:open="modalOpen" title="Bookmark Upload" :ui="{ content: 'max-w-4xl' }">
    <UButton color="neutral" variant="soft" icon="lucide:plus" @click="modalOpen = true" />

    <template #body>
      <UTabs :items="views" color="neutral">
        <template #url>
          <BookmarksUploadViewUrl v-model="modalOpen" />
        </template>

        <template #markdown>
          <BookmarksUploadViewMarkdown v-model="modalOpen" />
        </template>
      </UTabs>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const modalOpen = defineModel({
  type: Boolean,
  default: false,
})

const views = [
  {
    label: 'URL',
    icon: 'i-lucide-link',
    slot: 'url',
  },
  {
    label: 'Markdown',
    icon: 'i-lucide-file-pen-line',
    slot: 'markdown',
  },
]
</script>
