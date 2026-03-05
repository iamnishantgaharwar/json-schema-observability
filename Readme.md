# JSON Schema Ecosystem Observatory

A proof-of-concept automated observability dashboard for the JSON Schema ecosystem, built as a GSoC qualification task for [json-schema-org/ecosystem](https://github.com/json-schema-org/ecosystem).

🔗 **Live dashboard:** [jsonschema.nishantgaharwar.com](https://jsonschema.nishantgaharwar.com)

---

## What it does

This project automatically tracks and visualizes health metrics for the JSON Schema validator ecosystem:

- **npm download trends** — weekly and daily download counts for `ajv`, `jsonschema`, `z-schema`, `tv4`, and `ajv-formats`
- **Bowtie compliance scores** — how well each validator passes the official JSON Schema Test Suite (draft2020-12)
- **Historical snapshots** — data is collected weekly and stored as JSON files, enabling trend analysis over time

---

## Project structure

```
json-schema-observability/
├── src/
│   └── fetch.ts              # Fetches npm download stats, saves snapshots
├── data/
│   ├── snapshot-YYYY-MM-DD.json   # Weekly npm download snapshots
│   └── bowtie-raw.jsonl           # Raw Bowtie test suite output (NDJSON)
├── index.html                # Dashboard UI (Chart.js + Oat.ink)
├── .github/
│   └── workflows/
│       └── collect.yml       # GitHub Actions — runs every Monday
├── package.json
└── tsconfig.json
```

---

## Running locally

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/iamnishantgaharwar/json-schema-observability
cd json-schema-observability
npm install
```

### Fetch fresh data

```bash
npm run fetch
```

This calls the npm downloads API and saves a snapshot to `data/snapshot-YYYY-MM-DD.json`.

### View the dashboard

Open `index.html` in your browser directly, or serve it locally:

```bash
npx serve .
# then open http://localhost:3000
```

> The dashboard reads from `data/` automatically. No backend needed.

---

## Automation

Data is collected automatically every Monday at 6am UTC via GitHub Actions.

The workflow (`.github/workflows/collect.yml`):

1. Runs `npm run fetch` to pull latest npm download stats
2. Runs `bowtie suite draft2020-12` against tracked implementations
3. Commits the new snapshot files back to the repo
4. GitHub Pages serves the updated dashboard automatically

To trigger manually: go to **Actions → Weekly Ecosystem Metrics → Run workflow**.

---

## Metrics tracked

### npm Downloads

Fetched from the [npm Downloads API](https://api.npmjs.org/) — no authentication required.

| Package | Why tracked |
|---|---|
| `ajv` | Most popular JSON Schema validator |
| `jsonschema` | Most popular Python validator (npm mirror) |
| `z-schema` | Widely used alternative |
| `tv4` | Legacy validator, shows decline trends |
| `ajv-formats` | Companion package to ajv |

### Bowtie Compliance

Measured using [Bowtie](https://bowtie.report) — the official JSON Schema compliance testing tool. It runs the [JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) against each implementation and reports pass/fail/error counts.

Results from latest run (draft2020-12):

| Implementation | Compliance |
|---|---|
| python-jsonschema | 99.92% |
| js-hyperjump | 99.69% |
| js-ajv | 80.58% |

---

## Tech stack

- **TypeScript + Node.js** — data fetching script
- **Chart.js** — dashboard charts
- **Oat.ink** — lightweight UI component library
- **GitHub Actions** — weekly automation
- **GitHub Pages** — static hosting

---

## AI assistance

Claude (Anthropic) was used to assist with parts of this project, including debugging the Bowtie JSONL parser, fixing the GitHub Actions workflow syntax, and writing the `bowtie.ts` compliance parser. All code has been reviewed and I'm able to explain every part of it.