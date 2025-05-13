const DATABASE_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?";

export const make_query = async (query, format) => {
  console.log(query);
  const request_string =
    DATABASE_URL +
    "query=" +
    query +
    "&" +
    new URLSearchParams({
      format: format,
    }).toString();
  console.log(request_string);

  const response = await fetch(request_string);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return await response.text();
};
