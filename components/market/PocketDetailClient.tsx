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
  return (
    <main className="detail-page">
      <div className="detail-breadcrumb"><Link href="/map">Expansion markets</Link><span>/</span><span>{pocket.name}</span></div>
      <section className="detail-hero">
        <div>
          <span className="eyebrow">{pocket.stateName} · {pocket.metroName}</span>
          <h1>{pocket.name}</h1>
          <p>Illustrative market profile built entirely from deterministic synthetic data.</p>
        </div>
        <span className={"priority-pill " + pocket.scores.nearTermBucket.toLowerCase().replaceAll(" ", "-")}>{pocket.scores.nearTermBucket}</span>
      </section>

      <section className="score-strip">
        <div><span>Near-Term Priority</span><strong>{pocket.scores.nearTermPriority.toFixed(1)}</strong></div>
        <div><span>Demo Expansion Score</span><strong>{pocket.scores.expansion.toFixed(1)}</strong></div>
        <div><span>Entry Feasibility</span><strong>{pocket.scores.entryFeasibility.toFixed(1)}</strong></div>
        <div><span>Evidence Status</span><strong className="text-status">Synthetic</strong></div>
      </section>

      <nav className="detail-tabs" aria-label="Market detail sections">
        {TABS.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </nav>

      <section className="detail-content">
        {activeTab === "Overview" && (
          <div>
            <h2>Market overview</h2>
            <div className="kpi-grid">
              <div><span>Population</span><strong>{population?.rawValue.toLocaleString()}</strong><small>Synthetic people</small></div>
              <div><span>Population growth</span><strong>{growth?.rawValue.toFixed(1)}%</strong><small>Illustrative trend</small></div>
              <div><span>Competitors / 10k</span><strong>{saturation?.rawValue.toFixed(2)} <em className={"signal signal-" + pocket.scores.saturationSignal.replaceAll("+", "plus").replaceAll("-", "minus")}>{pocket.scores.saturationSignal}</em></strong><small>Lower saturation is favorable</small></div>
              <div><span>Competitors</span><strong>{pocket.competitors.length}</strong><small>Canonical demo records</small></div>
              <div><span>Entry paths</span><strong>{pocket.opportunities.length}</strong><small>Illustrative opportunities</small></div>
            </div>
            <div className="notice"><strong>Repository boundary</strong><p>{pocket.methodologyNote}</p></div>
          </div>
        )}
        {activeTab === "Competitors" && <div><h2>Competitor intelligence</h2><CompetitorTable competitors={pocket.competitors} /></div>}
        {activeTab === "Metrics" && (
          <div>
            <h2>Demo metrics and scoring</h2>
            <div className="table-scroll"><table className="data-table"><thead><tr><th>Metric</th><th>Raw</th><th>Normalized</th><th>Weight</th><th>Contribution</th><th>Source</th></tr></thead><tbody>
              {pocket.metrics.map((metric) => <tr key={metric.key}><td>{metric.label}</td><td>{metric.rawValue.toLocaleString()} {metric.unit}</td><td>{metric.normalizedScore.toFixed(1)}</td><td>{(metric.weight * 100).toFixed(0)}%</td><td>{metric.contribution.toFixed(1)}</td><td>{metric.source}</td></tr>)}
            </tbody></table></div>
          </div>
        )}
        {activeTab === "Opportunities" && (
          <div>
            <h2>Illustrative entry opportunities</h2>
            <p className="section-intro">Signals are educational examples, not predictions that an owner will sell.</p>
            <div className="opportunity-grid">
              {pocket.opportunities.map((opportunity) => (
                <article key={opportunity.id} className="opportunity-card">
                  <span className="opportunity-kind">{opportunity.kind.replaceAll("_", " ")}</span>
                  <h3>{opportunity.title}</h3>
                  <div className="opportunity-score"><strong>{opportunity.pathScore.toFixed(0)}</strong><span>Path score · {opportunity.confidence} confidence</span></div>
                  <ul>{opportunity.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
                  <small>{opportunity.source}</small>
                </article>
              ))}
            </div>
          </div>
        )}
        {activeTab === "Sources / Methodology" && (
          <div>
            <h2>Sources and methodology</h2>
            <div className="methodology-grid">
              <article><span>Data status</span><h3>{pocket.sourceStatus}</h3><p>No production records or external provider responses are included.</p></article>
              <article><span>Expansion model</span><h3>demo_expansion_score_v1</h3><p>Five simplified normalized components with public illustrative weights.</p></article>
              <article><span>Opportunity model</span><h3>Illustrative signal scoring</h3><p>Observable demo signals support entry-path discussion without inferring seller intent.</p></article>
              <article><span>Geometry</span><h3>Fictional pocket polygon</h3><p>Simple deterministic polygons are used only to demonstrate PostGIS and map workflows.</p></article>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

