# Hon. Gabriel Gathuka Kagombe: official website

Multi-page React + Vite site for the Member of Parliament for Gatundu South, with a Firebase admin dashboard at `/admin`.

Pages: Home, About, Parliament, **Positions**, Projects (with detail pages), News, Gallery, Contact. Dashboard sections: Profile and career, Parliament record (including questions), Positions, Projects, News and press, Gallery, Messages, Contact and social links.
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

Photos are resized in the browser and stored in Firestore (about 100 to 200 KB each; a project can hold up to 5). Videos are links (YouTube, Google Drive, Facebook, TikTok).
Projects and News support **Import from file** (CSV or JSON; duplicates by title are skipped). Use the "CSV template" button for the columns.

## Deploy to Cloudflare Workers
```bash
npm run build
npx wrangler deploy
```
`wrangler.jsonc` serves `dist/` with single-page-app fallback, so `/about`, `/admin` etc. work on refresh.
