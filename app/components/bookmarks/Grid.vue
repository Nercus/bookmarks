<template>
  <div class="gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
    <BookmarksEntry
      v-for="bm in bookmarksToShow" :key="bm.id" :title="bm.title"
      :description="bm.description || ''"
      :image="bm.image || '/img/og_fallback.png'" :date="bm.created_at" :url="bm.url" :tag="bm.tag" />
  </div>
  <UEmpty
    v-if="!loading && bookmarksToShow.length === 0" title="No bookmarks found" icon="i-lucide-frown"
    description="Try adjusting your search or filter to find what you're looking for." />
</template>

<script setup lang="ts">
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

const { data: allBookmarks } = await useAsyncData('all-bookmarks', async () => {
  const { data } = await supabase.from('bookmarks').select('*').order('url', { ascending: true })
  return data
})

async function getEmbedding(text: string): Promise<number[]> {
  const { data } = await supabase.functions.invoke('embed', {
    body: { input: text },
  })
  return data.embedding as number[]
}

async function searchBookmarks() {
  loading.value = true
  // Step 1: Get the embedding for the search query
  const embedding = await getEmbedding(props.search)

  const { data, error } = await supabase.rpc('hybrid_search', {
    query_text: props.search,
    query_embedding: embedding, // array of numbers
    match_count: 10,
  })

  if (error) {
    console.error('Error performing search:', error)
    loading.value = false
    return
  }

  searchData.value = (data || []).filter(result => result.score > 0.1)
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
</script>
