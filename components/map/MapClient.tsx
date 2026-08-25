"use client";

import "leaflet/dist/leaflet.css";

import { latLng, latLngBounds } from "leaflet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

import type { DemoPocket } from "@/lib/types";

type ColorMode = "marketArea" | "nearTermPriority" | "expansion";

const NEAR_TERM_COLORS = {
  "Immediate Review": "#136f63",
  Strong: "#4e9f6d",
  Monitor: "#d3a542",
  Low: "#b65d55",
} as const;

const EXPANSION_COLORS = {
  "Top Priority": "#1f6f8b",
  Attractive: "#4f8fba",
  Watchlist: "#d3a542",
  "Lower Priority": "#a85a52",
} as const;

const DEFAULT_BUCKETS = ["Immediate Review", "Strong"];
const ALL_EXPANSION_BUCKETS = ["Top Priority", "Attractive", "Watchlist", "Lower Priority"] as const;
const MILES_TO_METERS = 1609.344;
const MARKET_BLUE = "#2463a3";
const MARKET_BLUE_BORDER = "#174a7a";
const LISTING_VIOLET = "#6f4aa8";
const LISTING_VIOLET_BORDER = "#4f2c81";

function FitCuratedBounds({ pockets }: { pockets: DemoPocket[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pockets.length) return;
    const bounds = latLngBounds([]);
    for (const pocket of pockets) {
      bounds.extend(
        latLng(pocket.centroidLat, pocket.centroidLon).toBounds(
          pocket.displayRadiusMiles * MILES_TO_METERS * 2,
        ),
      );
    }
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: pockets.length <= 3 ? 10 : 8 });
  }, [map, pockets]);
  return null;
}

export default function MapClient() {
  const router = useRouter();
  const [pockets, setPockets] = useState<DemoPocket[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [stateId, setStateId] = useState("all");
  const [metroId, setMetroId] = useState("all");
  const [query, setQuery] = useState("");
  const [zipQuery, setZipQuery] = useState("");
  const [zipMessage, setZipMessage] = useState("");
  const [colorMode, setColorMode] = useState<ColorMode>("marketArea");
  const [nearTermBuckets, setNearTermBuckets] = useState(() => new Set(DEFAULT_BUCKETS));
  const [expansionBuckets, setExpansionBuckets] = useState(() => new Set<string>(ALL_EXPANSION_BUCKETS));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pockets")
      .then((response) => response.json())
      .then((payload) => setPockets(payload.pockets))
      .finally(() => setLoading(false));
  }, []);

  const states = useMemo(
    () => Array.from(new Map(pockets.map((pocket) => [pocket.stateId, pocket.stateName])).entries()),
    [pockets],
  );
  const metros = useMemo(
    () => Array.from(
      new Map(
        pockets
          .filter((pocket) => stateId === "all" || pocket.stateId === stateId)
          .map((pocket) => [pocket.metroId, pocket.metroName]),
      ).entries(),
    ),
    [pockets, stateId],
  );
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return pockets
      .filter((pocket) => stateId === "all" || pocket.stateId === stateId)
      .filter((pocket) => metroId === "all" || pocket.metroId === metroId)
      .filter((pocket) => nearTermBuckets.has(pocket.scores.nearTermBucket))
      .filter((pocket) => expansionBuckets.has(pocket.scores.expansionBucket))
      .filter((pocket) => !normalizedQuery || pocket.name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => b.scores.nearTermPriority - a.scores.nearTermPriority);
  }, [pockets, stateId, metroId, nearTermBuckets, expansionBuckets, query]);

  const selected = pockets.find((pocket) => pocket.id === selectedId);
  const scoreLegend = colorMode === "nearTermPriority"
    ? Object.entries(NEAR_TERM_COLORS)
    : colorMode === "expansion"
      ? Object.entries(EXPANSION_COLORS)
      : [];
  const toggleBucket = (bucket: string) => {
    setNearTermBuckets((current) => {
      const next = new Set(current);
      if (next.has(bucket)) next.delete(bucket);
      else next.add(bucket);
      return next;
    });
  };
  const toggleExpansionBucket = (bucket: string) => {
    setExpansionBuckets((current) => {
      const next = new Set(current);
      if (next.has(bucket)) next.delete(bucket);
      else next.add(bucket);
      return next;
    });
  };
  const analyzeZip = (event: React.FormEvent) => {
    event.preventDefault();
    const zip = zipQuery.trim();
    const pocket = pockets.find((item) => item.zipCode === zip);
    if (pocket) {
      router.push(`/pockets/${pocket.id}`);
      return;
    }
    setZipMessage("This public demo supports the curated ZIPs listed below.");
  };

  return (
    <main className="map-workspace">
      <aside className="control-panel">
        <div className="panel-heading">
          <span className="eyebrow">Curated Public Demo Markets</span>
          <h1>Expansion markets</h1>
          <p>Compare real public market facts through a deliberately simplified demo model.</p>
        </div>

        <form className="zip-analyzer" onSubmit={analyzeZip}>
          <label htmlFor="zip-analysis">Analyze a ZIP Code</label>
          <div><input id="zip-analysis" inputMode="numeric" maxLength={5} value={zipQuery} onChange={(event) => { setZipQuery(event.target.value.replace(/\D/g, "")); setZipMessage(""); }} placeholder="Try 16801" /><button type="submit">Analyze</button></div>
          {zipMessage && <small>{zipMessage}</small>}
        </form>

        <div className="filter-group">
          <label htmlFor="state">State</label>
          <select id="state" value={stateId} onChange={(event) => { setStateId(event.target.value); setMetroId("all"); }}>
            <option value="all">All curated states</option>
            {states.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="metro">Metro</label>
          <select id="metro" value={metroId} onChange={(event) => setMetroId(event.target.value)}>
            <option value="all">All metros</option>
            {metros.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="search">Market search</label>
          <input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search markets" />
        </div>

        <fieldset className="bucket-filter">
          <legend>Near-Term Priority</legend>
          {(["Immediate Review", "Strong", "Monitor", "Low"] as const).map((bucket) => (
            <label key={bucket}>
              <input
                type="checkbox"
                checked={nearTermBuckets.has(bucket)}
                onChange={() => toggleBucket(bucket)}
              />
              <span className="legend-dot" style={{ background: NEAR_TERM_COLORS[bucket] }} />
              {bucket}
            </label>
          ))}
        </fieldset>

        <fieldset className="bucket-filter compact-buckets">
          <legend>Demo Expansion Bucket</legend>
          {ALL_EXPANSION_BUCKETS.map((bucket) => (
            <label key={bucket}>
              <input type="checkbox" checked={expansionBuckets.has(bucket)} onChange={() => toggleExpansionBucket(bucket)} />
              <span className="legend-dot" style={{ background: EXPANSION_COLORS[bucket] }} />
              {bucket}
            </label>
          ))}
        </fieldset>

        <div className="filter-group">
          <label>Color map by</label>
          <div className="segmented-control">
            <button className={colorMode === "marketArea" ? "active" : ""} onClick={() => setColorMode("marketArea")}>Market Areas</button>
            <button className={colorMode === "nearTermPriority" ? "active" : ""} onClick={() => setColorMode("nearTermPriority")}>Demo Near-Term</button>
            <button className={colorMode === "expansion" ? "active" : ""} onClick={() => setColorMode("expansion")}>Demo Expansion</button>
          </div>
        </div>

        <div className="ranked-heading">
          <h2>Ranked markets</h2>
          <span>{filtered.length}</span>
        </div>
        <div className="ranked-list">
          {loading ? <p>Loading...</p> : filtered.map((pocket, index) => (
            <button
              className={"rank-row " + (selectedId === pocket.id ? "selected" : "")}
              key={pocket.id}
              onClick={() => setSelectedId(pocket.id)}
            >
              <span className="rank-number">{index + 1}</span>
              <span className="rank-copy">
                <strong>{pocket.name}</strong>
                <small>{pocket.metroName}</small>
              </span>
              <span className="rank-score">{pocket.scores.nearTermPriority.toFixed(1)}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="map-stage">
        <div className="map-summary">
          <span><strong>{filtered.length}</strong> visible markets</span>
          {colorMode === "marketArea" ? (
            <>
              <span className="map-legend-item"><i style={{ background: MARKET_BLUE, borderColor: MARKET_BLUE_BORDER }} /> Curated Market Analysis Area</span>
              <span className="map-legend-item"><i style={{ background: LISTING_VIOLET, borderColor: LISTING_VIOLET_BORDER }} /> Public Listed Acquisition</span>
            </>
          ) : (
            <>
              {scoreLegend.map(([label, color]) => (
                <span className="map-legend-item" key={label}><i style={{ background: color, borderColor: color }} /> {label}</span>
              ))}
              <span className="map-legend-item"><i style={{ background: LISTING_VIOLET, borderColor: LISTING_VIOLET_BORDER }} /> Public Listing</span>
            </>
          )}
        </div>
        <MapContainer center={[41, -82]} zoom={5} minZoom={4} className="leaflet-map" zoomControl>
          <FitCuratedBounds
            key={filtered.map((pocket) => pocket.id).join("|") || "all-markets"}
            pockets={filtered.length ? filtered : pockets}
          />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((pocket) => {
            const analyticalColor = colorMode === "marketArea"
              ? MARKET_BLUE
              : colorMode === "nearTermPriority"
                ? NEAR_TERM_COLORS[pocket.scores.nearTermBucket]
                : EXPANSION_COLORS[pocket.scores.expansionBucket];
            const activeListing = pocket.opportunities.some((opportunity) => opportunity.activePublicListing);
            const color = activeListing ? LISTING_VIOLET : analyticalColor;
            const population = pocket.metrics.find((metric) => metric.key === "population");
            const saturation = pocket.metrics.find((metric) => metric.key === "competitive_saturation");
            return (
              <Circle
                key={pocket.id + colorMode}
                center={[pocket.centroidLat, pocket.centroidLon]}
                radius={pocket.displayRadiusMiles * MILES_TO_METERS}
                eventHandlers={{ click: () => setSelectedId(pocket.id) }}
                pathOptions={{
                  color: activeListing ? LISTING_VIOLET_BORDER : selectedId === pocket.id ? "#102f44" : colorMode === "marketArea" ? MARKET_BLUE_BORDER : "#ffffff",
                  weight: selectedId === pocket.id || activeListing ? 4 : 3,
                  fillColor: color,
                  fillOpacity: activeListing ? 0.52 : colorMode === "marketArea" ? 0.4 : 0.58,
                }}
              >
                <Tooltip sticky>
                  <strong>{pocket.name}, {pocket.stateId.toUpperCase()}</strong><br />
                  {pocket.marketType === "opportunity_driven" && <>Opportunity-Driven Market<br />Provisional Trade Area<br /></>}
                  {activeListing && <>ACTIVE PUBLIC LISTED ACQUISITION<br /></>}
                  Curated Market Analysis Area · {pocket.displayRadiusMiles}-mile radius<br />
                  Demo Near-Term Priority: {pocket.scores.nearTermPriority.toFixed(1)}<br />
                  Demo Expansion Score: {pocket.scores.expansion.toFixed(1)}<br />
                  Population: {population?.rawValue.toLocaleString("en-US") ?? "Not available"}<br />
                  Competitors / 10k: {saturation?.rawValue.toFixed(2) ?? "Not available"}
                </Tooltip>
              </Circle>
            );
          })}
        </MapContainer>

        {selected && (
          <div className="selection-panel">
            <div>
              <span className="eyebrow">{selected.metroName} · ZIP {selected.zipCode}</span>
              <h2>{selected.name}</h2>
            </div>
            <button className="close-button" aria-label="Close selected market" onClick={() => setSelectedId(undefined)}>×</button>
            <div className="selection-scores">
              <div><span>Demo Near-Term</span><strong>{selected.scores.nearTermPriority.toFixed(1)}</strong></div>
              <div><span>Demo Expansion</span><strong>{selected.scores.expansion.toFixed(1)}</strong></div>
              <div><span>Demo Entry</span><strong>{selected.scores.entryFeasibility.toFixed(1)}</strong></div>
            </div>
            <p>{selected.competitors.length} competitors · {selected.opportunities.length} entry paths</p>
            <Link className="primary-link" href={"/pockets/" + selected.id}>Open market profile</Link>
          </div>
        )}
      </section>
    </main>
  );
}
