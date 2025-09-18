import axios from "axios";

interface Category {
  _id: string;
  name: string;
}

interface Pixel {
  _id: string;
  categoryId: Category;
  pixelId: string;
  createdAt: string;
}
declare global {
  interface Window {
    fbq: any;
  }
}

/**
 * Dynamically loads and initializes the Meta Pixel script
 * @param pixelId Facebook Pixel ID
 */
export const initPixel = (pixelId: string) => {
  if (!pixelId || typeof window === "undefined") return;

  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const fbqFn: any = function (...args: any[]) {
      fbqFn.callMethod
        ? fbqFn.callMethod.apply(fbqFn, args)
        : fbqFn.queue.push(args);
    };
    f.fbq = fbqFn;
    fbqFn.push = fbqFn;
    fbqFn.loaded = true;
    fbqFn.version = "2.0";
    fbqFn.queue = [];

    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;

    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
};

export const loadCarsPixel = async () => {
  try {
    const apiBase = import.meta.env.VITE_PIXEL_URL;
    const res = await axios.get<Pixel[]>(`${apiBase}/pixel`);
    const nailsPixel = res.data.find(
      (p) => p.categoryId?.name?.toLowerCase() === "cars" && !!p.pixelId
    );
    if (nailsPixel) {
      initPixel(nailsPixel.pixelId);
    }
  } catch (err) {
    console.error("Failed to load pixel:", err);
  }
};
export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", event, data || {});
  }
};

export const trackCustomEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", event, data || {});
  }
};