import { make_query } from "$lib/exo-planet-archive";

export const GET = async ({ url }) => {
  let result = await make_query(url.search.split("?query=")[1], "json");
  console.log(result);
  return new Response(result);
};
