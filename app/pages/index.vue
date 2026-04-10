<template>
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
              <UInput ref="input" v-model="searchString" icon="i-lucide-search" size="lg" variant="outline" placeholder="Search..." class="w-full">
                <template #trailing>
                  <UKbd value="meta" size="sm" />
                  <UKbd value="K" size="sm" />
                </template>
              </UInput>
              <UButton color="neutral" variant="subtle">
                Search
              </UButton>
            </UFieldGroup>
          </div>
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <BookmarksGrid :search="searchString" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const searchString = ref('')
const input = useTemplateRef('input')

defineShortcuts({
  meta_k: () => {
    input.value?.inputRef?.focus()
  },
})
</script>
