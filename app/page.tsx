import Link from "next/link";
import { listActiveRoutes } from "@/lib/db/queries/routes";

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
        {routes.map((route) => (
          <li key={route.slug}>
            <Link href={`/flights/${route.slug}`}>
              {route.origin_city} to {route.destination_city}
              {route.cheapest_price ? ` — from $${route.cheapest_price}` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
