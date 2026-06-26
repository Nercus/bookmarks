<template>
  <div ref="scrollParent" class="h-[calc(100dvh-7.5rem)]" :class="showSkeleton ? 'overflow-hidden' : 'overflow-auto'">
    <Transition name="fade" mode="out-in">
      <div
        v-if="showSkeleton"
        class="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 p-4">
        <div v-for="index in skeletonCount" :key="index" class="space-y-3">
          <USkeleton class="rounded-lg w-full aspect-16/10" />
          <USkeleton class="w-3/4 h-5" />
          <USkeleton class="w-full h-4" />
          <USkeleton class="w-5/6 h-4" />
        </div>
      </div>
      <div
        v-else-if="bookmarksToShow.length > 0"
        class="relative w-full"
        :style="{ height: `${rowVirtualizer.getTotalSize()}px` }">
        <div
          v-for="virtualRow in virtualRows"
          :key="virtualRow.key"
          :data-index="virtualRow.index"
          class="top-0 left-0 absolute px-4 py-2 w-full"
          :style="{ transform: `translateY(${virtualRow.start}px)` }">
          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <BookmarksEntry
              v-for="bm in getRowBookmarks(virtualRow.index)"
              :key="bm.id" :type="bm.type" :title="bm.title"
              :description="bm.description || ''"
              :image="bm.image" :date="bm.created_at" :url="bm.url" :tag="bm.tag" />
          </div>
        </div>
      </div>
      <UEmpty
        v-else title="No bookmarks found" icon="i-lucide-frown"
        description="Try adjusting your search or filter to find what you're looking for." />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'

const props = defineProps<{
  search: string
  tagFilter: string
}>()

const loading = defineModel({
  type: Boolean,
  default: false,
})

interface SearchResult {
  content: string
  score: number
  title: string
  url: string
}

const supabase = useSupabaseClient()
const searchData = ref<SearchResult[] | null>(null)
const scrollParent = useTemplateRef('scrollParent')
const { width: scrollParentWidth } = useElementSize(scrollParent)
const breakpoints = useBreakpoints({
  sm: 640,
  lg: 1024,
}, {
  ssrWidth: 1024,
})

const { data: allBookmarks, pending: bookmarksPending } = useAsyncData('all-bookmarks', async () => {
  const { data } = await supabase.from('bookmarks').select('*').order('title', { ascending: true })
  return data ?? []
}, {
  default: () => [],
})

type Bookmark = NonNullable<typeof allBookmarks.value>[number]

async function searchBookmarks() {
  loading.value = true

  const { data, error } = await supabase.rpc('hybrid_search', {
    query_text: props.search,
    match_count: 10,
  })

  if (error) {
    console.error('Error performing search:', error)
    loading.value = false
    return
  }

  searchData.value = data || []
  loading.value = false
}

watch(() => props.search, (newValue) => {
  if (newValue === '') {
    searchData.value = null
  }
  else {
    searchBookmarks()
  }
})

const bookmarksToShow = computed(() => {
  if (props.search === '') {
    if (props.tagFilter) {
      const filteredByTag = allBookmarks.value?.filter(bm => bm.tag === props.tagFilter)
      return filteredByTag || []
    }
    return allBookmarks.value || []
  }
  else {
    const filteredBookmarks = allBookmarks.value?.filter(bm => searchData.value?.some(result => result.url === bm.url))
    return filteredBookmarks || []
  }
})

const columnCount = computed(() => {
  if (scrollParentWidth.value >= 1536) return 5
  if (scrollParentWidth.value >= 1024) return 3
  if (scrollParentWidth.value >= 640) return 2
  return 1
})

const bookmarkRows = computed<Bookmark[][]>(() => {
  const rows: Bookmark[][] = []
  const columns = columnCount.value

  for (let index = 0; index < bookmarksToShow.value.length; index += columns) {
    rows.push(bookmarksToShow.value.slice(index, index + columns))
  }

  return rows
})

const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => ({
  count: bookmarkRows.value.length,
  getScrollElement: () => scrollParent.value,
  estimateSize: () => 456,
  overscan: 5,
  getItemKey: index => bookmarkRows.value[index]?.[0]?.id ?? index,
})))

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())

const isVirtualizerPending = computed(() => bookmarkRows.value.length > 0 && virtualRows.value.length === 0)
const showSkeleton = computed(() => bookmarksPending.value || loading.value || isVirtualizerPending.value)
const skeletonCount = computed(() => {
  if (breakpoints.greaterOrEqual('lg').value) return 15
  if (breakpoints.greaterOrEqual('sm').value) return 5
  return 3
})

function getRowBookmarks(index: number): Bookmark[] {
  return bookmarkRows.value[index] ?? []
}

watch(bookmarkRows, () => {
  rowVirtualizer.value.measure()
})

watch([() => props.search, () => props.tagFilter, columnCount], () => {
  rowVirtualizer.value.scrollToOffset(0)
  rowVirtualizer.value.measure()
})
</script>

<style lang="css" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
