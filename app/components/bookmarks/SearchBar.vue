<template>
  <UFieldGroup class="w-full max-w-xl">
    <UInput ref="input" v-model="tempSearchString" size="lg" variant="outline" placeholder="Search..." class="w-full" @keyup.enter="searchBookmarks">
      <template #trailing>
        <UButton
          v-if="tempSearchString?.length"
          color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Clear input"
          @click="tempSearchString = ''" />

        <UKbd value="meta" />
        <UKbd value="K" />
      </template>
    </UInput>
    <UButton color="neutral" variant="subtle" :loading="props.loading" icon="i-lucide-search" size="lg" :disabled="loading" @click="searchBookmarks" />
  </UFieldGroup>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading: boolean
}>()

const emits = defineEmits<{
  (e: 'search'): void
}>()

const { start, finish } = useLoadingIndicator()

watch(() => props.loading, (newValue) => {
  if (newValue) {
    start()
  }
  else {
    finish()
  }
})

const input = useTemplateRef('input')
const tempSearchString = ref('')
const searchString = defineModel<string>('search', { default: '' })
function searchBookmarks() {
  searchString.value = tempSearchString.value
  emits('search')
}
watch(tempSearchString, (newValue) => {
  if (newValue === '') {
    searchString.value = ''
  }
})

defineShortcuts({
  meta_k: () => {
    input.value?.inputRef?.focus()
  },
})
</script>
