/* GPAce — Tweaks Panel Component */
const { useState } = React;

/**
 * Custom hook for managing tweaks with persistence
 */
window.useTweaks = function(defaults) {
  const [tweaks, setTweaks] = useState(() => {
    const saved = localStorage.getItem('gpace_tweaks_ad');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  const setTweak = (key, value) => {
    setTweaks(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('gpace_tweaks_ad', JSON.stringify(next));
      return next;
    });
  };

  return [tweaks, setTweak];
};

window.TweaksPanel = ({ children, title = "Tweaks" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`tweaks-panel ${isOpen ? 'is-open' : ''}`}>
      <button className="tweaks-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle tweaks">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

window.TweakSection = ({ label, children }) => (
  <div className="tweak-section">
    <span className="tweak-label">{label}</span>
    {children}
  </div>
);

window.TweakSlider = ({ label, min, max, step, value, onChange }) => (
  <div className="tweak-control">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontSize: '13px' }}>{label}</span>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{value}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent)' }}
    />
  </div>
);

window.TweakRadio = ({ label, options, value, onChange }) => (
  <div className="tweak-control">
    <span style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>{label}</span>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--line)',
            background: value === opt.value ? 'var(--accent)' : 'transparent',
            color: value === opt.value ? 'white' : 'var(--text-2)',
            cursor: 'pointer'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);
