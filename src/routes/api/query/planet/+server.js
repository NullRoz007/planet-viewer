import { make_query } from "$lib/exo-planet-archive";
const search_planets = async (pl_name) => {
  const sanitized = pl_name.replace(/[%_]/g, "") ?? "";
  const likeClause = sanitized
    ? `AND pl_name LIKE '%25${encodeURIComponent(sanitized)}%25'`
    : "";

  const query = `
      SELECT TOP 10 *
      FROM ps
      WHERE pl_name IS NOT NULL
      ${likeClause}
    `
    .trim()
    .replace(/\s+/g, "+");

  let result = await make_query(query, "json");
  return result;
};

export const GET = async ({ url }) => {
  let pl_name = url.searchParams.get("pl_name");
  let result = await search_planets(pl_name);

  return new Response(result);
};
