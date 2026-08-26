"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CompetitorTable from "@/components/competitors/CompetitorTable";
import type { DemoOpportunity, DemoPocket, DemoSiteTraffic, OpportunityKind } from "@/lib/types";

const TABS = ["Overview", "Competitors", "Opportunities", "Notes"] as const;
const OPPORTUNITY_SECTIONS: Array<{ kind: OpportunityKind; title: string; empty: string }> = [
  { kind: "listed_acquisition", title: "Listed Acquisitions", empty: "No active listed acquisition is represented for this demo market." },
  { kind: "offmarket_target", title: "Urgent Care Acquisition Targets", empty: "No sanitized urgent-care acquisition target is represented." },
  { kind: "occupational_medicine_target", title: "Occupational Medicine Targets", empty: "No illustrative occupational-medicine target is represented." },
  { kind: "real_estate", title: "Real Estate", empty: "No public or illustrative real-estate path is represented." },
];

function rawValue(value: number, unit: string) {
  if (unit === "people") return value.toLocaleString();
  return `${value.toFixed(1)} ${unit}`;
}

function SiteTraffic({ traffic }: { traffic: DemoSiteTraffic }) {
  if (traffic.status === "precise_location_unavailable") {
    return <div className="site-traffic"><strong>Site Traffic</strong><span className="traffic-status">Precise location unavailable</span><p>{traffic.note}</p></div>;
  }
  return (
    <div className="site-traffic">
      <strong>Site Traffic</strong>
      <span className="traffic-status">{traffic.observationKind.replaceAll("_", " ")}</span>
      <dl>
        <div><dt>Nearest AADT</dt><dd>{traffic.nearestAadt?.toLocaleString() ?? "Unavailable"}</dd></div>
        <div><dt>Road</dt><dd>{traffic.road ?? "Unavailable"}</dd></div>
        <div><dt>Distance</dt><dd>{traffic.distanceMiles === undefined ? "Unavailable" : `${traffic.distanceMiles.toFixed(2)} mi`}</dd></div>
        <div><dt>Count Year</dt><dd>{traffic.countYear ?? "Unavailable"}</dd></div>
        <div><dt>Max within 0.25 mi</dt><dd>{traffic.maxAadtQuarterMile?.toLocaleString() ?? "Unavailable"}</dd></div>
        <div><dt>Max within 0.50 mi</dt><dd>{traffic.maxAadtHalfMile?.toLocaleString() ?? "Unavailable"}</dd></div>
      </dl>
      <p>{traffic.sourceUrl ? <a href={traffic.sourceUrl} target="_blank" rel="noreferrer">{traffic.source}</a> : traffic.note}</p>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: DemoOpportunity }) {
  return (
    <article className={`opportunity-card ${opportunity.activePublicListing ? "public-listing" : ""}`}>
      <span className="opportunity-kind">{opportunity.status}</span>
      <h3>{opportunity.title}</h3>
      <div className="opportunity-score"><strong>{opportunity.pathScore.toFixed(0)}</strong><span>Illustrative path score · {opportunity.confidence} confidence</span></div>
      <span className={`source-kind ${opportunity.observationKind}`}>{opportunity.observationKind.replaceAll("_", " ")}</span>
      <ul>{opportunity.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
      {opportunity.details && <dl className="opportunity-details">{Object.entries(opportunity.details).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      <small>{opportunity.sourceUrl ? <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer">{opportunity.source}</a> : opportunity.source}{opportunity.lastVerified && ` · verified ${opportunity.lastVerified}`}</small>
      {opportunity.disclosure && <p className="opportunity-disclosure">{opportunity.disclosure}</p>}
      <SiteTraffic traffic={opportunity.siteTraffic} />
    </article>
  );
}

export default function PocketDetailClient({ pocketId }: { pocketId: string }) {
  const [pocket, setPocket] = useState<DemoPocket>();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  useEffect(() => {
    fetch(`/api/pockets/${pocketId}`).then((response) => response.json()).then(setPocket);
  }, [pocketId]);
  useEffect(() => {
    const requested = window.location.hash.slice(1).toLowerCase();
    const tab = TABS.find((item) => item.toLowerCase() === requested);
    if (tab) setActiveTab(tab);
  }, []);
  if (!pocket) return <main className="loading-state">Loading market profile...</main>;

  const provenanceCounts = pocket.metrics.reduce<Record<string, number>>((counts, metric) => {
    counts[metric.observationKind] = (counts[metric.observationKind] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <main className="detail-page">
      <div className="detail-breadcrumb"><Link href="/map">Expansion markets</Link><span>/</span><span>{pocket.name}</span></div>
      <section className="detail-hero">
        <div>
          <span className="eyebrow">{pocket.stateName} · {pocket.metroName} · ZIP {pocket.zipCode}</span>
          <h1>{pocket.name}</h1>
          <p>Public market facts and sanitized scenarios evaluated with an independently configured illustrative demo model.</p>
        </div>
        <span className={`priority-pill ${pocket.scores.nearTermBucket.toLowerCase().replaceAll(" ", "-")}`}>{pocket.scores.nearTermBucket}</span>
      </section>

      <section className="score-strip decision-scores">
        <div><span>Demo Expansion Score v2</span><strong>{pocket.scores.expansion.toFixed(1)}</strong><small>{pocket.scores.expansionBucket}</small></div>
        <div><span>Entry Feasibility</span><strong>{pocket.scores.entryFeasibility.toFixed(1)}</strong><small>{pocket.scores.entryBucket}</small></div>
        <div><span>Near-Term Priority</span><strong>{pocket.scores.nearTermPriority.toFixed(1)}</strong><small>{pocket.scores.nearTermBucket}</small></div>
      </section>

      <nav className="detail-tabs" aria-label="Market detail sections">
        {TABS.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => { setActiveTab(tab); window.history.replaceState(null, "", `#${tab.toLowerCase()}`); }}>{tab}</button>)}
      </nav>

      <section className="detail-content">
        {activeTab === "Overview" && (
          <div>
            <div className="section-heading"><div><span className="eyebrow">Market screening</span><h2>Demo Expansion Score v2 Breakdown</h2></div><span className="completeness-label">{pocket.dataCompleteness.toFixed(0)}% complete</span></div>
            <div className="table-scroll"><table className="data-table score-breakdown"><thead><tr><th>Metric</th><th>Raw Value</th><th>Normalized Score</th><th>Weight</th><th>Contribution</th><th>Explanation</th></tr></thead><tbody>
              {pocket.metrics.map((metric) => <tr key={metric.key}>
                <td><strong>{metric.label}</strong></td><td>{rawValue(metric.rawValue, metric.unit)}</td><td>{metric.normalizedScore.toFixed(1)}</td><td>{(metric.weight * 100).toFixed(0)}%</td><td>{metric.contribution.toFixed(1)}</td>
                <td><p>{metric.explanation}</p><span className={`source-kind ${metric.observationKind}`}>{metric.observationKind.replaceAll("_", " ")}</span>{metric.sourceUrl ? <a className="source-link" href={metric.sourceUrl} target="_blank" rel="noreferrer">Public source</a> : null}</td>
              </tr>)}
            </tbody></table></div>
            <div className="notice"><strong>Public-demo boundary</strong><p>Demo v2 mirrors production business concepts, but not production normalization, weights, thresholds, ranking logic, targets, or evidence.</p></div>
          </div>
        )}
        {activeTab === "Competitors" && <div><span className="eyebrow">Physical facilities</span><h2>General Urgent-Care Competitors</h2><p className="section-intro">Canonical physical facilities appear once. Practitioner profiles, specialty-only care, plain primary care, and occupational-health-only centers are excluded.</p><CompetitorTable competitors={pocket.competitors} /></div>}
        {activeTab === "Opportunities" && (
          <div>
            <h2>Opportunity Paths</h2>
            <p className="section-intro">Public listings are factual snapshots. Off-market, occupational-medicine, and real-estate examples are explicitly sanitized or illustrative. Site traffic is diligence context, not a market-score component.</p>
            {OPPORTUNITY_SECTIONS.map((section) => {
              const opportunities = pocket.opportunities.filter((item) => item.kind === section.kind);
              return <section className="opportunity-section" key={section.kind}><h3>{section.title}</h3>{opportunities.length ? <div className="opportunity-grid">{opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div> : <p className="empty-state">{section.empty}</p>}</section>;
            })}
          </div>
        )}
        {activeTab === "Notes" && (
          <div>
            <h2>Notes and Additional Context</h2>
            <div className="context-grid">
              <article><span>Model status</span><strong>{pocket.scores.expansionStatus}</strong><p>{pocket.scores.expansionModelId}; {pocket.dataCompleteness.toFixed(0)}% component coverage.</p></article>
              <article><span>Field provenance</span><strong>{provenanceCounts.real_public_observation ?? 0} public · {provenanceCounts.derived_public_observation ?? 0} derived · {provenanceCounts.illustrative_demo_value ?? 0} illustrative</strong><p>Illustrative fields demonstrate workflow and are not asserted as observed facts.</p></article>
              <article><span>Geometry</span><strong>Five-mile analysis area</strong><p>Centered on Census ZCTA {pocket.zipCode}; canonical ZCTA geometry is retained for lineage.</p></article>
              <article><span>Methodology</span><strong>Public-safe demonstration</strong><p>{pocket.methodologyNote}</p></article>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
