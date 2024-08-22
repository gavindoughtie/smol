// Load polyfills if necessary
export async function initEnv() {
  if (!("URLPattern" in globalThis)) {
    await import("urlpattern-polyfill");
  }
}
