/**
 * Exports the current Sigma canvas as a PNG by locating the WebGL canvas
 * element Sigma renders to and triggering a download of its contents.
 */
export function exportCanvasAsPNG(containerEl, filename = 'viz.png') {
  if (!containerEl) return;
  const canvases = containerEl.querySelectorAll('canvas');
  if (canvases.length === 0) return;

  // Composite all Sigma canvas layers (edges, nodes, labels) into one image
  const width = canvases[0].width;
  const height = canvases[0].height;
  const merged = document.createElement('canvas');
  merged.width = width;
  merged.height = height;
  const ctx = merged.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  canvases.forEach((c) => ctx.drawImage(c, 0, 0));

  merged.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Exports the tag/group pairs for the currently active category (or all,
 * if no category is active) as a downloadable CSV file.
 */
export function exportFilteredCSV(graph, activeCategory, filename = 'taxonomy-filtered.csv') {
  if (!graph) return;
  const rows = [['tag', 'group']];

  graph.forEachNode((node, attrs) => {
    if (activeCategory && attrs.category !== activeCategory) return;
    const parents = graph.outNeighbors(node);
    const group = parents.length > 0 ? parents[0] : '';
    rows.push([node, group]);
  });

  const csvContent = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
