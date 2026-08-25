"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
  loading: () => <main className="loading-state">Loading curated public markets...</main>,
});

export default function MapPage() {
  return <MapClient />;
}
