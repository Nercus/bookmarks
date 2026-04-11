<template>
  <UBlogPosts>
    <BookmarksEntry
      v-for="bm in bookmarksToShow" :key="bm.id" :title="bm.title"
      :description="bm.og_description || ''"
      :image="bm.og_image || '/img/og_fallback.png'" :date="bm.created_at" :url="bm.url" :tag="bm.tag" />
  </UBlogPosts>
</template>

<script setup lang="ts">
const props = defineProps<{
  search: string
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
    score_threshold: 0.25,
  })

  if (error) {
    console.error('Error performing search:', error)
    loading.value = false
    return
  }

  searchData.value = data
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
    return allBookmarks.value || []
  }
  else {
    const filteredBookmarks = allBookmarks.value?.filter(bm => searchData.value?.some(result => result.url === bm.url))
    return filteredBookmarks || []
  }
})
</script>
