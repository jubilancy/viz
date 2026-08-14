export default function Toolbar({
  rootNames,
  rootColor,
  activeCategory,
  setActiveCategory,
  onExportPNG,
  onExportCSV,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Category</span>
        <div className="chip-row">
          <button
            className={`chip ${activeCategory === null ? 'chip-active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {rootNames.map((name) => (
            <button
              key={name}
              className={`chip ${activeCategory === name ? 'chip-active' : ''}`}
              style={{
                borderColor: rootColor[name],
                color: activeCategory === name ? '#fff' : rootColor[name],
                background: activeCategory === name ? rootColor[name] : 'transparent',
              }}
              onClick={() => setActiveCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar-section toolbar-export">
        <button className="export-btn" onClick={onExportPNG}>
          Export PNG
        </button>
        <button className="export-btn" onClick={onExportCSV}>
          Export CSV
        </button>
      </div>
    </div>
  );
}
