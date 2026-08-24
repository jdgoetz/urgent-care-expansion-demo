# Contributing

Use a short-lived feature, fix, or docs branch and open a pull request into main.

Before a PR, run:

    npm.cmd test
    npm.cmd run typecheck
    npm.cmd run db:check

Database changes require a new sequential migration. Do not rewrite applied migrations.

Never commit credentials, private environment files, real healthcare targets, production exports, proprietary search queries, or production scoring logic. This repository accepts synthetic and clearly documented demo data only.

Generated runtime output belongs in ignored directories. A deliberately curated sample under docs may be versioned when it improves the public case study.

Scoring changes must update docs/methodology.md, retain the demo model prefix, and state clearly that the model is illustrative. Pull requests should summarize purpose, major changes, migration impact, demo-model impact, UI/report impact, tests, and limitations.

