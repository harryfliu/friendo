// Geocoding service using Nominatim (OpenStreetMap's free geocoding service)
// No API key required, but has rate limits (1 request per second)

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  confidence: number;
}

export interface GeocodingError {
  error: string;
  message: string;
}

// Cache for geocoding results to avoid duplicate API calls
const geocodingCache = new Map<string, GeocodingResult | GeocodingError>();

// Rate limiting: Nominatim allows 1 request per second
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second

export async function geocodeAddress(
  city?: string,
  state?: string,
  country?: string
): Promise<GeocodingResult | GeocodingError> {
  // Build address string
  const addressParts = [];
  if (city) addressParts.push(city);
  if (state) addressParts.push(state);
  if (country) addressParts.push(country);
  
  if (addressParts.length === 0) {
    return {
      error: 'INVALID_ADDRESS',
      message: 'At least one address component (city, state, or country) is required'
    };
  }

  const addressString = addressParts.join(', ');
  
  // Check cache first
  if (geocodingCache.has(addressString)) {
    const cached = geocodingCache.get(addressString)!;
    console.log(`🗺️ Using cached geocoding result for: ${addressString}`);
    return cached;
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    const delay = REQUEST_DELAY - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${delay}ms before geocoding request`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  try {
    console.log(`🌍 Geocoding address: ${addressString}`);
    
    // Use Nominatim geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(addressString)}&` +
      `format=json&` +
      `limit=1&` +
      `addressdetails=1&` +
      `extratags=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    lastRequestTime = Date.now();

    if (!data || data.length === 0) {
      const error: GeocodingError = {
        error: 'NO_RESULTS',
        message: `No results found for address: ${addressString}`
      };
      geocodingCache.set(addressString, error);
      return error;
    }

    const result = data[0];
    const geocodingResult: GeocodingResult = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
      confidence: parseFloat(result.importance) || 0
    };

    // Cache the result
    geocodingCache.set(addressString, geocodingResult);
    
    console.log(`✅ Geocoding successful: ${addressString} -> [${geocodingResult.lat}, ${geocodingResult.lng}]`);
    return geocodingResult;

  } catch (error) {
    console.error('❌ Geocoding error:', error);
    const geocodingError: GeocodingError = {
      error: 'GEOCODING_FAILED',
      message: error instanceof Error ? error.message : 'Unknown geocoding error'
    };
    geocodingCache.set(addressString, geocodingError);
    return geocodingError;
  }
}

// Helper function to clear the cache (useful for testing)
export function clearGeocodingCache(): void {
  geocodingCache.clear();
  console.log('🗑️ Geocoding cache cleared');
}

// Helper function to get cache size (useful for debugging)
export function getGeocodingCacheSize(): number {
  return geocodingCache.size;
}
