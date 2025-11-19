// src/utils/distance.js
import mapboxgl from "mapbox-gl";

/**
 * Check if destination is within deliverable distance using Mapbox Directions API
 * @param {number} shopLat - Shop latitude
 * @param {number} shopLon - Shop longitude  
 * @param {number} destLat - Destination latitude
 * @param {number} destLon - Destination longitude
 * @param {number} maxDistanceKm - Maximum deliverable distance in km (default 3km)
 * @returns {Promise<{deliverable: boolean, distanceKm: number, durationMinutes: number}>}
 */
export async function checkDeliveryDistance(shopLat, shopLon, destLat, destLon, maxDistanceKm = 3) {
  try {
    const accessToken = mapboxgl.accessToken || import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!accessToken) {
      console.error("Mapbox access token not found");
      return { deliverable: false, distanceKm: null, durationMinutes: null, error: "API token missing" };
    }

    // Using Directions API instead of Matrix API for single point-to-point
    // Format: lon,lat;lon,lat
    const coordinates = `${shopLon},${shopLat};${destLon},${destLat}`;
    
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error("Mapbox Directions API error:", data.message || "No route found");
      return { deliverable: false, distanceKm: null, durationMinutes: null, error: data.message || "No route found" };
    }

    // Extract distance in meters and duration in seconds from first route
    const route = data.routes[0];
    const distanceMeters = route.distance;
    const durationSeconds = route.duration;

    if (distanceMeters === undefined || distanceMeters === null) {
      return { deliverable: false, distanceKm: null, durationMinutes: null, error: "No route found" };
    }

    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds ? Math.round(durationSeconds / 60) : null;
    const deliverable = distanceKm <= maxDistanceKm;

    const result = {
      deliverable,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMinutes,
      error: null
    };

    // Debug console output
    console.log('🚗 Delivery Distance Check:');
    console.log(`📍 From: (${shopLat}, ${shopLon})`);
    console.log(`📍 To: (${destLat}, ${destLon})`);
    console.log(`📏 Distance: ${result.distanceKm} km`);
    console.log(`⏱️  Duration: ${result.durationMinutes} minutes`);
    console.log(`✅ Deliverable (max ${maxDistanceKm}km): ${result.deliverable ? 'YES' : 'NO'}`);
    console.log('---');

    return result;

  } catch (error) {
    console.error("Error checking delivery distance:", error);
    return { deliverable: false, distanceKm: null, durationMinutes: null, error: error.message };
  }
}

/**
 * Batch check delivery distance for multiple addresses
 * @param {number} shopLat - Shop latitude
 * @param {number} shopLon - Shop longitude
 * @param {Array} addresses - Array of address objects with lat/lon
 * @param {number} maxDistanceKm - Maximum deliverable distance in km
 * @returns {Promise<Array>} Array of addresses with deliverable status
 */
export async function checkMultipleDeliveryDistances(shopLat, shopLon, addresses, maxDistanceKm = 3) {
  try {
    const accessToken = mapboxgl.accessToken || import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!accessToken) {
      console.error("Mapbox access token not found");
      return addresses.map(addr => ({ ...addr, deliverable: false, error: "API token missing" }));
    }

    // Limit to 24 destinations (Mapbox limit is 25 total coordinates, 1 is origin)
    const limitedAddresses = addresses.slice(0, 24);

    // Format: origin;dest1;dest2;...
    const coords = [
      `${shopLon},${shopLat}`,
      ...limitedAddresses.map(addr => `${addr.lon},${addr.lat}`)
    ].join(';');

    const destinationIndices = limitedAddresses.map((_, i) => i + 1).join(';');
    
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords}?sources=0&destinations=${destinationIndices}&annotations=distance,duration&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok') {
      console.error("Mapbox Matrix API error:", data.message);
      return addresses.map(addr => ({ ...addr, deliverable: false, error: data.message }));
    }

    return limitedAddresses.map((addr, i) => {
      const distanceMeters = data.distances?.[0]?.[i];
      const durationSeconds = data.durations?.[0]?.[i];

      if (distanceMeters === undefined || distanceMeters === null) {
        return { ...addr, deliverable: false, distanceKm: null, durationMinutes: null, error: "No route" };
      }

      const distanceKm = distanceMeters / 1000;
      const deliverable = distanceKm <= maxDistanceKm;

      return {
        ...addr,
        deliverable,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        durationMinutes: durationSeconds ? Math.round(durationSeconds / 60) : null,
        error: null
      };
    });

  } catch (error) {
    console.error("Error checking multiple delivery distances:", error);
    return addresses.map(addr => ({ ...addr, deliverable: false, error: error.message }));
  }
}