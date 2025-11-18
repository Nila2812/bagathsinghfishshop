// src/utils/geocode.js
const token = import.meta.env.VITE_MAPBOX_TOKEN;

export async function reverseGeocode(lat, lon) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();
  const feature = data.features?.[0];
  const ctx = feature?.context || [];
  const getById = (prefix) => ctx.find(c => c.id?.startsWith(prefix))?.text || "";

  return {
    place: feature?.place_name || "",
    pincode: getById("postcode"),
    district: getById("district") || getById("place"),
    state: getById("region")
  };
}
