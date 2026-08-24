# Demo Methodology

## Important limitation

The public demo uses simplified illustrative scoring. It does not reproduce the production model, production weights, production thresholds, or private opportunity evidence methodology.

## Demo Expansion Score

Model identifier: demo_expansion_score_v1.

Five normalized 0-100 components are combined using public illustrative weights:

| Component | Weight | Direction |
| --- | ---: | --- |
| Population / Demand | 25% | Higher is favorable |
| Population Growth | 20% | Higher is favorable |
| Competitive Saturation | 25% | Lower raw saturation is favorable |
| Healthcare Access Gap | 15% | Higher gap is favorable |
| Employment / Activity | 15% | Higher activity is favorable |

The synthetic generator supplies transparent deterministic normalization. Missing production-data behavior is outside the scope of this demo.

## Competitor saturation

The raw KPI is competitors per 10,000 synthetic residents. Its demo normalized value already handles lower-is-better directionality.

| Normalized score | Display |
| ---: | --- |
| 80-100 | ++ |
| 60 to less than 80 | + |
| 40 to less than 60 | ○ |
| 20 to less than 40 | - |
| 0 to less than 20 | -- |

## Illustrative acquisition signals

| Signal | Demo effect |
| --- | ---: |
| Independent operator | +10 |
| Single site | +10 |
| Limited hours | +5 |
| Active listing | +30 |
| Institutional operator | -20 |
| Recent acquisition | -15 |

The approachability demonstration starts from a neutral demo baseline and clamps results to 0-100. These signals are not predictions of seller intent.

## Entry Feasibility

Possible paths are listed acquisition, illustrative off-market target, and real estate. The strongest path provides the base score, with small bonuses for a second and third viable path. Missing paths do not penalize a strong path.

## Near-Term Expansion Priority

Near-Term Expansion Priority is the geometric mean of Demo Expansion Score and Demo Entry Feasibility. This simple public formula penalizes a serious weakness in either dimension and does not reproduce the production combination methodology.

