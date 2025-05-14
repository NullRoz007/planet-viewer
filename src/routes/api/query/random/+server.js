import { make_query } from "$lib/exo-planet-archive";
const random_planets = async () => {
  //max, min ra and dec values for psuedu random selection
  const raMin = Math.random() * 350;
  const raMax = raMin + 20;
  const decMin = Math.random() * 170 - 85; // to stay within -90 to 90
  const decMax = decMin + 20;

  // Build ADQL query with pseudo-random region
  const query = `
     SELECT TOP 100 *
     FROM ps
       WHERE ra >= ${raMin.toFixed(2)} AND ra <= ${raMax.toFixed(2)}
       AND dec >= ${decMin.toFixed(2)} AND dec <= ${decMax.toFixed(2)}
     ORDER BY pl_pubdate DESC, pl_name
   `
    .trim()
    .replace(/\s+/g, "+");

  const result = await make_query(query, "json");
  const arr = JSON.parse(result);
  //sort results by last updated;
  const sorted_arr = arr.sort((a, b) => {
    const a_date = new Date(a.rowupdate);
    const b_date = new Date(b.rowupdate);

    return b_date - a_date;
  });

  //de-duplicate results:
  const pl_names = [];
  let unique = [];

  for (let obj of arr) {
    if (pl_names.indexOf(obj.pl_name) != -1) continue;
    unique.push(obj);
    pl_names.push(obj.pl_name);
  }

  if (unique.length > 10) {
    //trim to length 10 for performance reasons
    unique = unique.slice(0, 10);
  } else if (unique < 10) {
    //add skipped results if below 10
    //TODO
  }

  return JSON.stringify(unique);
};

export const GET = async ({ url }) => {
  let result = await random_planets();
  return new Response(result);
};
