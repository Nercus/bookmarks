<template>
  <UDashboardGroup>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Bookmarks">
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
              <UFieldGroup class="w-full max-w-xl">
                <UInput ref="input" v-model="tempSearchString" :loading="loading" icon="i-lucide-search" size="lg" variant="outline" placeholder="Search..." class="w-full" @keyup.enter="searchBookmarks">
                  <template v-if="tempSearchString?.length" #trailing>
                    <UButton
                      color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Clear input"
                      @click="tempSearchString = ''" />
                  </template>
                </UInput>
                <UButton color="neutral" variant="subtle" @click="searchBookmarks">
                  Search
                </UButton>
              </UFieldGroup>
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
const tempSearchString = ref('')
const searchString = ref('')
const loading = ref(false)
const input = useTemplateRef('input')

function searchBookmarks() {
  searchString.value = tempSearchString.value
}

watch(searchString, (newValue) => {
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
