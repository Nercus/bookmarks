<template>
  <UPopover v-if="!user" v-model:open="popoverOpen">
    <UButton label="Nerc's Login" color="neutral" variant="subtle" @click="popoverOpen = true" />
    <template #content>
      <UFieldGroup class="p-4 w-full max-w-xl">
        <UInput v-model="email" :loading="loading" />
        <UButton icon="lucide:arrow-right" color="neutral" variant="subtle" :disabled="loginDisabled || loading" @click="signInWithOtp" />
      </UFieldGroup>
    </template>
  </UPopover>
  <BookmarksUpload v-else />
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const email = ref('')
const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

const loading = ref(false)
const popoverOpen = ref(false)

const loginDisabled = computed(() => {
  return !email.value || !emailRegex.test(email.value)
})

async function signInWithOtp() {
  loading.value = true
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: 'http://localhost:3000',
    },
  })
  popoverOpen.value = false
  loading.value = false
  if (error) console.error('Error signing in:', error.message)
}
</script>
