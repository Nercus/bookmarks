<template>
  <div class="top-0 z-10 sticky flex flex-col bg-default/80 backdrop-blur w-full">
    <div class="flex flex-row justify-between items-center p-2 border-default border-b">
      <AppLogo class="size-10" />
      <div class="flex flex-row gap-2">
        <UColorModeButton variant="soft" />
        <AuthLoginButton />
      </div>
    </div>
    <div class="flex flex-row flex-wrap justify-between items-center gap-2 p-0 md:p-2 py-2 border-default border-b w-full">
      <BookmarksSearchBar v-model:search="searchString" :loading="loading" class="px-2" />
      <BookmarksTagFilter v-model="tagFilter" />
    </div>
  </div>
</template>

<script setup lang="ts">
const searchString = defineModel('search', {
  type: String,
  default: '',
})
const tagFilter = defineModel('tagFilter', {
  type: String,
  default: '',
})
const loading = defineModel('loading', {
  type: Boolean,
  default: false,
})
</script>
