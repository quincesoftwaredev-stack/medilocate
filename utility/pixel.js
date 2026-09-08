// Approved public commerce routes only; admin/account/prescription routes stay excluded.
const publicPages = new Set(['/', '/about', '/contact', '/how-it-works', '/help', '/medicines', '/cart', '/checkout']);
let pixel = null;
let loading = null;
let initialized = false;
let paused = true;
let generation = 0;
let lastPage = null;

export function isPixelPage(value) {
  if (typeof window === 'undefined') return false;
  try {
    const url = new URL(value, window.location.origin);
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
    return url.origin === window.location.origin && !url.search && !url.hash && (publicPages.has(path) || /^\/medicines\/[^/]+$/.test(path));
  } catch { return false; }
}

export function pausePixel() {
  generation += 1;
  paused = true;
  pixel?.revokeConsent();
}

export async function activatePixel(url, id) {
  const request = ++generation;
  if (!id || !isPixelPage(url) || !isPixelPage(window.location.href)) {
    lastPage = null;
    pausePixel();
    return false;
  }
  // Referrers can contain personal or medical details, so require a clean one.
  if (document.referrer && !isPixelPage(document.referrer)) {
    pausePixel();
    return false;
  }
  try {
    loading ||= import('react-facebook-pixel').then(module => module.default);
    const client = await loading;
    if (request !== generation || !isPixelPage(window.location.href)) return false;
    pixel = client;
    if (!initialized) {
      pixel.init(id, {}, { autoConfig: false, debug: false });
      initialized = true;
    }
    paused = false;
    pixel.grantConsent();
    const currentPage = window.location.pathname;
    if (lastPage !== currentPage) {
      pixel.pageView();
      lastPage = currentPage;
    }
    return true;
  } catch {
    loading = null;
    paused = true;
    return false;
  }
}

const sent = new Set();
export function trackPixelEvent(event, data = {}, key = null) {
  const allowed = ['Contact', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase'];
  if (!allowed.includes(event) || paused || !pixel || !isPixelPage(window.location.href)) return;
  const eventKey = key ? event + ':' + key : null;
  try {
    if (eventKey && (sent.has(eventKey) || (event === 'Purchase' && sessionStorage.getItem(eventKey)))) return;
  } catch { /* Storage may be disabled. */ }
  const payload = {};
  if (Number.isFinite(data.value) && data.value >= 0) { payload.value = data.value; payload.currency = 'BDT'; }
  if (Number.isFinite(data.num_items) && data.num_items >= 0) payload.num_items = data.num_items;
  try {
    pixel.track(event, payload);
    if (eventKey) {
      sent.add(eventKey);
      if (event === 'Purchase') { try { sessionStorage.setItem(eventKey, '1'); } catch {} }
    }
  } catch { /* Analytics must not interrupt checkout. */ }
}
