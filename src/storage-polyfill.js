// Polyfills the `window.storage` API that Claude.ai artifacts provide,
// backed by the browser's localStorage instead. This lets App.jsx run
// unmodified outside of Claude.ai — on GitHub Pages, Vercel, Netlify,
// or anywhere else.
//
// Note: localStorage is per-browser, per-device. Data won't sync across
// devices or browsers. For that, you'd need a real backend/database —
// this polyfill is meant to make the app "just work" for a single user
// on a single device/browser, matching how the app behaved with personal
// (non-shared) storage inside Claude.ai.

const PREFIX = "sustenance_storage__";

function fullKey(key, shared) {
  return `${PREFIX}${shared ? "shared" : "personal"}__${key}`;
}

function stripPrefix(fullK, shared) {
  const marker = `${PREFIX}${shared ? "shared" : "personal"}__`;
  return fullK.startsWith(marker) ? fullK.slice(marker.length) : null;
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key, shared = false) {
      const raw = window.localStorage.getItem(fullKey(key, shared));
      if (raw === null) {
        throw new Error(`Key not found: ${key}`);
      }
      return { key, value: raw, shared };
    },

    async set(key, value, shared = false) {
      window.localStorage.setItem(fullKey(key, shared), value);
      return { key, value, shared };
    },

    async delete(key, shared = false) {
      window.localStorage.removeItem(fullKey(key, shared));
      return { key, deleted: true, shared };
    },

    async list(prefix = "", shared = false) {
      const searchPrefix = fullKey(prefix, shared);
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(searchPrefix)) {
          const stripped = stripPrefix(k, shared);
          if (stripped !== null) keys.push(stripped);
        }
      }
      return { keys, prefix, shared };
    },
  };
}
