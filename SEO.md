# SEO tracker: Hon. Gabriel Gathuka Kagombe website

Living record of the site's search setup. Updated whenever pages, content or settings change.
Last updated: 30 October 2026.

## Status at a glance

| Area | Status | Notes |
|---|---|---|
| Page titles and descriptions | Done | Every page, generated from the content (`src/lib/seo.js`). |
| Link previews (WhatsApp, Facebook, X) | Done, needs domain | Share image per page; the full image address needs `siteUrl`. |
| Prerendered pages | Done | `npm run build` writes one HTML file per page with its tags and heading (44 pages). |
| Structured data (schema.org) | Done | Person + WebSite (home), Person (About), Event (dated events), breadcrumbs (all inner pages). |
| sitemap.xml with images | Ready, needs domain | Written at build time once `siteUrl` is set: 44 pages, 157 photos. |
| robots.txt | Done | `/admin` blocked; sitemap line added once `siteUrl` is set. |
| Dashboard and 404 pages | Done | `noindex`. |
| Canonical links | Ready, needs domain | Added once `siteUrl` is set. |
| Google Search Console | To do | Verify, submit sitemap. |
| Bing Webmaster Tools | To do | Import from Search Console. |
| Google Business Profile (constituency office) | To do | Needs the office address and phone. |

## Settings (site.config.js)

- `siteUrl`: the live address, e.g. `https://www.example.co.ke` (no slash at the end). **Not set yet.**
- `seo.googleSiteVerification`: from Search Console, HTML-tag method (the `content` value only).
- `seo.bingSiteVerification`: from Bing Webmaster Tools.

After changing them: `npm run build` and deploy.

## Search terms the site targets

Name searches: Gabriel Kagombe · GG Kagombe · Gabriel Gathuka Kagombe · Kagombe Gabriel Gathuka (Parliament spelling) · Hon. Kagombe.
Role searches: Gatundu South MP · Member of Parliament Gatundu South · Gatundu South constituency.
Work searches: Gatundu South NG-CDF · Gatundu South projects · Gatundu South bursaries · [school name] Primary School Gatundu (11 schools) · Gathage · Kiamwangi Ajira centre · Gatundu water project · Gatundu affordable housing · KMTC Gatundu · tea sector / KTDA.

## How it works

- `src/lib/seo.js`: one place that decides each page's title, description, image and structured data.
- `src/lib/useSeo.js`: applies them in the browser as visitors move between pages. This also covers projects and events added later in the dashboard.
- `scripts/prerender.mjs`: runs after `vite build`. Writes `about.html`, `events/<id>.html` and so on, plus `sitemap.xml` and `robots.txt`. It prints warnings for titles over 70 characters, short descriptions and duplicates.
- Project and event pages use their first photo as the share image. Long titles can be shortened for Google with the dashboard's *Short title for Google* field (`seoTitle`).
- `public/og-default.jpg`: the share image for pages without their own photo (1200×630).

## Known limits

- Projects and events added **only in the dashboard** are not in `sitemap.xml` or the prerendered files until they are also added to `src/data/content.js` and the site is rebuilt. Google still finds them through the site's links and reads their tags in the browser, but WhatsApp/Facebook previews of those pages show the site-wide image and text.
- Photos uploaded in the dashboard are stored inside the database, so they cannot be used as share images; built-in photos can.
- No portrait photo yet: the home and About share image is `og-default.jpg`.

## Next steps

1. Set `siteUrl` once the domain is known, rebuild, deploy.
2. Search Console: add the property, verify with the HTML tag, submit `/sitemap.xml`, request indexing for the home page.
3. Link the site from his Facebook, Instagram, X and LinkedIn bios and from the Parliament / Mzalendo profiles where possible. These links are the strongest early signals.
4. Add the constituency office address and phone (Contact) and create a Google Business Profile for the office.
5. Add a portrait and a vision statement (both strengthen the home and About pages).
6. Keep adding events and projects with photos and real dates; each one is a new page that can rank for local searches.

## Change log

- **30 Oct 2026**: SEO set up: per-page titles and descriptions, share tags, structured data, prerendered pages, sitemap with images, robots.txt, default share image, `seoTitle` field in the dashboard for Projects and Events. 44 pages, no warnings.
