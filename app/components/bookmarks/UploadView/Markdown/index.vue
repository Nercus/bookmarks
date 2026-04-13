<template>
  <div class="flex flex-col items-center gap-2 max-h-2/3">
    <UInput v-model="title" class="w-full" placeholder="Title" />
    <UFileUpload
      v-model="image" icon="i-lucide-image" label="Drop your image here"
      description="(Optional)" class="w-full md:w-1/2 aspect-video" />
    <BookmarksUploadViewMarkdownEditor v-model="content" />
    <UButton
      icon="lucide:upload" color="neutral" variant="solid" :disabled="uploadDisabled || loading" label="Upload"
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
const image = ref<File | null>(null)

const uploadDisabled = computed(() => {
  return !title.value || !content.value || loading.value
})

const toast = useToast()
const supabase = useSupabaseClient()

function uploadImage() {
  const fileTitle = slugify(title.value, { lower: true, strict: true })
  const { data, error } = supabase.storage.from('og_images').upload(`public/${crypto.randomUUID()}`, image.value as File)
}

function uploadNote() {
  modalOpen.value = false
}
</script>
