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

  const response = await fetch(request_string);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return await response.text();
};

export const analyise_planet = (data) => {
  const radius_earth = data.pl_rade;
  const eq_temp = data.pl_eqt;
  const stellar_luminosity = data.pl_insol != null ? data.pl_insol : null;
  const orbital_period = data.pl_orbper;
  const discovery_method = data.discoverymethod;
  const radius_error = data.pl_radeerr1;

  console.log(`Eq temp: ${eq_temp}`);

  let result = {
    is_habitable: eq_temp >= 175 && eq_temp <= 270,
  };

  return result;
};
