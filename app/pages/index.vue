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
        <UDashboardToolbar>
          <template #default>
            <div class="flex justify-center items-center w-full h-full">
              <BookmarksSearchBar v-model:search="searchString" :loading="loading" />
            </div>
          </template>
        </UDashboardToolbar>
      </template>
      <template #body>
        <BookmarksGrid v-model="loading" :search="searchString" />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
const searchString = ref('')
const loading = ref(false)
</script>
