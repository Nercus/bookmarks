<template>
  <UEditor
    v-slot="{ editor }"
    v-model="value"
    v-bind="$attrs"
    content-type="markdown"
    class="border border-muted rounded w-full h-96 overflow-y-auto"
    :ui="{ base: 'p-8 sm:px-16 py-13.5' }"
    enable-paste-rules>
    <UEditorSuggestionMenu :editor="editor" :items="items" :append-to="appendToBody" />
  </UEditor>
</template>

<script setup lang="ts">
import type { EditorSuggestionMenuItem } from '@nuxt/ui'

const value = defineModel({
  type: String,
  default: '',
})

const appendToBody = import.meta.client ? () => document.body : undefined

const items: EditorSuggestionMenuItem[][] = [
  [
    {
      type: 'label',
      label: 'Text',
    },
    {
      kind: 'paragraph',
      label: 'Paragraph',
      icon: 'i-lucide-type',
    },
    {
      kind: 'heading',
      level: 1,
      label: 'Heading 1',
      icon: 'i-lucide-heading-1',
    },
  ],
  [
    {
      type: 'label',
      label: 'Lists',
    },
    {
      kind: 'bulletList',
      label: 'Bullet List',
      icon: 'i-lucide-list',
    },
    {
      kind: 'orderedList',
      label: 'Numbered List',
      icon: 'i-lucide-list-ordered',
    },
  ],
  [
    {
      type: 'label',
      label: 'Insert',
    },
    {
      kind: 'blockquote',
      label: 'Blockquote',
      icon: 'i-lucide-text-quote',
    },
    {
      kind: 'codeBlock',
      label: 'Code Block',
      icon: 'i-lucide-square-code',
    },
    {
      kind: 'horizontalRule',
      label: 'Divider',
      icon: 'i-lucide-separator-horizontal',
    },
  ],
]
</script>

<style>
html.dark .tiptap .shiki,
html.dark .tiptap .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--ui-bg-muted) !important;
}
</style>
