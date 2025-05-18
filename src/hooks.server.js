import { cyrb53 } from "$lib/util";
import PocketBase from "pocketbase";

const cache = {}; // cache = hash map like [query_hash: response] where query_hash is the hash of the full query url
const handle_cache = async (event, resolve) => {
  const hash = cyrb53(event.request.url);
  const cache_valid = true; //cache invalidation to come
  const now = new Date();

  if (event.url.searchParams.get("use-cache") == "false") {
    console.log("[Cache Handler] Not using cache for " + event.url.href);
    const response = await resolve(event);
    return response;
  }

  if (!cache[hash]) {
    const _response = await resolve(event);
    const data = await _response.json();
    const cache_date = now;
    cache[hash] = [data, cache_date];
  }

  if (cache[hash][1] == now) {
    console.log(
      `[Cache Handler] Replying to ${event.request.url} with new data!`,
    );
  } else {
    console.log(
      `[Cache Handler] Replying to ${event.request.url} with cached data from ${cache[hash][1].toLocaleDateString()}`,
    );
  }

  const data = cache[hash][0];

  const response = new Response(JSON.stringify(data), { status: 200 });
  return response;
};

export const handle = async ({ event, resolve }) => {
  let response;

  // Caching for API Requests
  if (event.url.pathname.startsWith("/api/query")) {
    response = await handle_cache(event, resolve);
  } else {
    response = await resolve(event);
  }

  return response;
};
