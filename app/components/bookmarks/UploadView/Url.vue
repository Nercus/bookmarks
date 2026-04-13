<template>
  <div class="flex flex-col justify-center items-center gap-2 w-full">
    <UInput v-model="url" class="w-full" :loading="loading" />
    <BookmarksUploadViewTagSelect v-model="tag" />
    <UButton
      icon="lucide:upload" color="neutral" variant="solid" :disabled="uploadDisabled || loading" label="Upload"
      @click="uploadBookmark" />
  </div>
</template>

<script setup lang="ts">
const urlRegex = /^(?:https?|ftp|file|mailto|tel|data|irc|ssh|git|svn|ws|wss):\S+$/

const modalOpen = defineModel({
  type: Boolean,
  default: false,
})

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
</script>
