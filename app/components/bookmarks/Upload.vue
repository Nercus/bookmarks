<template>
  <UModal v-model:open="modalOpen" title="Bookmark Upload">
    <UButton label="Upload Bookmark" color="neutral" variant="soft" icon="lucide:plus" @click="modalOpen = true" />

    <template #body>
      <div class="flex flex-col justify-center items-center gap-2 w-full">
        <UInput v-model="url" class="w-full" :loading="loading" />
        <USelect v-model="tag" :items="tagOptions" value-key="value" class="w-full">
          <template #item="{ item }">
            <UBadge :color="item.color" :variant="item.variant">
              {{ item.label }}
            </UBadge>
          </template>
        </USelect>
        <UButton
          icon="lucide:upload" color="neutral" variant="solid" :disabled="uploadDisabled || loading" label="Upload"
          @click="uploadBookmark" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const urlRegex = /^(?:https?|ftp|file|mailto|tel|data|irc|ssh|git|svn|ws|wss):\S+$/

const modalOpen = ref(false)
const toast = useToast()
const supabase = useSupabaseClient()

const loading = ref(false)
const url = ref('')
const tag = ref('')
const uploadDisabled = computed(() => {
  return !url.value || !urlRegex.test(url.value) || !tag.value
})

async function uploadBookmark() {
  if (!url.value || !urlRegex.test(url.value)) {
    console.error('Invalid URL')
    toast.add({
      title: 'Invalid URL',
      description: 'Please enter a valid URL.',
      color: 'error',
    })
    return
  }

  loading.value = true
  const { error } = await supabase.functions.invoke('upload-bookmark', {
    body: { url: url.value, tag: tag.value },
  })

  if (error) {
    toast.add({
      title: 'Upload Failed',
      description: 'There was an error uploading your bookmark. Please try again.',
      color: 'error',
    })
  }
  else {
    toast.add({
      title: 'Upload Successful',
      description: 'Your bookmark has been uploaded successfully.',
      color: 'success',
    })
    url.value = ''
    refreshNuxtData('all-bookmarks')
  }
  loading.value = false
  modalOpen.value = false
}

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

const tagOptions = Object.keys(tagStyleMap).map(key => ({
  label: key,
  value: key,
  color: tagStyleMap[key as keyof typeof tagStyleMap].color,
  variant: tagStyleMap[key as keyof typeof tagStyleMap].variant,
}))
</script>
