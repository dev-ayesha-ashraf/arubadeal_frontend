// src/lib/analytics.ts
import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID;
 // Replace with your ID

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackPageview = (url: string) => {
  ReactGA.send({ hitType: "pageview", page: url });
};
