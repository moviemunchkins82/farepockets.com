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
import bristol from "@/assets/cities/bristol.jpg";
import liverpool from "@/assets/cities/liverpool.jpg";
import osh from "@/assets/cities/osh.jpg";
import antalya from "@/assets/cities/antalya.jpg";
import dalaman from "@/assets/cities/dalaman.jpg";
import bodrum from "@/assets/cities/bodrum.jpg";
import izmir from "@/assets/cities/izmir.jpg";
import tbilisi from "@/assets/cities/tbilisi.jpg";
import kutaisi from "@/assets/cities/kutaisi.jpg";
import batumi from "@/assets/cities/batumi.jpg";
import baku from "@/assets/cities/baku.jpg";
import yerevan from "@/assets/cities/yerevan.jpg";
import tashkent from "@/assets/cities/tashkent.jpg";
import samarkand from "@/assets/cities/samarkand.jpg";
import almaty from "@/assets/cities/almaty.jpg";
import astana from "@/assets/cities/astana.jpg";
import birmingham from "@/assets/cities/birmingham.jpg";
import london from "@/assets/cities/london.jpg";
import manchester from "@/assets/cities/manchester.jpg";
import edinburgh from "@/assets/cities/edinburgh.jpg";
import belfast from "@/assets/cities/belfast.jpg";
import glasgow from "@/assets/cities/glasgow.jpg";
import dublin from "@/assets/cities/dublin.jpg";
import amsterdam from "@/assets/cities/amsterdam.jpg";
import barcelona from "@/assets/cities/barcelona.jpg";
import madrid from "@/assets/cities/madrid.jpg";
import malaga from "@/assets/cities/malaga.jpg";
import alicante from "@/assets/cities/alicante.jpg";
import palmaDeMallorca from "@/assets/cities/palma-de-mallorca.jpg";
import paris from "@/assets/cities/paris.jpg";
import rome from "@/assets/cities/rome.jpg";
import lisbon from "@/assets/cities/lisbon.jpg";
import istanbul from "@/assets/cities/istanbul.jpg";
import faro from "@/assets/cities/faro.jpg";
import athens from "@/assets/cities/athens.jpg";
import dubai from "@/assets/cities/dubai.jpg";
import doha from "@/assets/cities/doha.jpg";
import delhi from "@/assets/cities/delhi.jpg";
import mumbai from "@/assets/cities/mumbai.jpg";
import singapore from "@/assets/cities/singapore.jpg";
import toronto from "@/assets/cities/toronto.jpg";
import hongKong from "@/assets/cities/hong-kong.jpg";

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
  London: {
    src: london,
    alt: "Tower Bridge and the Shard at sunset in London",
    photographer: "David Monaghan",
    sourceUrl: "https://unsplash.com/photos/J-wEJwSiAbQ",
  },
  Manchester: {
    src: manchester,
    alt: "Rooftop view over Manchester city centre",
    photographer: "Will McCue",
    sourceUrl: "https://unsplash.com/photos/1jZbU_XuyvU",
  },
  Edinburgh: {
    src: edinburgh,
    alt: "The Balmoral clock tower and Scott Monument in Edinburgh at golden hour",
    photographer: "Adam Wilson",
    sourceUrl: "https://unsplash.com/photos/ktDODr-3tvY",
  },
  Belfast: {
    src: belfast,
    alt: "Titanic Belfast and the shipyard cranes on the Belfast waterfront",
    photographer: "K. Mitch Hodge",
    sourceUrl: "https://unsplash.com/photos/znItvqcLmJA",
  },
  Glasgow: {
    src: glasgow,
    alt: "The Hydro, SEC Armadillo and Finnieston Crane reflected in the River Clyde",
    photographer: "Phil Reid",
    sourceUrl: "https://unsplash.com/photos/xKdTulV46F0",
  },
  Dublin: {
    src: dublin,
    alt: "The Ha'penny Bridge over the River Liffey in Dublin",
    photographer: "Sophie Popplewell",
    sourceUrl: "https://unsplash.com/photos/blDB0HbjB1k",
  },
  Amsterdam: {
    src: amsterdam,
    alt: "Boats moored along a tree-lined canal in Amsterdam",
    photographer: "Adrien Olichon",
    sourceUrl: "https://unsplash.com/photos/QRtym77B6xk",
  },
  Barcelona: {
    src: barcelona,
    alt: "Aerial view of Barcelona's Eixample grid around the Sagrada Familia",
    photographer: "Logan Armstrong",
    sourceUrl: "https://unsplash.com/photos/hVhfqhDYciU",
  },
  Madrid: {
    src: madrid,
    alt: "The Metropolis building and Gran Via in Madrid at sunset",
    photographer: "Florian Wehde",
    sourceUrl: "https://unsplash.com/photos/WBGjg0DsO_g",
  },
  Malaga: {
    src: malaga,
    alt: "Malaga Cathedral rising above the city's rooftops",
    photographer: "Yuliya Matuzava",
    sourceUrl: "https://unsplash.com/photos/Nx0C3cDKRLw",
  },
  Alicante: {
    src: alicante,
    alt: "Santa Barbara Castle above the port of Alicante",
    photographer: "Dean Milenkovic",
    sourceUrl: "https://unsplash.com/photos/Ih5MQMqPjQ8",
  },
  "Palma de Mallorca": {
    src: palmaDeMallorca,
    alt: "Palma Cathedral above the palm-lined waterfront in Palma de Mallorca",
    photographer: "Tom Podmore",
    sourceUrl: "https://unsplash.com/photos/SaW5DBItJHI",
  },
  Paris: {
    src: paris,
    alt: "The Eiffel Tower against a blue sky in Paris",
    photographer: "Anthony Delanoix",
    sourceUrl: "https://unsplash.com/photos/Q0-fOL2nqZc",
  },
  Rome: {
    src: rome,
    alt: "The Colosseum in Rome at dusk",
    photographer: "David Köhler",
    sourceUrl: "https://unsplash.com/photos/VFRTXGw1VjU",
  },
  Lisbon: {
    src: lisbon,
    alt: "A yellow tram on a street of historic buildings in Lisbon",
    photographer: "Aayush Gupta",
    sourceUrl: "https://unsplash.com/photos/ljhCEaHYWJ8",
  },
  Istanbul: {
    src: istanbul,
    alt: "The Galata Tower rising above the rooftops of Istanbul",
    photographer: "Anna Berdnik",
    sourceUrl: "https://unsplash.com/photos/0n0AHB1fgTQ",
  },
  Faro: {
    src: faro,
    alt: "Boats moored in the marina in Faro, Portugal",
    photographer: "KOBU Agency",
    sourceUrl: "https://unsplash.com/photos/piAkOiQfYXg",
  },
  Athens: {
    src: athens,
    alt: "The Acropolis of Athens at golden hour",
    photographer: "Constantinos Kollias",
    sourceUrl: "https://unsplash.com/photos/yqBvJJ8jGBQ",
  },
  Dubai: {
    src: dubai,
    alt: "The Burj Khalifa above the Downtown Dubai skyline under storm clouds",
    photographer: "Ahmed Aldaie",
    sourceUrl: "https://unsplash.com/photos/aKj9uDanF18",
  },
  Doha: {
    src: doha,
    alt: "Traditional dhow boats near the Museum of Islamic Art in Doha",
    photographer: "Hongbin",
    sourceUrl: "https://unsplash.com/photos/1UF8ddEalwk",
  },
  Delhi: {
    src: delhi,
    alt: "India Gate in New Delhi under a pink evening sky",
    photographer: "shalender kumar",
    sourceUrl: "https://unsplash.com/photos/XjKaPInYVCM",
  },
  Mumbai: {
    src: mumbai,
    alt: "The Gateway of India and the Taj Mahal Palace hotel on the Mumbai waterfront",
    photographer: "Renzo D'souza",
    sourceUrl: "https://unsplash.com/photos/MxabbMSLr_M",
  },
  Singapore: {
    src: singapore,
    alt: "Marina Bay Sands and the ArtScience Museum in Singapore",
    photographer: "Hu Chen",
    sourceUrl: "https://unsplash.com/photos/__cBlRzLSTg",
  },
  Toronto: {
    src: toronto,
    alt: "The CN Tower and Toronto skyline at night",
    photographer: "Jochem Raat",
    sourceUrl: "https://unsplash.com/photos/s0grRYEDaL4",
  },
  "Hong Kong": {
    src: hongKong,
    alt: "The Hong Kong skyline across Victoria Harbour at golden hour",
    photographer: "Manson",
    sourceUrl: "https://unsplash.com/photos/4vf1KEkD7Gc",
  },
  Antalya: {
    src: antalya,
    alt: "The old harbour and Kaleiçi old town in Antalya",
    photographer: "Ant Rozetsky",
    sourceUrl: "https://unsplash.com/photos/K6pcgoxD0yw",
  },
  Dalaman: {
    src: dalaman,
    alt: "A pine-covered bay on the coast near Dalaman",
    photographer: "Seval Torun",
    sourceUrl: "https://unsplash.com/photos/Fv3CvLHxiJA",
  },
  Bodrum: {
    src: bodrum,
    alt: "Bodrum Castle above yachts in the marina",
    photographer: "Ilker Ozmen",
    sourceUrl: "https://unsplash.com/photos/c6N40LBbCus",
  },
  Izmir: {
    src: izmir,
    alt: "The Izmir Clock Tower in Konak Square",
    photographer: "Mehmet Korkmaz",
    sourceUrl: "https://unsplash.com/photos/4T9AXWrh8q8",
  },
  Tbilisi: {
    src: tbilisi,
    alt: "Aerial view of Tbilisi old town and the Mtkvari river",
    photographer: "K T",
    sourceUrl: "https://unsplash.com/photos/xVLdFIxcDCc",
  },
  Kutaisi: {
    src: kutaisi,
    alt: "Bagrati Cathedral on a hill above Kutaisi",
    photographer: "Tomáš Malík",
    sourceUrl: "https://unsplash.com/photos/UtVi_VUXJPk",
  },
  Batumi: {
    src: batumi,
    alt: "The Batumi skyline along the Black Sea coast",
    photographer: "Max",
    sourceUrl: "https://unsplash.com/photos/R68FdCxFOII",
  },
  Baku: {
    src: baku,
    alt: "The Flame Towers rising above Baku",
    photographer: "Lloyd Alozie",
    sourceUrl: "https://unsplash.com/photos/CqwICExDNu4",
  },
  Yerevan: {
    src: yerevan,
    alt: "Mount Ararat behind the Yerevan skyline",
    photographer: "Gor Davtyan",
    sourceUrl: "https://unsplash.com/photos/a0nX79KYqNo",
  },
  Tashkent: {
    src: tashkent,
    alt: "Modern high-rises on the Tashkent skyline",
    photographer: "ZBS",
    sourceUrl: "https://unsplash.com/photos/Fu7Xar6MAhU",
  },
  Samarkand: {
    src: samarkand,
    alt: "The Registan in Samarkand",
    photographer: "Hans-Jürgen Weinhardt",
    sourceUrl: "https://unsplash.com/photos/JRpE5XBwlg0",
  },
  Almaty: {
    src: almaty,
    alt: "Almaty below the Trans-Ili Alatau mountains",
    photographer: "Ilyas Dautov",
    sourceUrl: "https://unsplash.com/photos/ljw3mBWuwTA",
  },
  Astana: {
    src: astana,
    alt: "The Bayterek Tower in Astana",
    photographer: "Tim Broadbent",
    sourceUrl: "https://unsplash.com/photos/zeuo_RU2954",
  },
  Birmingham: {
    src: birmingham,
    alt: "Victorian buildings in Birmingham city centre",
    photographer: "Adam Jones",
    sourceUrl: "https://unsplash.com/photos/OplwWjC8RRM",
  },
  Bristol: {
    src: bristol,
    alt: "The Clifton Suspension Bridge above the Avon Gorge in Bristol",
    photographer: "Korng Sok",
    sourceUrl: "https://unsplash.com/photos/UR8LnDmipiE",
  },
  Liverpool: {
    src: liverpool,
    alt: "The Royal Liver Building and the Three Graces on Liverpool's waterfront",
    photographer: "Chris Boland",
    sourceUrl: "https://unsplash.com/photos/vAlcgthBaUA",
  },
  Osh: {
    src: osh,
    alt: "Rocky mountains above a green valley near Osh, Kyrgyzstan",
    photographer: "Dastan Suiuntbekov",
    sourceUrl: "https://unsplash.com/photos/zEA5f3zSR4c",
  },
};

export function getCityImage(city: string): CityImage | null {
  return CITY_IMAGES[city] ?? null;
}
