import { make_query } from "$lib/exo-planet-archive";
const recent_planets = async () => {
  let query = `SELECT+*+FROM+ps+WHERE+pl_pubdate+%3E%3D+%272025-01-01%27+AND+pl_pubdate+%3C+%272026-01-01%27+ORDER+BY+pl_pubdate+DESC,+pl_name`;
  let result = await make_query(query, "json");
  let arr = JSON.parse(result);

  return JSON.stringify(arr.slice(0, 10));
};

export const GET = async ({ url }) => {
  let result = await recent_planets();
  return new Response(result);
};
