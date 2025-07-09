// src/utils/nominatimAPI.js
export const fetchAddressSuggestions = async (query) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();

    return data.map((place) => ({
      label: place.display_name,
      value: place.display_name,
      lat: place.lat,
      lon: place.lon,
    }));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};
