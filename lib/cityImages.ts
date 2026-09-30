import type { StaticImageData } from "next/image";
import atlanta from "@/assets/cities/atlanta.jpg";
import boston from "@/assets/cities/boston.jpg";
import chicago from "@/assets/cities/chicago.jpg";
import dallas from "@/assets/cities/dallas.jpg";
import denver from "@/assets/cities/denver.jpg";
import lasVegas from "@/assets/cities/las-vegas.jpg";
import losAngeles from "@/assets/cities/los-angeles.jpg";
import miami from "@/assets/cities/miami.jpg";
import newYork from "@/assets/cities/new-york.jpg";
import orlando from "@/assets/cities/orlando.jpg";
import sanFrancisco from "@/assets/cities/san-francisco.jpg";
import seattle from "@/assets/cities/seattle.jpg";
import washingtonDc from "@/assets/cities/washington-dc.jpg";

export interface CityImage {
  src: StaticImageData;
  alt: string;
  photographer: string;
  sourceUrl: string;
}

// Photos from Unsplash (free under the Unsplash License). Keyed by the city
// name used in data/routes.csv; cities without a photo fall back to a color.
const CITY_IMAGES: Record<string, CityImage> = {
  Atlanta: {
    src: atlanta,
    alt: "Downtown Atlanta skyscrapers under a clear sky",
    photographer: "Marianna Smiley",
    sourceUrl: "https://unsplash.com/photos/y3BBVEpMl4E",
  },
  Boston: {
    src: boston,
    alt: "Boston skyline across the water at sunset",
    photographer: "Alex S.",
    sourceUrl: "https://unsplash.com/photos/e5ZRWZizFF4",
  },
  Dallas: {
    src: dallas,
    alt: "Downtown Dallas skyline reflected in still water at dusk",
    photographer: "Max Fray",
    sourceUrl: "https://unsplash.com/photos/XrvijafWAH8",
  },
  Denver: {
    src: denver,
    alt: "Downtown Denver towers and clock tower at golden hour",
    photographer: "Joshua Woroniecki",
    sourceUrl: "https://unsplash.com/photos/hoUDqHwhhfw",
  },
  "Las Vegas": {
    src: lasVegas,
    alt: "The Las Vegas Strip lit up at night",
    photographer: "Meg von Haartman",
    sourceUrl: "https://unsplash.com/photos/K2LItTZ5x08",
  },
  Orlando: {
    src: orlando,
    alt: "Downtown Orlando buildings under a bright sky",
    photographer: "Alicia Morency",
    sourceUrl: "https://unsplash.com/photos/89jaBMKAVFs",
  },
  Seattle: {
    src: seattle,
    alt: "Seattle skyline with the Space Needle and Mount Rainier",
    photographer: "Brian Zhu",
    sourceUrl: "https://unsplash.com/photos/-0ns9jRJPCc",
  },
  "Washington DC": {
    src: washingtonDc,
    alt: "The US Capitol building in Washington DC",
    photographer: "Ioana Ye",
    sourceUrl: "https://unsplash.com/photos/yZQDXSp6a5I",
  },
  Chicago: {
    src: chicago,
    alt: "Chicago skyline seen across Lake Michigan on a sunny day",
    photographer: "Raja Patel",
    sourceUrl: "https://unsplash.com/photos/fnfR9uWA8RI",
  },
  "Los Angeles": {
    src: losAngeles,
    alt: "Palm trees in front of the downtown Los Angeles skyline at golden hour",
    photographer: "Cedric Letsch",
    sourceUrl: "https://unsplash.com/photos/UZVlSjrIJ3o",
  },
  Miami: {
    src: miami,
    alt: "Miami high-rises beside the water on a sunny day",
    photographer: "Walter Martin",
    sourceUrl: "https://unsplash.com/photos/q1nNO45iDtY",
  },
  "New York": {
    src: newYork,
    alt: "Lower Manhattan skyline across the Hudson River",
    photographer: "Ana Soares",
    sourceUrl: "https://unsplash.com/photos/jXOEy0rKWeU",
  },
  "San Francisco": {
    src: sanFrancisco,
    alt: "Golden Gate Bridge over blue water in San Francisco",
    photographer: "Maarten van den Heuvel",
    sourceUrl: "https://unsplash.com/photos/gZXx8lKAb7Y",
  },
};

export function getCityImage(city: string): CityImage | null {
  return CITY_IMAGES[city] ?? null;
}
