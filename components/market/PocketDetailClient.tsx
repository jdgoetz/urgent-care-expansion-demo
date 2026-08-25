"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CompetitorTable from "@/components/competitors/CompetitorTable";
import type { DemoPocket } from "@/lib/types";

const TABS = ["Overview", "Competitors", "Metrics", "Opportunities", "Sources / Methodology"] as const;

export default function PocketDetailClient({ pocketId }: { pocketId: string }) {
  const [pocket, setPocket] = useState<DemoPocket>();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  useEffect(() => {
    fetch("/api/pockets/" + pocketId).then((response) => response.json()).then(setPocket);
  }, [pocketId]);
  if (!pocket) return <main className="loading-state">Loading market profile...</main>;

  const population = pocket.metrics.find((metric) => metric.key === "population");
  const growth = pocket.metrics.find((metric) => metric.key === "population_growth");
  const saturation = pocket.metrics.find((metric) => metric.key === "competitive_saturation");
  const ratings = pocket.competitors.flatMap((competitor) => competitor.rating === undefined ? [] : [competitor.rating]);
  const hours = pocket.competitors.flatMap((competitor) => competitor.weeklyHours === undefined ? [] : [competitor.weeklyHours]);
  const averageRating = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : undefined;
  const averageHours = hours.length ? hours.reduce((sum, value) => sum + value, 0) / hours.length : undefined;
  return (
    <main className="detail-page">
      <div className="detail-breadcrumb"><Link href="/map">Expansion markets</Link><span>/</span><span>{pocket.name}</span></div>
      <section className="detail-hero">
        <div>
          <span className="eyebrow">{pocket.stateName} · {pocket.metroName} · ZIP {pocket.zipCode}</span>
          <h1>{pocket.name}</h1>
          <p>Real public market observations paired with a deliberately simplified illustrative decision model.</p>
        </div>
        <span className={"priority-pill " + pocket.scores.nearTermBucket.toLowerCase().replaceAll(" ", "-")}>{pocket.scores.nearTermBucket}</span>
      </section>

      <section className="score-strip">
        <div><span>Demo Near-Term Priority</span><strong>{pocket.scores.nearTermPriority.toFixed(1)}</strong></div>
        <div><span>Demo Expansion Score</span><strong>{pocket.scores.expansion.toFixed(1)}</strong></div>
        <div><span>Demo Entry Feasibility</span><strong>{pocket.scores.entryFeasibility.toFixed(1)}</strong></div>
        <div><span>Data Completeness</span><strong>{pocket.dataCompleteness.toFixed(0)}%</strong></div>
      </section>

      <nav className="detail-tabs" aria-label="Market detail sections">
        {TABS.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </nav>

      <section className="detail-content">
        {activeTab === "Overview" && (
          <div>
            <h2>Market overview</h2>
            <div className="kpi-grid">
              <div><span>Population</span><strong>{population?.rawValue.toLocaleString()}</strong><small>ACS 2024 5-year</small></div>
              <div><span>Population growth</span><strong>{growth?.rawValue.toFixed(1)}%</strong><small>ACS 2019 to 2024</small></div>
              <div><span>Competitors / 10k</span><strong>{saturation?.rawValue.toFixed(2)} <em className={"signal signal-" + pocket.scores.saturationSignal.replaceAll("+", "plus").replaceAll("-", "minus")}>{pocket.scores.saturationSignal}</em></strong><small>Curated snapshot; lower is favorable</small></div>
              <div><span>Avg competitor rating</span><strong>{averageRating?.toFixed(1) ?? "Not stored"}</strong><small>Source terms respected</small></div>
              <div><span>Avg weekly open hours</span><strong>{averageHours?.toFixed(0) ?? "Not verified"}</strong><small>{hours.length ? `${hours.length} verified location${hours.length === 1 ? "" : "s"}` : "No verified hours stored"}</small></div>
            </div>
            <div className="notice"><strong>Repository boundary</strong><p>{pocket.methodologyNote}</p></div>
          </div>
        )}
        {activeTab === "Competitors" && <div><h2>Competitor intelligence</h2><CompetitorTable competitors={pocket.competitors} /></div>}
        {activeTab === "Metrics" && (
          <div>
            <h2>Demo metrics and scoring</h2>
            <div className="table-scroll"><table className="data-table"><thead><tr><th>Metric</th><th>Raw</th><th>Normalized</th><th>Weight</th><th>Contribution</th><th>Source</th></tr></thead><tbody>
              {pocket.metrics.map((metric) => <tr key={metric.key}><td>{metric.label}</td><td>{metric.rawValue.toLocaleString()} {metric.unit}</td><td>{metric.normalizedScore.toFixed(1)}</td><td>{(metric.weight * 100).toFixed(0)}%</td><td>{metric.contribution.toFixed(1)}</td><td><span className={`source-kind ${metric.observationKind}`}>{metric.observationKind.replaceAll("_", " ")}</span>{metric.sourceUrl ? <a className="source-link" href={metric.sourceUrl} target="_blank" rel="noreferrer">{metric.source}</a> : metric.source}<small className="source-vintage">{metric.vintage}</small></td></tr>)}
            </tbody></table></div>
          </div>
        )}
        {activeTab === "Opportunities" && (
          <div>
            <h2>Entry opportunities</h2>
            <p className="section-intro">Public listings are factual snapshots. Off-market and real-estate examples are explicitly sanitized or illustrative.</p>
            <div className="opportunity-grid">
              {pocket.opportunities.map((opportunity) => (
                <article key={opportunity.id} className={`opportunity-card ${opportunity.activePublicListing ? "public-listing" : ""}`}>
                  <span className="opportunity-kind">{opportunity.kind.replaceAll("_", " ")}</span>
                  <h3>{opportunity.title}</h3>
                  <div className="opportunity-score"><strong>{opportunity.pathScore.toFixed(0)}</strong><span>Demo path score · {opportunity.confidence} confidence</span></div>
                  <ul>{opportunity.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
                  {opportunity.details && <dl className="opportunity-details">{Object.entries(opportunity.details).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
                  <small>{opportunity.sourceUrl ? <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer">{opportunity.source}</a> : opportunity.source}{opportunity.lastVerified && ` · verified ${opportunity.lastVerified}`}</small>
                  {opportunity.disclosure && <p className="opportunity-disclosure">{opportunity.disclosure}</p>}
                </article>
              ))}
            </div>
          </div>
        )}
        {activeTab === "Sources / Methodology" && (
          <div>
            <h2>Sources and methodology</h2>
            <div className="methodology-grid">
              <article><span>Data status</span><h3>{pocket.sourceStatus}</h3><p>Public observations are labeled separately from derived observations and illustrative demo values.</p></article>
              <article><span>Expansion model</span><h3>demo_expansion_score_v1</h3><p>Five simplified normalized components with public illustrative weights.</p></article>
              <article><span>Opportunity model</span><h3>Public listing + illustrative paths</h3><p>Demo path scores demonstrate workflow and do not infer private seller intent.</p></article>
              <article><span>Geometry</span><h3>2020 Census ZCTA {pocket.zipCode}</h3><p>Simplified from the official TIGERweb boundary for efficient public map rendering.</p></article>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
