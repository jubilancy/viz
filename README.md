# Taxonomy Graph

An interactive node-graph explorer for tag taxonomies (music, books, film, or
anything else), built with React + Sigma.js + graphology. Deploys
automatically to GitHub Pages via GitHub Actions — no terminal required.

## What's included

- `public/taxonomy.csv` — your data. Two columns: `tag`, `group` (the
  parent tag). Root categories have an empty `group`.
- `src/lib/buildGraph.js` — parses the CSV into a graphology graph, assigns
  colors per top-level category, computes depth for node sizing.
- `src/components/GraphCanvas.jsx` — renders the graph with Sigma.js,
  runs a ForceAtlas2 layout, handles category dimming + node click/focus.
- `src/components/AZIndex.jsx` — searchable A–Z sidebar list of every tag.
- `src/components/Toolbar.jsx` — category filter chips + export buttons.
- `src/lib/exportUtils.js` — PNG export (canvas composite) and CSV export
  (respects the active category filter).
- `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages on
  every push to `main`.

## One-time setup (all done in the browser)

1. **Create the repo.** Push/upload this whole folder to a new GitHub
   repository (drag-and-drop upload on github.com works fine, or use
   GitHub Desktop / Codespaces — no local terminal needed).

2. **Set the Vite base path.** Open `vite.config.js` in the GitHub web
   editor and set `base` to match your repo name:
   ```js
   base: '/viz/',
   ```
   Also update `homepage` in `package.json` to
   `https://jubilancy.github.io/viz`.

3. **Enable GitHub Pages via Actions.**
   - Go to repo **Settings → Pages**
   - Under "Build and deployment", set **Source** to **GitHub Actions**

4. **Allow the workflow to deploy.**
   - Go to **Settings → Actions → General**
   - Under "Workflow permissions," select **Read and write permissions**
   - Save

5. **Push to `main`.** The workflow in `.github/workflows/deploy.yml` runs
   automatically: installs dependencies, builds the Vite app, and deploys
   the `dist/` output to GitHub Pages.

Your site will be live at `https://jubilancy.github.io/viz/`
a minute or two after the Actions run finishes (check the **Actions** tab
for progress/errors).

## Editing your taxonomy

Just edit `public/taxonomy.csv` directly in the GitHub web editor:

```csv
tag,group
Music,
Rock,Music
Shoegaze,Rock
```

- A row with an empty `group` is a top-level/root category (gets its own
  color).
- Every other row's `group` is its parent tag.
- Commit the change → GitHub Actions rebuilds and redeploys automatically.

You can also use GitHub Codespaces (still fully browser-based) if you want
a live local preview (`npm run dev`) while editing, without ever opening a
local terminal on your own machine.

## Notes on scaling to thousands of tags

- ForceAtlas2 layout currently runs synchronously on load (300 iterations),
  which is fine up to a few thousand nodes. If it starts to feel slow,
  lower `iterations` in `GraphCanvas.jsx`, or move the layout computation
  into a Web Worker using `graphology-layout-forceatlas2/worker`.
- Sigma.js renders with WebGL, so it comfortably handles thousands of nodes
  and edges — the A–Z index and category filters are there specifically so
  a dense "hairball" graph stays navigable at that scale.
- Node color = top-level category, node size = inverse of depth (root
  categories are largest).

## Customizing appearance

- Colors: edit the `PALETTE` array in `src/lib/buildGraph.js`.
- Layout feel: tune `gravity` / `scalingRatio` in `GraphCanvas.jsx`'s
  ForceAtlas2 settings.
- Styling: `src/styles.css`.
