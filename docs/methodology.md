# Demo Methodology

## Important limitation

The public demo combines real public observations with simplified illustrative scoring. It does not reproduce production components, weights, thresholds, normalization, or private opportunity evidence methodology.

Official Census ZCTA geometry is retained for public-source lineage, demographic extraction, ZIP routing, and reproducibility. The primary map deliberately renders five-mile circular overlays centered on each canonical ZCTA centroid. These circles are curated market analysis areas, not literal ZIP boundaries, and do not alter any metric or score.

## Demo Expansion Score

Model identifier: demo_expansion_score_v1.

Five normalized 0-100 components are combined using public illustrative weights:

| Component | Weight | Raw input | Direction |
| --- | ---: | --- | --- |
| Population / Demand | 25% | 2024 ACS population | Higher is favorable |
| Population Growth | 20% | 2019-to-2024 ACS change | Higher is favorable |
| Competitive Saturation | 25% | Curated competitors per 10,000 | Lower is favorable |
| Healthcare Access Gap | 15% | ACS uninsured share | Higher gap is favorable |
| Employment / Activity | 15% | ACS employed share, population 16+ | Higher is favorable |

Raw values are min-max normalized across the fixed nine-market public comparison universe. Missing values are not silently converted to zero. These comparison mechanics do not reproduce production normalization.

## Competitor saturation

The raw KPI is curated competitors per 10,000 ACS residents. Its demo normalized value handles lower-is-better directionality. The public competitor snapshot is deliberately small and is not represented as an exhaustive market census.

| Normalized score | Display |
| ---: | --- |
| 80-100 | ++ |
| 60 to less than 80 | + |
| 40 to less than 60 | ○ |
| 20 to less than 40 | - |
| 0 to less than 20 | -- |

## Public and illustrative opportunity paths

| Path | Public-demo status |
| --- | --- |
| Listed acquisition | Linked factual public listing snapshot |
| Off-market target | Sanitized illustrative case study |
| Real estate / de novo | Illustrative scenario unless linked to a public listing |

Hoffman Estates contains concise facts from a linked public listing, last verified August 25, 2026. Royersford contains a sanitized off-market case that does not identify a private operator. Real-estate paths are illustrative unless explicitly linked to an active public source. Demo path scores are not predictions of seller intent.

## Entry Feasibility

Possible paths are listed acquisition, illustrative off-market target, and real estate. The strongest path provides the base score, with small bonuses for a second and third viable path. Missing paths do not penalize a strong path.

## Near-Term Expansion Priority

Near-Term Expansion Priority is the geometric mean of Demo Expansion Score and Demo Entry Feasibility. This simple public formula penalizes a serious weakness in either dimension and does not reproduce the production combination methodology.
