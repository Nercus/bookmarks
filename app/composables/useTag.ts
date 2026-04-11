export const tagStyleMap = {
  'Art': { color: 'primary', variant: 'solid' },
  'Assets': { color: 'success', variant: 'solid' },
  'Coding': { color: 'warning', variant: 'solid' },
  'Portfolio': { color: 'error', variant: 'solid' },
  'Tool': { color: 'primary', variant: 'subtle' },
  'Typography': { color: 'success', variant: 'subtle' },
  'UI/UX': { color: 'warning', variant: 'subtle' },
  'Webdev': { color: 'error', variant: 'subtle' },
} as const

export function useTag() {
  function getTagStyle(tag: string) {
    return tagStyleMap[tag as keyof typeof tagStyleMap] || { color: 'default', variant: 'subtle' }
  }

  return {
    getTagStyle,
  }
}
