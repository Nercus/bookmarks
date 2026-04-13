<template>
  <USelect v-model="tag" :items="tagOptions" value-key="value" class="w-full">
    <template #item="{ item }">
      <UBadge :color="item.color" :variant="item.variant">
        {{ item.label }}
      </UBadge>
    </template>
  </USelect>
</template>

<script setup lang="ts">
const tag = defineModel({
  type: String,
  default: '',
})

const tagOptions = Object.keys(tagStyleMap).map(key => ({
  label: key,
  value: key,
  color: tagStyleMap[key as keyof typeof tagStyleMap].color,
  variant: tagStyleMap[key as keyof typeof tagStyleMap].variant,
}))
</script>
