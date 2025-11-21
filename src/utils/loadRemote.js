// src/utils/loadRemote.js
// Lightweight, readable helper that injects a remoteEntry and returns the federated module.
// Usage:
//   const mod = await loadRemoteAndGet('catalog', 'http://localhost:5174/assets/remoteEntry.js', './CatalogApp');
//   const Catalog = mod.default || mod.CatalogApp;

const ATTR = "data-mf-remote";

/** inject script and wait for load (idempotent) */
export function injectScript(url, { timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("Missing url"));

    const existing = document.querySelector(`script[${ATTR}="${url}"]`);
    if (existing) {
      // if already loaded mark present as loaded or wait for onload if in-flight
      if (existing.getAttribute("data-mf-loaded") === "true") return resolve(url);

      const onLoad = () => {
        cleanup();
        resolve(url);
      };
      const onError = (e) => {
        cleanup();
        reject(Object.assign(new Error(`Script tag load failed: ${url}`), { url, original: e }));
      };
      const cleanup = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }

    const el = document.createElement("script");
    el.src = url;
    el.async = true;
    el.type = "text/javascript";
    el.setAttribute(ATTR, url);

    const timer = setTimeout(() => {
      el.onload = el.onerror = null;
      reject(Object.assign(new Error(`Timeout ${timeout}ms loading ${url}`), { url }));
    }, timeout);

    el.onload = () => {
      clearTimeout(timer);
      el.setAttribute("data-mf-loaded", "true");
      resolve(url);
    };

    el.onerror = (ev) => {
      clearTimeout(timer);
      reject(Object.assign(new Error(`Failed to load ${url}`), { url, original: ev }));
    };

    document.head.appendChild(el);
  });
}

/**
 * Initialise webpack share scope for the remote container if available.
 * This mirrors the pattern used by Webpack Module Federation: call container.init
 * with the host's share scope so modules are shared correctly.
 */
function tryInitContainer(remoteName) {
  try {
    // the container is expected to be exposed on window[remoteName]
    const container = window[remoteName];
    if (!container) {
      throw new Error(`window["${remoteName}"] is not defined after injecting remoteEntry`);
    }

    // If the container has an init method and the host exposes __webpack_share_scopes__,
    // call init to populate shared modules.
    if (typeof container.init === "function") {
      // __webpack_share_scopes__ is provided by module federation runtime when using webpack.
      // Calling init might throw if already initialized — wrap safely.
      if (window.__webpack_share_scopes__ && window.__webpack_share_scopes__.default) {
        try {
          container.init(window.__webpack_share_scopes__.default);
        } catch (initErr) {
          // Not fatal — might already be initialized; keep going.
          // But surface the error for debugging.
          console.warn(`container.init threw for ${remoteName}:`, initErr);
        }
      }
    }
    return container;
  } catch (err) {
    // rethrow with helpful message
    throw Object.assign(new Error(`Container init failed for remote "${remoteName}": ${err.message}`), { remoteName });
  }
}

/**
 * Load remoteEntry and import exposed module.
 * - remoteName: string in your federation config (e.g. 'catalog')
 * - remoteEntryUrl: full path to remoteEntry.js (e.g. 'http://localhost:5174/assets/remoteEntry.js')
 * - exposedModule: expose path without the './' prefix or with (works both) e.g. './CatalogApp' or 'CatalogApp'
 *
 * Returns the imported module (so you can do mod.default).
 */
export async function loadRemoteAndGet(remoteName, remoteEntryUrl, exposedModule, opts = { timeout: 12000 }) {
  if (!remoteName || !remoteEntryUrl || !exposedModule) {
    throw new Error("loadRemoteAndGet requires (remoteName, remoteEntryUrl, exposedModule)");
  }

  // 1) inject remoteEntry
  await injectScript(remoteEntryUrl, { timeout: opts.timeout }).catch((e) => {
    const err = new Error(`Remote "${remoteName}" failed to load script: ${e.message}`);
    err.remoteName = remoteName;
    err.url = remoteEntryUrl;
    throw err;
  });

  // 2) ensure container exists and try to init share scope if possible
  tryInitContainer(remoteName);

  // Normalize exposedModule string: plugin expects import('remote/ExposeName') where expose key was './ExposeName'
  const normalized = exposedModule.startsWith("./") ? exposedModule.slice(2) : exposedModule;

  // 3) perform federated import — allow Vite to resolve at runtime
  try {
    // @vite-ignore keeps Vite from trying to resolve at build time
    // the import spec must match the remote 'name' + exposure path: e.g. 'catalog/CatalogApp'
    const spec = `${remoteName}/${normalized}`;
    const mod = await import(/* @vite-ignore */ spec);
    return mod;
  } catch (importErr) {
    // Provide actionable diagnostics: check window[remoteName] presence and list its keys
    const container = window[remoteName];
    const containerKeys = container ? Object.keys(container) : null;
    const e = new Error(
      `Federated import failed for "${remoteName}/${normalized}": ${importErr.message}. ` +
        `Container present: ${!!container}. Container keys: ${containerKeys ? containerKeys.join(", ") : "none"}`
    );
    e.remoteName = remoteName;
    e.url = remoteEntryUrl;
    e.original = importErr;
    throw e;
  }
}
