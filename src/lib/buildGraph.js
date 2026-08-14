import Graph from 'graphology';
import Papa from 'papaparse';

// A fixed palette assigned per top-level category (root nodes = rows with empty group)
const PALETTE = [
  '#e07a5f', '#81b29a', '#f2cc8f', '#3d5a80', '#9c89b8',
  '#e76f51', '#2a9d8f', '#e9c46a', '#457b9d', '#bc6c25',
];

/**
 * Fetches and parses the taxonomy CSV, returning a graphology Graph instance.
 * CSV columns: tag, group
 *   - "group" is the parent tag of "tag". Empty group = top-level/root category.
 */
export async function loadTaxonomyGraph(csvUrl) {
  const res = await fetch(csvUrl);
  const text = await res.text();

  const parsed = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data.map((r) => ({
    tag: (r.tag || '').trim(),
    group: (r.group || '').trim(),
  })).filter((r) => r.tag.length > 0);

  const graph = new Graph({ multi: false, type: 'directed' });

  // First pass: add all nodes
  rows.forEach((row) => {
    if (!graph.hasNode(row.tag)) {
      graph.addNode(row.tag, {
        label: row.tag,
        isRoot: row.group === '',
      });
    }
  });

  // Second pass: add parent nodes referenced but not explicitly listed as a tag row
  rows.forEach((row) => {
    if (row.group && !graph.hasNode(row.group)) {
      graph.addNode(row.group, {
        label: row.group,
        isRoot: true,
      });
    }
  });

  // Determine each node's top-level root category (for coloring)
  const parentOf = {};
  rows.forEach((row) => {
    if (row.group) parentOf[row.tag] = row.group;
  });

  function findRoot(tag, seen = new Set()) {
    if (seen.has(tag)) return tag; // cycle guard
    seen.add(tag);
    const parent = parentOf[tag];
    if (!parent) return tag;
    return findRoot(parent, seen);
  }

  const rootNames = [...new Set(
    graph.nodes().map((n) => findRoot(n))
  )].sort();

  const rootColor = {};
  rootNames.forEach((r, i) => {
    rootColor[r] = PALETTE[i % PALETTE.length];
  });

  // Assign visual attributes
  graph.forEachNode((node, attrs) => {
    const root = findRoot(node);
    const depth = getDepth(node, parentOf);
    graph.mergeNodeAttributes(node, {
      color: rootColor[root] || '#999999',
      category: root,
      depth,
      size: attrs.isRoot ? 14 : Math.max(4, 9 - depth),
      x: Math.random(),
      y: Math.random(),
    });
  });

  // Add edges (child -> parent)
  rows.forEach((row) => {
    if (row.group && graph.hasNode(row.tag) && graph.hasNode(row.group)) {
      if (!graph.hasEdge(row.tag, row.group)) {
        graph.addEdge(row.tag, row.group, {
          size: 1,
          color: '#d8d8d8',
        });
      }
    }
  });

  return { graph, rootNames, rootColor };
}

function getDepth(tag, parentOf, seen = new Set()) {
  if (seen.has(tag)) return 0;
  seen.add(tag);
  const parent = parentOf[tag];
  if (!parent) return 0;
  return 1 + getDepth(parent, parentOf, seen);
}
