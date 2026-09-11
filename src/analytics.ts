/**
 * Google Analytics 4. gtag.js only loads in production builds with a real
 * measurement ID, so local dev (and the placeholder) send nothing.
 *
 * The site is a single page with hash routing, so page views are sent by hand
 * from the stage engine instead of GA's automatic one-per-load.
 */

// GA4 → Admin → Data streams → your web stream → "Measurement ID"
const MEASUREMENT_ID = "G-3F8B04XL7B";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const enabled = import.meta.env.PROD && !MEASUREMENT_ID.includes("XXXX");

export function initAnalytics(): void {
  if (!enabled) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // gtag.js expects the raw Arguments object, not a spread array
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });

  // every mailto link — header, footer, contact page
  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.('a[href^="mailto:"]');
    if (link) track("email_click", { link_text: link.textContent?.trim() });
  });
}

export function track(name: string, params: Record<string, unknown> = {}): void {
  if (enabled) window.gtag("event", name, params);
}

let lastLocation = "";

/** one page view per distinct section/page hash */
export function trackPageView(title: string): void {
  if (location.href === lastLocation) return;
  lastLocation = location.href;
  track("page_view", { page_title: title, page_location: location.href });
}
