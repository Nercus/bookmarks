<template>
  <div class="relative flex flex-col items-center gap-2 h-full max-h-2/3">
    <div class="flex flex-row gap-2 w-full">
      <UFileUpload
        v-model="image" icon="i-lucide-image" color="neutral" class="mx-0.5 w-32 aspect-video" variant="button"
        :ui="{ base: 'ring ring-accented' }" />
      <div class="flex flex-col gap-2 w-full">
        <UInput v-model="title" class="w-full" placeholder="Title" size="lg" />
        <BookmarksUploadViewTagSelect v-model="tag" />
      </div>
    </div>

    <BookmarksUploadViewMarkdownEditor v-model="content" />
    <UButton
      icon="lucide:upload" color="neutral" variant="solid" :disabled="uploadDisabled" label="Upload"
      @click="uploadNote" />
  </div>
</template>

<script setup lang="ts">
import slugify from 'slugify'

const modalOpen = defineModel({
  type: Boolean,
  default: false,
})

const loading = ref(false)
const title = ref('')
const content = ref('')
const tag = ref('')
const image = ref<File | null>(null)

const uploadDisabled = computed(() => {
  return !title.value || !content.value || !tag.value || loading.value
})

useEventListener('paste', (e: ClipboardEvent) => {
  if (!modalOpen.value) return
  const file = Array.from(e.clipboardData?.items ?? [])
    .find(item => item.type.startsWith('image/'))
    ?.getAsFile()
  if (file) image.value = file
})

const toast = useToast()
const supabase = useSupabaseClient()

async function uploadImage(): Promise<string | null> {
  if (!image.value) return null
  const fileTitle = slugify(title.value, { lower: true, strict: true })
  const fileEnding = image.value.type?.split('/').pop() || 'png'
  const fileName = `${fileTitle}.${fileEnding}`

  const { error } = await supabase.storage
    .from('og_images')
    .upload(fileName, image.value, {
      contentType: image.value.type || 'image/png',
      cacheControl: '3600',
      upsert: true,
    })
  if (error) {
    toast.add({
      title: 'Failed to upload image',
      description: error.message,
      color: 'error',
    })
    console.error(error)
    return null
  }
  const { data: { publicUrl } } = supabase.storage
    .from('og_images')
    .getPublicUrl(fileName)

  return publicUrl
}

async function uploadNote() {
  if (loading.value) return
  if (!title.value || !content.value || !tag.value) {
    toast.add({
      title: 'Missing required fields',
      description: 'Please fill in the title, content, and tag before uploading.',
      color: 'warning',
    })
    return
  }

  loading.value = true

  try {
    const publicUrl = await uploadImage()

    const { error } = await supabase.from('bookmarks').insert({
      title: title.value,
      tag: tag.value,
      description: content.value.substring(0, 160),
      image: publicUrl,
      type: 'note',
    })
    if (error) {
      throw error
    }

    await supabase.functions.invoke('embed-insert', {
      body: { title: title.value, content: content.value, chunk_index: 0 },
    })

    toast.add({
      title: 'Note uploaded',
      description: 'Your note has been uploaded successfully.',
      color: 'success',
    })
  }
  catch (error) {
    toast.add({
      title: 'Failed to upload note',
      description: error instanceof Error ? error.message : String(error),
      color: 'error',
    })
    console.error(error)
  }
  finally {
    modalOpen.value = false
    loading.value = false
  }
}
</script>
