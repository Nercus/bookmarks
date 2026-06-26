import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import "@supabase/functions-js/edge-runtime.d.ts"
import { Readability } from "@mozilla/readability"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import ogs from "open-graph-scraper";
import slugify from "slugify";
import { throttledQueue, seconds } from 'throttled-queue';
import { imageMeta } from "image-meta";



const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AGENT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
}

const MAX_CHUNKS = 50;

interface DBBookmark {
  url: string;
  title: string;
  description?: string;
  image?: string;
  tag: string;
  type: 'note';
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""],
});


let supabaseClient: SupabaseClient | null = null;
function getSupbaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

async function isUserLoggedIn(req: Request): Promise<Response | null> {
  const supabase = getSupbaseClient();
  const authHeader = req.headers.get('Authorization')!;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401, headers: { ...CORS_HEADERS } });
  }

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1]);

  if (error || !user) {
    return new Response('Unauthorized', { status: 401, headers: { ...CORS_HEADERS } });
  }
  return null;
}

const ALLOWED_TAGS = ['Art', 'Assets', 'Coding', 'Portfolio', 'Tool', 'Typography', 'UI/UX', 'Webdev'];
function isValidTag(tag: string): boolean {
  return ALLOWED_TAGS.includes(tag);
}


const URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
function isValidRequest(url?: string, tag?: string): null | Response {
  if (!url || !URL_REGEX.test(url)) {
    return new Response('Missing url in request body', { status: 400, headers: { ...CORS_HEADERS } });
  }
  if (!tag || !isValidTag(tag)) {
    return new Response('Invalid tag value', { status: 400, headers: { ...CORS_HEADERS } });
  }
  return null;
}

async function isNewBookmark(url: string): Promise<null | Response> {
  const supabase = getSupbaseClient();
  const { data } = await supabase
    .from('bookmarks')
    .select('url')
    .eq('url', url)
    .single();

  if (data) {
    return new Response('Bookmark already exists', { status: 409, headers: { ...CORS_HEADERS } });
  }
  return null
}

async function getPageHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: AGENT_HEADERS,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch page HTML for URL: ${url}, status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching page HTML for URL: ${url}`, error);
  }

  try {
    const response = await fetch(`https://production-sfo.browserless.io/content?token=${Deno.env.get(
      "PUPPETEER_BROWSERLESS_IO_KEY"
    )}`, {
      method: 'POST',
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
      })
    });
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Error fetching page HTML with Puppeteer for URL: ${url}`, error);
  }
  return null
}


async function getPageData(url: string): Promise<{ title?: string, contentChunks?: string[], url: string, description?: string, image?: string }> {
  const html = await getPageHTML(url);
  if (!html) {
    throw new Error(`Failed to retrieve HTML content for URL: ${url}`);
  }
  const { result } = await ogs({ html })

  const ogImage = Array.isArray(result.ogImage) ? result.ogImage[0]?.url : result.ogImage;
  const twitterImage = Array.isArray(result.twitterImage) ? result.twitterImage[0]?.url : result.twitterImage;
  const title = result.ogTitle || result.dcTitle || result.twitterTitle;
  const description = result.ogDescription || result.dcDescription || result.twitterDescription;
  const image = ogImage || twitterImage;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const reader = new Readability(doc, {
    charThreshold: 500,
  });
  const article = reader.parse();

  const chunks = await textSplitter.splitText(article?.textContent || description || '');
  if (chunks.length > MAX_CHUNKS) {
    chunks.length = MAX_CHUNKS;
  }

  return {
    title: article?.title || title,
    description,
    image,
    contentChunks: chunks,
    url,
  };
}


async function insertBookmark(bookmark: DBBookmark): Promise<void> {
  const supabase = getSupbaseClient();
  const { error } = await supabase
    .from('bookmarks')
    .insert(bookmark);

  if (error) {
    console.error('Error inserting bookmark into database', error);
    throw new Error('Failed to save bookmark');
  }
}


const throttle = throttledQueue({
  maxPerInterval: 1,
  interval: seconds(1),
  evenlySpaced: true,
});

async function embedContentChunks(title: string, tag: string, url: string, contentChunks: string[]): Promise<void> {
  const supabase = getSupbaseClient();
  for (let index = 0; index < contentChunks.length; index++) {
    const chunk = contentChunks[index];
    await throttle(async () => {
      const chunkString = `${title}\n(${tag})\n\n${chunk}`;
      const { error } = await supabase.functions.invoke('embed-insert', {
        body: { url, content: chunkString, chunk_index: index },
      });
      if (error) {
        console.error('Error invoking embed-insert function', error);
        throw new Error('Failed to embed content chunk');
      }
    });
  }
}

async function downloadImage(imageUrl: string): Promise<Uint8Array> {
  try {
    const response = await fetch(imageUrl, {
      headers: AGENT_HEADERS,
    });
    if (!response.ok) {
      throw new Error(`Failed to download image from URL: ${imageUrl}, status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading image from URL: ${imageUrl}`, error);
  }

  try {
    const response = await fetch(`https://production-sfo.browserless.io/export?token=${Deno.env.get(
      "PUPPETEER_BROWSERLESS_IO_KEY"
    )}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: imageUrl })
    });
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading image with Puppeteer from URL: ${imageUrl}`, error);
  }
  throw new Error(`Failed to download image from URL: ${imageUrl}`);
}

async function updateBookmarkImage(bookmarkUrl: string, imagePublicUrl: string): Promise<void> {
  const supabase = getSupbaseClient();
  const { error } = await supabase
    .from('bookmarks')
    .update({ image: imagePublicUrl })
    .eq('url', bookmarkUrl);

  if (error) {
    console.error('Error updating bookmark with image URL', error);
    throw new Error('Failed to update bookmark image');
  }
}

function getStoragePublicUrl(fileName: string): string {
  return `/og_images/${fileName}`
}

async function uploadImageToStorage(bookmarkUrl: string, imageUrl: string, title: string): Promise<void> {
  const supabase = getSupbaseClient();

  const imageSlug = slugify(title, { lower: true, strict: true });
  const imageData = await downloadImage(imageUrl);

  const imageMetaData = imageMeta(imageData);
  const imageType = imageMetaData?.type || 'jpeg';
  const fileName = `${imageSlug}-${Date.now()}.${imageType}`;

  const { data, error: uploadError } = await supabase.storage
    .from('og_images')
    .upload(fileName, imageData, {
      contentType: `image/${imageType}`,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError || !data) {
    console.error('Error uploading image to storage', uploadError);
    throw new Error('Failed to upload image');
  }

  const publicUrl = getStoragePublicUrl(fileName);
  await updateBookmarkImage(bookmarkUrl, publicUrl);
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...CORS_HEADERS } })
  }

  const authResponse = await isUserLoggedIn(req);
  if (authResponse) return authResponse;

  const { url, tag } = await req.json();

  const validationResult = isValidRequest(url, tag);
  if (validationResult) return validationResult;


  const bookmarkExistsResponse = await isNewBookmark(url);
  if (bookmarkExistsResponse) return bookmarkExistsResponse;

  const pageData = await getPageData(url);

  if (!pageData.title) {
    return new Response('Failed to extract page title', { status: 422, headers: { ...CORS_HEADERS } });
  }
  let inserted = false;
  try {
    await insertBookmark({
      url: pageData.url,
      title: pageData.title,
      description: pageData.description,
      image: pageData.image,
      tag,
      type: 'note'
    });
    inserted = true;

    if (pageData.image && pageData.title) {
      await uploadImageToStorage(pageData.url, pageData.image, pageData.title);
    }

    if (pageData.contentChunks) {
      EdgeRuntime.waitUntil(embedContentChunks(pageData.title || '', tag, pageData.url, pageData.contentChunks))
    }
  } catch (error) {
    if (inserted) {
      const supabase = getSupbaseClient();
      await supabase
        .from('bookmarks')
        .delete()
        .eq('url', pageData.url);
    }
    console.error('Error processing bookmark upload', error);
    return new Response('Failed to process bookmark', { status: 500, headers: { ...CORS_HEADERS } });
  }

  return new Response('Bookmark uploaded successfully', { status: 201, headers: { ...CORS_HEADERS } });
})
