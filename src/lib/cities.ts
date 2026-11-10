export type Continent = "Asia" | "Europe" | "North America";

export interface City {
  /** Stable slug used for keys and the active-marker state. */
  id: string;
  name: string;
  /** Country or territory the place sits in, for the map legend. */
  region: string;
  continent: Continent;
  latitude: number;
  longitude: number;
}

/**
 * The places behind "8 different cities across 3 continents" in the bio.
 */
export const CITIES: City[] = [
  {
    id: "hong-kong",
    name: "Hong Kong",
    region: "Hong Kong SAR",
    continent: "Asia",
    latitude: 22.3193,
    longitude: 114.1694,
  },
  {
    id: "taipei",
    name: "Taipei",
    region: "Taiwan",
    continent: "Asia",
    latitude: 25.033,
    longitude: 121.5654,
  },
  {
    id: "chengdu",
    name: "Chengdu",
    region: "China",
    continent: "Asia",
    latitude: 30.5728,
    longitude: 104.0668,
  },
  {
    id: "shanghai",
    name: "Shanghai",
    region: "China",
    continent: "Asia",
    latitude: 31.2304,
    longitude: 121.4737,
  },
  {
    id: "livingston",
    name: "Livingston",
    region: "New Jersey, USA",
    continent: "North America",
    latitude: 40.7959,
    longitude: -74.3151,
  },
  {
    id: "singapore",
    name: "Singapore",
    region: "Singapore",
    continent: "Asia",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    id: "bath",
    name: "Bath",
    region: "United Kingdom",
    continent: "Europe",
    latitude: 51.3811,
    longitude: -2.359,
  },
  {
    id: "swansea",
    name: "Swansea",
    region: "United Kingdom",
    continent: "Europe",
    latitude: 51.6214,
    longitude: -3.9436,
  },
];

export const CITY_COUNT = CITIES.length;

export interface ContinentGroup {
  continent: Continent;
  cities: City[];
}

/** Groups the places by continent, keeping the first-seen continent order. */
export function citiesByContinent(cities: City[] = CITIES): ContinentGroup[] {
  const groups = new Map<Continent, City[]>();

  for (const city of cities) {
    const existing = groups.get(city.continent) ?? [];
    existing.push(city);
    groups.set(city.continent, existing);
  }

  return Array.from(groups, ([continent, grouped]) => ({
    continent,
    cities: grouped,
  }));
}

export function continentCount(cities: City[] = CITIES): number {
  return new Set(cities.map((city) => city.continent)).size;
}

/** One sentence naming every place, for a tooltip. */
export function citiesNote(): string {
  return CITIES.map((city) => city.name).join(", ") + ".";
}
