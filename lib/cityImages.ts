import type { StaticImageData } from "next/image";
import chicago from "@/assets/cities/chicago.jpg";
import losAngeles from "@/assets/cities/los-angeles.jpg";
import miami from "@/assets/cities/miami.jpg";
import newYork from "@/assets/cities/new-york.jpg";
import sanFrancisco from "@/assets/cities/san-francisco.jpg";

export interface CityImage {
  src: StaticImageData;
  alt: string;
  photographer: string;
  sourceUrl: string;
}

// Photos from Unsplash (free under the Unsplash License). Keyed by the city
// name used in data/routes.csv; cities without a photo fall back to a color.
const CITY_IMAGES: Record<string, CityImage> = {
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
