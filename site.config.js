// Settings you may need to change.
// Firebase: paste the four values from Firebase console -> Project settings -> Your apps (web).
// Leave them empty and the site still works with its built-in content (the admin dashboard stays off).
export const siteConfig = {
  // The live address, with https:// and no slash at the end. Needed for the sitemap, canonical links
  // and link previews (WhatsApp, Facebook, X need full image addresses).
  siteUrl: "", // e.g. "https://www.ggkagombe.co.ke" or the workers.dev address
  seo: {
    // Paste the code from Google Search Console / Bing Webmaster Tools (HTML tag method, content="…" part only).
    googleSiteVerification: "",
    bingSiteVerification: "",
  },
  firebase: {
    apiKey: "AIzaSyCwDW6ZtwaHnpboK3FM1Z6Xxx8UKJQYFoc",
    authDomain: "mp-gg-46562.firebaseapp.com",
    projectId: "mp-gg-46562",
    storageBucket: "mp-gg-46562.firebasestorage.app",
    messagingSenderId: "848530906623",
    appId: "1:848530906623:web:2575ba80728dc73f31dbca",
  },
};
