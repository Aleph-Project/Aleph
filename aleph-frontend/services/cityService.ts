import { authHttpClient } from '@/lib/httpClient';

export interface Country {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  country_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  country: Country;
}

const CITIES_API_URL = "/api/v1/profiles/cities";

export async function getAllCities(): Promise<City[]> {
  const response = await authHttpClient.get(CITIES_API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener las ciudades");
  }

  return response.json();
}