import { useEffect, useRef, useState } from 'react';
import GraphCanvas from './components/GraphCanvas.jsx';
import AZIndex from './components/AZIndex.jsx';
import Toolbar from './components/Toolbar.jsx';
import { loadTaxonomyGraph } from './lib/buildGraph.js';
import { exportCanvasAsPNG, exportFilteredCSV } from './lib/exportUtils.js';

const CSV_URL = `${import.meta.env.BASE_URL}taxonomy.csv`;

export default function App() {
  const [graphData, setGraphData] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [highlightNode, setHighlightNode] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const canvasWrapperRef = useRef(null);

  useEffect(() => {
    loadTaxonomyGraph(CSV_URL).then(setGraphData);
  }, []);

  if (!graphData) {
    return <div className="loading">Loading taxonomy…</div>;
  }

  const { graph, rootNames, rootColor } = graphData;
  const allTags = graph.nodes();

  const handleSelectFromIndex = (tag) => {
    setHighlightNode(tag);
    const attrs = graph.getNodeAttributes(tag);
    const parents = graph.outNeighbors(tag);
    setSelectedInfo({
      tag,
      category: attrs.category,
      parent: parents[0] || null,
      children: graph.inNeighbors(tag),
    });
  };

  const handleNodeClick = (node) => {
    handleSelectFromIndex(node);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Taxonomy Graph</h1>
        <p className="app-subtitle">
          Music · Books · Film — tag relationships
        </p>
      </header>

      <Toolbar
        rootNames={rootNames}
        rootColor={rootColor}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onExportPNG={() => exportCanvasAsPNG(canvasWrapperRef.current)}
        onExportCSV={() => exportFilteredCSV(graph, activeCategory)}
      />

      <div className="main-layout">
        <aside className="sidebar">
          <AZIndex tags={allTags} onSelect={handleSelectFromIndex} />
        </aside>

        <div className="canvas-area" ref={canvasWrapperRef}>
          <GraphCanvas
            graph={graph}
            activeCategory={activeCategory}
            highlightNode={highlightNode}
            onNodeClick={handleNodeClick}
          />
        </div>

        <aside className="detail-panel">
          {selectedInfo ? (
            <div>
              <h3>{selectedInfo.tag}</h3>
              <p className="detail-category" style={{ color: rootColor[selectedInfo.category] }}>
                {selectedInfo.category}
              </p>
              {selectedInfo.parent && (
                <p>
                  <strong>Parent:</strong> {selectedInfo.parent}
                </p>
              )}
              {selectedInfo.children.length > 0 && (
                <div>
                  <strong>Children:</strong>
                  <ul>
                    {selectedInfo.children.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="detail-empty">
              Click a node or search the A–Z index to see details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
