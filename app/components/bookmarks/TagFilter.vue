<template>
  <div class="flex flex-row items-center gap-2 px-2 overflow-x-auto">
    <UBadge
      v-for="option in tagOptions" :key="option.value" :color="option.color" :variant="option.variant"
      :class="selectedTag === option.value ? 'opacity-100' : 'opacity-60'" class="cursor-pointer" @click="selectTag(option.value)">
      {{ option.label }}
    </UBadge>
  </div>
</template>

<script setup lang="ts">
const selectedTag = defineModel<string>()

const tagOptions = Object.keys(tagStyleMap).map(key => ({
  label: key,
  value: key,
  color: tagStyleMap[key as keyof typeof tagStyleMap].color,
  variant: tagStyleMap[key as keyof typeof tagStyleMap].variant,
}))

function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}
</script>
