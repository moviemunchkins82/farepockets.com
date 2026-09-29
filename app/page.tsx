import Link from "next/link";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { formatPrice } from "@/lib/format";

export const revalidate = 21600; // matches route pages; cron revalidation keeps it fresher

export default async function Home() {
  const routes = await listActiveRoutes();

  return (
    <main>
      <h1>Find cheap flights across the US</h1>
      <p>
        Compare fares and book through our travel partner. <Link href="/search">Search flights</Link>
      </p>

      <h2>Popular routes</h2>
      <ul>
        {routes.map((route) => {
          const price = formatPrice(route.cheapest_price, route.cheapest_currency);
          return (
            <li key={route.slug}>
              <Link href={`/flights/${route.slug}`}>
                {route.origin_city} to {route.destination_city}
                {price ? ` — from ${price}` : ""}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
