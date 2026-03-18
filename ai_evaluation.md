# This File is generated through ai using my own content in case you are not able to understand it because I didn't use any punctuation in human_evaluation.md and it is purely written by me
# Part 2 — Evaluation of Existing Code

> Evaluating the proof-of-concept in `projects/initial-data/` of the
> [json-schema-org/ecosystem](https://github.com/json-schema-org/ecosystem) repository.

---

## Did I try running it?

Yes, I cloned the project and ran it locally. Here's what I found.

---

## What does it do well?

**1. Has tests with a mock server**
The project includes `processRepository.test.js` with Jest and a mock API server
(`mocks/server.js`, `mocks/handlers.js`). This is good practice — tests run without
hitting real GitHub API limits and make the code easier to verify.

**2. Transparent README**
The README is honest about the tool being slow and having limitations.

**3. Actually ran once**
The committed file `initialTopicRepoData-1711533629611.csv` (timestamp = March 27, 2024)
shows the script was actually executed and produced real data — it's not just theoretical.

---

## Setup Experience

The README doesn't mention which Node version is required or which Python packages
are needed (csvkit, gnuplot). The project also requires `pnpm` but this isn't clearly
stated — attempting to use `npm install` doesn't work the same way. Once I switched
to `pnpm install` it installed the correct Node version automatically and gave proper
error messages for missing `GITHUB_TOKEN` and `TOPIC` in `.env`.

**What README should include:**
- Required Node version
- Required Python packages (csvkit, gnuplot) and how to install them
- That `pnpm` is required, not `npm`

---

## Bug Found — `data/` directory not created automatically

When running `node start.js` for the first time it crashes because the `data/` folder
doesn't exist. The `DataRecorder` class only checks if the **file** exists, not the
**directory**:

**Before:**
```javascript
#createFile() {
    if (!fs.existsSync(this.fileName)) {
        const headerLine = `${this.columns.join(',')}\n`;
        fs.writeFileSync(this.fileName, headerLine, 'utf8') // crashes if data/ missing
    }
}
```

**After:**
```javascript
import path from 'path'

#createFile() {
    const dir = path.dirname(this.fileName)
    fs.mkdirSync(dir, { recursive: true }) // creates data/ if missing
    if (!fs.existsSync(this.fileName)) {
        const headerLine = `${this.columns.join(',')}\n`;
        fs.writeFileSync(this.fileName, headerLine, 'utf8')
    }
}
```

---

## Pipeline is Manual — Should Be Automated

After the script finishes you still have to manually run 3 separate commands to sort,
process, and visualize the data. This should all happen automatically via npm scripts:

```json
"scripts": {
    "start": "node start.js && npm run process",
    "process": "csvsort -c creation data/initialTopicRepoData-latest.csv > data/sorted_data.csv && csvcut -c creation data/sorted_data.csv | awk -F, '{print $1/1000, 1}' | csvformat -U 0 > data/processed_data.csv",
    "graph": "gnuplot -p -e \"set xdata time; set timefmt '%s'; set format x '%Y-%m-%d'; plot 'data/processed_data.csv' using 1:2 smooth cumulative with lines\""
}
```

One limitation — if csvkit or gnuplot aren't installed this silently fails. Ideally
the script should check for these dependencies before running and give a clear error
message.

---

## Core Logic Issue — Initial Commit Problem

The `fetchFirstCommitDate` function uses a clever 2-call trick to jump directly to
the last page of commits and get the oldest one. However the oldest commit for most
repos is just the default GitHub initial commit:

```
"Initial commit"
  - README.md
  - .gitignore
```

This tells us nothing about when JSON Schema was adopted. I proved this with AJV —
its first commit had no `package.json` at all, so checking it gives completely wrong
results.

The function collects the wrong data for the stated goal. Getting the first commit
date of a repo is not the same as getting when json-schema was first adopted.

---

## Internet Archive — Documented But Never Implemented

The README describes using the Internet Archive API as a core feature. After reviewing
all source files (`main.js`, `start.js`, `setup.js`, `dataRecorder.js`) there is
**zero Internet Archive code anywhere**. The feature was planned but never built.

Additionally the README states a rate limit of 500 requests/hour. The actual limit
confirmed by an Internet Archive engineer is **60 requests/minute** with IP bans
that double on each violation.

Source: https://github.com/edgi-govdata-archiving/wayback/issues/137

---

## GitHub Search API — 1,000 Result Cap

Despite using `octokit.paginate.iterator`, the GitHub Search API hard caps at 1,000
total results. There are 54,000+ repos using the `json-schema` topic. The script
silently collects less than 2% of actual data with no warning.

Fix: paginate by `created` date ranges — query repos created in 2015, then 2016 etc.
— staying under the 1,000 cap per query while covering the full dataset.

---

## Two Additional Code Bugs

**Missing `return` in `fetchFirstCommitDate`:**
```javascript
if (!lastPageUrl) {
    if (response.data.length > 0) {
        response.data[0].commit.author.date  // ← no return! silently returns undefined
    }
}
```

**Same missing `return` in `fetchFirstReleaseDate`:**
```javascript
if (!lastPageUrl) {
    if (response.data.length > 0) {
        response.data[0].created_at  // ← no return! same bug
    }
}
```

Both functions silently return `undefined` for repos with a single page of
commits/releases. This corrupts the CSV data with no error or warning.

---

## Recommendation

Both continuing with this project or starting fresh are valid paths.

**If continuing:** fix the `DataRecorder` bug, automate the pipeline, convert to
TypeScript (1-2 days of work), replace gnuplot with Chart.js or Recharts in an
`index.html` — this removes the Python dependency entirely and the whole workflow
becomes just `npm start` to go from data collection to visualization.

**If starting fresh:** keep the core metric idea (ecosystem growth over time) and
the GitHub topic API approach, but rebuild with proper pagination, rate limiting,
automation, and a web-based visualization from day one.

---

## Better Approach for Early Adopter Detection

Instead of checking the initial commit use a two-step approach:

- If repo is **less than 2 years old** and has `json-schema` topic → mark as early
  adopter directly (no extra API call needed — json-schema was already well established
  so using it was a deliberate choice)
- If repo is **older than 2 years** → check GitHub commits API for when `json-schema`
  first appeared in `package.json` dependencies or keywords, and only fall back to
  Internet Archive if needed

This reduces Internet Archive calls significantly and gives more accurate results
than checking the initial commit date. It also avoids the IP ban risk that comes with
hitting the Internet Archive API for tens of thousands of repos.

---

## How This Relates to My Part 1 Implementation

My dashboard at [jsonschema.nishantgaharwar.com](https://jsonschema.nishantgaharwar.com)
takes a complementary approach — tracking npm download trends and Bowtie compliance
scores rather than GitHub adoption patterns. The two approaches measure different
aspects of ecosystem health and would work well together as part of a broader
observability system.