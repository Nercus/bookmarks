<template>
  <UDashboardGroup>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Bookmarks" :toggle="false">
          <template #leading>
            <AppLogo class="size-10" />
          </template>
          <template #right>
            <UColorModeButton />
            <AuthLoginButton />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar :ui="{ root: 'px-0' }">
          <template #default>
            <div class="flex flex-row flex-wrap justify-between items-center gap-2 py-1 w-full h-full">
              <BookmarksSearchBar v-model:search="searchString" :loading="loading" class="px-2" />
              <BookmarksTagFilter v-model="tagFilter" />
            </div>
          </template>
        </UDashboardToolbar>
      </template>
      <template #body>
        <BookmarksGrid v-model="loading" :search="searchString" :tag-filter="tagFilter" />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
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
