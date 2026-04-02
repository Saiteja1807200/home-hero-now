

## SEO Visibility Plan for Home Hero

Your `robots.txt` is already in place and correctly allows all crawlers. Here's what else we should do to maximize Google visibility:

### What's already good
- `robots.txt` with `Allow: /` for all user agents — done
- Open Graph and Twitter Card meta tags — done
- Good title and description — done

### Changes to implement

**1. Add a sitemap to `robots.txt`**
Add a `Sitemap:` directive pointing to `/sitemap.xml` so search engines discover all pages.

**2. Create `public/sitemap.xml`**
A static sitemap listing all public routes (`/`, `/services`, `/auth`, etc.) with your published domain `https://home-herohub.lovable.app`.

**3. Add `og:url` and canonical link to `index.html`**
- `<link rel="canonical" href="https://home-herohub.lovable.app/" />` — prevents duplicate content issues
- `<meta property="og:url" content="https://home-herohub.lovable.app/" />` — completes OG tags

**4. Add structured data (JSON-LD) to `index.html`**
Add a `LocalBusiness` / `WebApplication` schema so Google shows rich results (service type, description, etc.).

**5. Add keyword-rich meta tags**
Add `<meta name="keywords">` with relevant terms like "home services, plumber near me, electrician booking, AC repair, cleaning services".

### Beyond code changes (manual steps)
- **Submit sitemap to Google Search Console** at `https://search.google.com/search-console` — add your published URL and submit the sitemap
- **Connect a custom domain** — `lovable.app` subdomains work but a branded domain (e.g., `homehero.in`) ranks better
- **Add your business to Google Business Profile** if you serve a specific area

### Files changed
| File | Change |
|------|--------|
| `public/robots.txt` | Add `Sitemap:` directive |
| `public/sitemap.xml` | New — lists all public routes |
| `index.html` | Add canonical, og:url, JSON-LD structured data, keywords meta |

