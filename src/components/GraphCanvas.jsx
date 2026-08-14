import { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';

export default function GraphCanvas({ graph, activeCategory, highlightNode, onNodeClick }) {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);

  // Initial mount: run layout + create sigma instance
  useEffect(() => {
    if (!graph || !containerRef.current) return;

    // Run ForceAtlas2 layout synchronously for a fixed number of iterations.
    // Fine for a few thousand nodes; for much larger graphs, move this to a WebWorker.
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, {
      iterations: 300,
      settings: {
        ...settings,
        gravity: 1,
        scalingRatio: 8,
      },
    });

    const renderer = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      labelRenderedSizeThreshold: 6,
      defaultEdgeColor: '#e0e0e0',
      labelColor: { color: '#333' },
      minCameraRatio: 0.05,
      maxCameraRatio: 10,
    });

    renderer.on('clickNode', ({ node }) => {
      onNodeClick?.(node);
    });

    sigmaRef.current = renderer;

    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // Dim/highlight nodes based on active category filter
  useEffect(() => {
    if (!graph) return;
    graph.forEachNode((node, attrs) => {
      const dimmed = activeCategory && attrs.category !== activeCategory;
      graph.setNodeAttribute(node, 'hidden', false);
      graph.setNodeAttribute(
        node,
        'color',
        dimmed ? '#eaeaea' : attrs._baseColor || attrs.color
      );
      if (!attrs._baseColor) {
        graph.setNodeAttribute(node, '_baseColor', attrs.color);
      }
    });
    sigmaRef.current?.refresh();
  }, [activeCategory, graph]);

  // Highlight a single searched/selected node
  useEffect(() => {
    if (!graph || !sigmaRef.current) return;
    if (!highlightNode) return;
    const camera = sigmaRef.current.getCamera();
    const attrs = graph.getNodeAttributes(highlightNode);
    if (attrs) {
      camera.animate(
        { x: attrs.x, y: attrs.y, ratio: 0.15 },
        { duration: 500 }
      );
    }
  }, [highlightNode, graph]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
