<template>
  <AppLogoLight v-if="colorMode.value === 'light'" />
  <AppLogoDark v-else />
</template>

<script setup lang="ts">
const colorMode = useColorMode()
</script>
