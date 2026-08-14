import { useMemo, useState } from 'react';

export default function AZIndex({ tags, onSelect }) {
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const filtered = tags.filter((t) =>
      t.toLowerCase().includes(query.toLowerCase())
    );
    const map = {};
    filtered.sort((a, b) => a.localeCompare(b)).forEach((tag) => {
      const letter = tag[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(tag);
    });
    return map;
  }, [tags, query]);

  const letters = Object.keys(grouped).sort();

  return (
    <div className="az-index">
      <input
        className="az-search"
        type="text"
        placeholder="Search tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="az-list">
        {letters.length === 0 && <div className="az-empty">No matches</div>}
        {letters.map((letter) => (
          <div key={letter} className="az-group">
            <div className="az-letter">{letter}</div>
            {grouped[letter].map((tag) => (
              <button
                key={tag}
                className="az-tag"
                onClick={() => onSelect(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
