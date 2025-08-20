import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID;
let initialized = false;

export const initGA = () => {
  if (!initialized && MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID);
    initialized = true;
  }
};
