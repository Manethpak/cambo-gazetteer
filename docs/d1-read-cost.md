# D1 read amplification fix

The supplied production analytics identify two expensive operations:

- 196 type-filtered list queries with ordering and OFFSET read 5.61M rows.
- 146 type-filtered COUNT queries read 1.78M rows.

The old indexes filter by type but cannot also satisfy `ORDER BY code`.
SQLite reads the matching rows and builds a temporary sort before applying LIMIT.
The new `(type, code)` index supplies the requested order directly. The additional
`(type, parent_code, code)` index covers lists filtered by parent.

A local Miniflare D1 regression fixture containing 14,570 villages reproduces
29,140 rows read for the old first-page query versus 20 with the new index,
with identical results. This is a local measurement, not a production forecast.
Deep OFFSET pages still read skipped index entries; sequential bulk consumers
should use the downloadable dataset. Cursor pagination is a possible future API extension.

The API now caches counts separately for four hours, keyed by type and parent,
so requesting a different page does not repeat COUNT. Out-of-range pages skip
the data query. Cache failures fall back to a database count. Counts may be stale
within the TTL; purge the response and count caches or bump their versioned
names after a dataset refresh. Cache API entries are local to each Cloudflare
location and may be evicted, so cold requests still execute COUNT.

Response cache keys retain endpoint-specific parameters and ignore unrelated
parameters such as timestamps. Stats queries also use one grouped count rather
than six separate queries. Successful API response shapes are unchanged.

Native Workers rate limits apply before response caching:

| Scope | Requests per 60 seconds per IP |
| --- | --- |
| All `/api/*` requests | 120 |
| Search and autocomplete combined | 30 |
| Coordinate lookup | 20 |

The narrower quotas also count against the overall quota. OPTIONS is exempt.
There is no Origin/Referer bypass. Only Cloudflare's `CF-Connecting-IP` identifies
clients; missing IPs share an `unknown` quota. Rejected requests return 429,
`Retry-After: 60`, and `Cache-Control: no-store`.
These limits are approximate and local to a Cloudflare location, not a global
D1 spending cap. Users sharing a public IP share the quota. The binding namespace
IDs in wrangler.json must be unique to this application within the account.

## Validation

```sh
pnpm exec tsx --tsconfig tsconfig.worker.json scripts/verify-d1-read-cost.ts
pnpm exec tsc -b
pnpm check
pnpm lint
```

The verification script uses an isolated Miniflare database and checks query
plans, read reduction, result equivalence, count reuse, parent separation,
out-of-range pages, cache keys, and spoofed-header rate-limit bypasses.

## Production rollout

Local validation does not deploy the Worker or migrate production. Apply the
index migration before deploying the API:

```sh
pnpm db:migrate:remote
pnpm build
pnpm deploy
```

Building indexes incurs a one-time database write cost. After rollout, verify
`EXPLAIN QUERY PLAN SELECT * FROM administrative_units WHERE type = 'village'
ORDER BY code LIMIT 20 OFFSET 0` uses `type_code_idx`, and compare rows read for
the same query shapes in D1 analytics. Count queries should become much less
frequent across page changes. Watch Worker logs for 429s and count-cache errors.

References: [D1 indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/),
[Workers rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/),
[Cache API behavior](https://developers.cloudflare.com/workers/runtime-apis/cache/).
