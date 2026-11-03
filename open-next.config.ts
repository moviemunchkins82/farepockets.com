import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages are prerendered at build time and served from Workers static assets:
// free, and almost no CPU per request (the free plan allows 10 ms). The cache is
// read-only, so prices on pages update by redeploying after a price refresh
// rather than by revalidation. Forms and click logging still run on the Worker
// as normal.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
