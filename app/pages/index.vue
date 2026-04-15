<template>
  <div class="">
    <AppToolbar v-model:loading="loading" v-model:search="searchString" v-model:tag-filter="tagFilter" />
    <BookmarksGrid v-model="loading" :search="searchString" :tag-filter="tagFilter" />
  </div>
</template>

<script setup lang="ts">
const searchString = ref('')
const tagFilter = ref<string>('')
const loading = ref(false)

watch(searchString, (newValue) => {
  if (newValue === '') return
  tagFilter.value = ''
})
</script>
