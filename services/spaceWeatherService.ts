import { CMEData, APODData, CMEAnalysisData } from '../types';

// Use NASA's public DEMO_KEY for its APIs to resolve the 403 Forbidden error.
// This separates it from the Gemini API key which is handled via environment variables.
const NASA_API_KEY = 'nP74aIVdn9T0K1TlZBJBevRwL3Rmke1enbrbzRGu';
const CME_BASE_URL = 'https://api.nasa.gov/DONKI/CME';
const CME_ANALYSIS_BASE_URL = 'https://api.nasa.gov/DONKI/CMEAnalysis';
const APOD_BASE_URL = 'https://api.nasa.gov/planetary/apod';

export interface CMEAnalysisFilters {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  mostAccurateOnly: boolean;
  speed: number;
  halfAngle: number;
  catalog: 'ALL' | 'SWRC_CATALOG' | 'JANG_ET_AL_CATALOG';
}

export const getRecentCMEs = async (): Promise<CMEData[]> => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const url = `${CME_BASE_URL}?startDate=${formatDate(sevenDaysAgo)}&endDate=${formatDate(today)}&api_key=${NASA_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Gracefully handle the "Too Many Requests" error from using a shared key.
      if (response.status === 429) {
        console.warn("NASA API rate limit reached. Using fallback data. For a stable connection, please provide a API_KEY environment variable.");
        return []; // Return empty array to prevent app from breaking
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as CMEData[];
  } catch (error) {
    console.error("Could not fetch space weather data:", error instanceof Error ? error.message : String(error));
    // Return empty array as fallback to prevent app crashes
    return [];
  }
};

export const getAPOD = async (forceRefresh: boolean = false): Promise<APODData> => {
  const cacheKey = 'apodData';

  if (!forceRefresh) {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as APODData;
      } catch (e) {
        console.error("Failed to parse cached APOD data", e);
        sessionStorage.removeItem(cacheKey); // Clear corrupted cache
      }
    }
  }

  const fallbackAPOD: APODData = {
    title: 'Stunning Star-Forming Region',
    date: new Date().toISOString().split('T')[0],
    explanation: "This stunning image showcases the intricate dust lanes and vibrant star-forming regions of a distant nebula. While we couldn't fetch today's live picture from NASA due to high traffic, please enjoy this classic view of our magnificent cosmos.",
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto-format=fit-crop',
    hdurl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto-format=fit-crop',
    media_type: 'image',
    service_version: 'v1',
    copyright: 'NASA, ESA, CSA, STScI',
  };
  
  // Fetch a random picture by using the `count` parameter.
  const url = `${APOD_BASE_URL}?api_key=${NASA_API_KEY}&count=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
          console.warn("NASA APOD API rate limit reached. Using fallback data.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // The API returns an array of one when using 'count'.
    const apodResult = data[0] as APODData;

    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(apodResult));
    } catch (e) {
        console.error("Could not cache APOD data", e);
    }
    
    return apodResult;
  } catch (error) {
    console.error("Could not fetch APOD data, using fallback:", error instanceof Error ? error.message : String(error));
    // Return a fallback object on any error to ensure the UI remains stable.
    return fallbackAPOD;
  }
};

export const getCMEAnalysis = async (filters: CMEAnalysisFilters): Promise<CMEAnalysisData[]> => {
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    mostAccurateOnly: String(filters.mostAccurateOnly),
    speed: String(filters.speed),
    halfAngle: String(filters.halfAngle),
    catalog: filters.catalog,
    api_key: NASA_API_KEY,
  });

  const url = `${CME_ANALYSIS_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
       if (response.status === 429) {
        console.warn("NASA API rate limit reached. For a stable connection, please provide an API_KEY environment variable.");
        return [];
      }
      // The API returns a 400 with a message if dates are bad or too far apart.
      const errorData = await response.json();
      throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as CMEAnalysisData[];
  } catch (error) {
    console.error("Could not fetch CME analysis data:", error instanceof Error ? error.message : String(error));
    throw error; // Re-throw to be handled by the component
  }
};