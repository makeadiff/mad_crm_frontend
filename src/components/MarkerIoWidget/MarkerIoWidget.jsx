// src/components/MarkerIoWidget/MarkerIoWidget.jsx
import { useEffect } from "react";
import markerSDK from "@marker.io/browser";

export default function MarkerIoWidget() {
  useEffect(() => {
    // prevent double load in React 18 StrictMode
    if (window.__markerLoading || window.__markerLoaded) return;

    const PROJECT_ID = import.meta.env?.VITE_MARKER_IO_PROJECT_ID; // <- Vite only
    console.log("Marker.io Project ID:", PROJECT_ID);

    if (!PROJECT_ID) {
      console.warn("Marker.io: PROJECT_ID missing");
      return;
    }

    window.__markerLoading = true;

    markerSDK
      .loadWidget({ project: PROJECT_ID })
      .then((widget) => {
        window.__markerWidget = widget;
        window.__markerLoaded = true;
        widget.show();
      })
      .catch((e) => console.error("Marker.io load failed:", e))
      .finally(() => (window.__markerLoading = false));

    // don't unload in dev to avoid StrictMode race
    // if you want cleanup only in prod:
    // return () => { if (import.meta.env.PROD) window.__markerWidget?.unload?.(); };
  }, []);

  return null;
}
