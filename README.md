# Hon. Gabriel Gathuka Kagombe: official website

Multi-page React + Vite site for the Member of Parliament for Gatundu South, with a Firebase admin dashboard at `/admin`.

Pages: Home, About, Parliament, Positions, Projects (with detail pages), **Events** (with detail pages), News, Gallery, Contact. Dashboard sections: Profile and career, Parliament record (including questions), Positions, Projects, Events, **Photo import**, News and press, Gallery, Messages, Contact and social links.
Built by SpenceTec and Logistics Limited.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build    # output in dist/
```

## Content
The site ships with built-in content (profile, committees, Bills, motions) taken from the Parliament of Kenya, Mzalendo and press reports. His Facebook, Instagram and LinkedIn links are already in the social links.
Once Firebase is connected, anything saved in the dashboard replaces the built-in version.

**Built-in projects and events:** 28 projects and 7 events, with their photos in `src/assets/projects/<id>/` and `src/assets/events/<id>/` (`01.jpg` is the lead photo). In the dashboard, Projects and Events offer **Copy built-in …** to bring them in for editing; their photos stay attached. If the office adds a new one first, the built-in ones are copied in automatically so nothing disappears from the site.

**Portrait:** put `portrait.jpg` (or `.png` / `.webp`) in `src/assets/images/`, or upload it from the dashboard (Profile and career).

## Firebase setup (free Spark plan, no Storage needed)
1. Firebase console: create a project, then Build, Firestore Database, create (production mode).
2. Build, Authentication, Sign-in method: enable **Email/Password**. Add the office users under Users.
3. Project settings, Your apps, add a **Web app**. Copy `apiKey`, `authDomain`, `projectId`, `appId` into `site.config.js`.
4. Firestore, Rules: paste the contents of `firestore.rules` and Publish.
5. Make someone an administrator: Firestore, start collection `admins`, document ID = that user's **UID** (shown on the "No access" screen after they sign in), field `ok` = boolean `true`.
6. Authentication, Settings, Authorized domains: add the live domain and the `*.workers.dev` address.
7. Redeploy. Open `/admin`.

Multiple photos: a project can hold up to 5 photos and a news story one photo; all of them appear in the Gallery automatically and link back to the project or story. Standalone photos and videos are added under Gallery.

Photos are resized in the browser and stored in Firestore (about 100 to 300 KB each). Videos are links (YouTube, Google Drive, Facebook, TikTok).
Projects, Events, Positions and News support **Import from file** (CSV or JSON; duplicates are skipped). Use the "CSV template" button for the columns.

**Photo import** (dashboard): choose photos, a folder or zip files. Photos are grouped by file name (`KMTC (1).jpg`, `KMTC (2).jpg` → "KMTC"; camera names like `IMG_0042.jpg` are grouped by folder) and matched to an event or project by its title or its *Photo file name* field. Check the matches, change any that are wrong, and import. Each photo becomes its own Gallery entry linked to its event or project, so there is no limit per item, and importing the same files twice skips the repeats. Groups with no match can become new projects, new events or plain Gallery photos. Camera RAW (.CR2 etc.) and iPhone HEIC files must be saved as JPG first. Deleting an event or project also deletes its imported photos.

After updating to this version, **publish `firestore.rules` again** (it now includes `events`).

## Deploy to Cloudflare Workers
```bash
npm run build
npx wrangler deploy
```
`wrangler.jsonc` serves `dist/` with single-page-app fallback, so `/about`, `/admin` etc. work on refresh.
