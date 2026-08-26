# Demo Methodology

## Public boundary

`demo_expansion_score_v2` mirrors the business concepts of the private production system but does not reproduce production normalization, weights, thresholds, rankings, facility data, targets, evidence, or acquisition logic. Every displayed input is labeled as `real_public_observation`, `derived_public_observation`, or `illustrative_demo_value`.

The historical `demo_expansion_score_v1` identifier and configuration remain versioned in code. Demo v2 is a separate public model.

## Five pillars and eight components

| Pillar | Component | Demo weight | Raw input | Direction | Provenance |
| --- | --- | ---: | --- | --- | --- |
| Market Demand | Population | 15% | 2024 ACS population | Higher favorable | Real public |
| Market Demand | Population Growth | 20% | 2019-to-2024 ACS change | Higher favorable | Derived public |
| Competitive Landscape | Competitors / 10k Population | 20% | Canonical physical strict facilities / population | Lower favorable | Derived public |
| Competitive Landscape | Competitor Strength | 10% | Simplified rating and log-review concept | Lower favorable | Illustrative demo |
| Competitive Landscape | Competitive Availability Gap | 10% | Standard-hour coverage concept | Higher favorable | Illustrative demo |
| Clinical Workforce | Clinical Workforce Growth | 5% | Simplified workforce trend | Higher favorable | Illustrative demo |
| Occupational Medicine | Occupational Medicine Potential | 10% | Industrial/logistics employment-share concept | Higher favorable | Illustrative demo |
| Healthcare Access Gap | Primary-Care Underserved | 10% | ACS uninsured-share access proxy | Higher favorable | Derived public |

The weights total 100% and are intentionally simple public-demo weights. They are not production weights.

## Normalization and missing values

Each raw value is min-max normalized across the fixed nine-market curated universe. Lower-is-better directionality is applied to competitors per 10,000 and competitor strength. The other components are higher-is-better.

Missing components are excluded and the available weight is transparently renormalized. Eight of eight is `complete`; a usable subset is `partial`; less than 40% of configured weight is `insufficient_data`. Missing values are not silently assigned zero.

## Physical facility identity

The competitor layer represents physical general urgent-care facilities, not source profiles. A practitioner profile may resolve to a named clinic when the profile explicitly names that facility and shares its address. An explicit canonical clinic record wins. Address alone never causes two unrelated clinics to merge. Original aliases remain available for lineage.

Strict competitors require credible general urgent-access identity such as urgent care, walk-in, immediate care, express care, same-day care, or retail clinic. Plain primary care, family medicine, specialty-only facilities, and occupational-health-only centers are excluded unless explicit general urgent-access service is present.

## Opportunities and entry feasibility

The public demo separates listed acquisitions, sanitized urgent-care acquisition targets, sanitized occupational-medicine targets, and real-estate paths. The occupational-medicine example is synthetic and never contributes to competitor saturation.

Demo Entry Feasibility uses the strongest represented path plus small breadth bonuses. Demo Near-Term Priority v2 is the geometric mean of Demo Expansion Score v2 and Entry Feasibility. These transparent formulas demonstrate product behavior and do not reproduce private Target Priority, Approachability, or production opportunity scoring.

## Site diligence

Market screening and site diligence are separate. Site traffic is displayed only with an opportunity. No market centroid is substituted for an undisclosed site, and no traffic value is invented to fill a card. The current public listing and sanitized scenarios therefore show `Precise location unavailable` unless a defensible public site and official traffic source are present.

## Geography

Official Census ZCTA geometry is retained for public-source lineage, demographic extraction, ZIP routing, and reproducibility. The primary map uses five-mile circles centered on canonical ZCTA centroids as explicit demo analysis areas, not literal ZIP boundaries.
