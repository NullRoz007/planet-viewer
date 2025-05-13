import { make_query } from "$lib/exo-planet-archive";
const list_planets = async () => {
  let query = `SELECT+pl_name,+hostname,+pl_rade,+pl_bmasse,+pl_orbper,+ra,+dec+FROM+ps+WHERE+pl_name+IS+NOT+NULL`;
  let result = await make_query(query, "json");
  return result;
};

export const GET = async ({ url }) => {
  let result = await list_planets();
  console.log(result);
  return new Response(result);
};
