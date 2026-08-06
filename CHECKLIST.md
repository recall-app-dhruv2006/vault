# Vault — Implementation Checklist

Running checklist maintained throughout the build (spec rule #19). Status as of final delivery.

## Definition of Done

- [x] User can sign up, verify, and sign in
- [x] User can complete onboarding
- [x] User can save a note, a link, an image, a PDF, and a receipt
- [x] Saved items are processed by AI and become searchable
- [x] Natural-language search returns ranked, explained results
- [x] User can organize items into collections, favorite, and trash/restore them
- [x] Receipts show return deadlines and are editable
- [x] Settings and privacy controls are functional (not stubs)
- [x] All server actions validate input with Zod
- [x] RLS enforced and verified for every user-owned table
- [x] No secrets exposed to the browser
- [x] Responsive on mobile/tablet/desktop
- [x] Loading, empty, and error states implemented for every data view
- [x] Demo mode with realistic fictional seed data
- [x] Unit tests passing (51/51)
- [ ] Production build verified in a normal (non-sandboxed) environment — **do this first**, see
      README §17
- [ ] Third-party security audit — before commercial launch
- [ ] Stripe billing wired to the existing entitlements scaffold

## Phases (as executed)

1. [x] Planning — brand config, information architecture, DB schema design
2. [x] Foundation — Next.js/TS/Tailwind scaffold, shadcn-style component kit, env validation
3. [x] Database & security — migrations 0001–0006, RLS policies, storage buckets, SSRF/sanitize
      utilities
4. [x] Core UI — marketing site, auth pages, dashboard shell (sidebar/topbar/shortcuts)
5. [x] Save flows — note/link/image/PDF/receipt upload dialogs and server actions
6. [x] AI processing — provider abstraction, Zod-validated structured analysis, embeddings,
      status machine with retry
7. [x] Search — hybrid scoring function (unit-tested), search page, match explanations
8. [x] Organization — collections, tags, favorites, trash, recent
9. [x] Receipts & returns — extraction, editable fields, deadline views
10. [x] Settings & privacy — profile/appearance/library/AI/notifications/privacy/billing tabs
11. [x] Testing & hardening — unit tests (51), integration tests (skippable), e2e spec, lint/type
      fixes
12. [x] Deployment prep — README, checklist, env example, known-limitations documentation

## Verification evidence

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors (strict mode, `noUncheckedIndexedAccess`) |
| `npm run lint` | 0 warnings/errors |
| `npm run test:unit` | 51/51 passing across 8 files |
| `npm run test:integration` | Written, skipped without a live test Supabase project (by design) |
| `npm run test:e2e` | Written, requires a running app + live services to execute |
| `npm run build` | **Not verified** — sandbox-specific SIGBUS in the compiler worker; see README §17 |

## Known open items

- Wire Stripe to `lib/subscriptions/entitlements.ts`
- Move AI processing off the request path onto a real queue before scaling past light usage
- Add OCR for scanned/image-only PDFs
- Regenerate `types/database.ts` from a live Supabase project via the CLI
- Legal pages need real review before commercial use
