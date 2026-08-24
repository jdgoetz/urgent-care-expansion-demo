"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
  loading: () => <main className="loading-state">Loading synthetic market portfolio...</main>,
});

export default function MapPage() {
  return <MapClient />;
}

