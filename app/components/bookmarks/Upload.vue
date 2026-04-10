<template>
  <UModal v-model:open="modalOpen" title="Bookmark Upload">
    <UButton label="Upload Bookmark" color="neutral" variant="soft" icon="lucide:plus" @click="modalOpen = true" />

    <template #body>
      <UFieldGroup class="w-full">
        <UInput v-model="url" class="w-full" :loading="loading" />
        <UButton
          icon="lucide:upload" color="neutral" variant="subtle" :disabled="uploadDisabled || loading" label="Upload"
          @click="uploadBookmark" />
      </UFieldGroup>
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
const uploadDisabled = computed(() => {
  return !url.value || !urlRegex.test(url.value)
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

    body: { url: url.value },
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
  }
  loading.value = false
  modalOpen.value = false
}
</script>
