import { listActiveRoutes } from "@/lib/db/queries/routes";
import type { AirportGroup } from "@/lib/signup";
import SignupForm from "@/components/signup/SignupForm";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// Departure cities we track, grouped by country (most routes first), for the
// optional "Flying from" field. A database outage just drops the field.
async function airportGroups(): Promise<AirportGroup[]> {
  try {
    const counts = new Map<string, Map<string, number>>();
    for (const route of await listActiveRoutes()) {
      const country = route.origin_country.trim();
      const cities = counts.get(country) ?? new Map<string, number>();
      cities.set(route.origin_city, (cities.get(route.origin_city) ?? 0) + 1);
      counts.set(country, cities);
    }
    return [...counts.entries()]
      .map(([country, cities]) => ({
        label: regionNames.of(country) ?? country,
        total: [...cities.values()].reduce((a, b) => a + b, 0),
        cities: [...cities.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([c]) => c),
      }))
      .sort((a, b) => b.total - a.total)
      .map(({ label, cities }) => ({ label, cities }));
  } catch {
    return [];
  }
}

export default async function SignupBox(props: {
  variant?: "card" | "footer";
  heading?: string;
  intro?: string;
}) {
  return <SignupForm airportGroups={await airportGroups()} {...props} />;
}
