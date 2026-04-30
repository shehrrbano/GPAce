/* GPAce — Academic Details React Logic */
console.log('[AcademicDetails] JSX script starting...');
const { useState, useEffect, useMemo } = React;

// Note: SemesterService and StorageService should be available globally 
// or imported via a bridge if using in-browser Babel.
// For this implementation, we'll assume they are available on window 
// as many GPAce services register themselves there.

const IconAD = ({ name, size = 18, stroke = 2 }) => {
  const paths = {
    flame: <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 8 12 8 13a4 4 0 0 0 8 0c0-3-2-6-4-10z" />,
    target: <g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></g>,
    chart: <g><path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 16l4-5 3 3 5-7" /></g>,
    brain: <g><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 4v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3z" /><path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 4v0a3 3 0 0 1-3 3" /></g>,
    settings: <g><circle cx="12" cy="12" r="3" /><path d="M19 13a1.7 1.7 0 0 0 0 -2l1-1-2-3-1 .5a1.7 1.7 0 0 1 -2-1L14 5h-4l-1 1.5a1.7 1.7 0 0 1-2 1l-1-.5-2 3 1 1a1.7 1.7 0 0 0 0 2l-1 1 2 3 1-.5a1.7 1.7 0 0 1 2 1L10 19h4l1-1.5a1.7 1.7 0 0 1 2-1l1 .5 2-3z" /></g>,
    bell: <g><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></g>,
    cloud: <path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5-2A4 4 0 0 0 7 18z" />,
    drive: <g><rect x="3" y="6" width="18" height="13" rx="2" /><line x1="7" y1="11" x2="9" y2="11" /></g>,
    info: <g><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="8.5" /><line x1="12" y1="11" x2="12" y2="16" /></g>,
    plus: <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    chevD: <polyline points="6 9 12 15 18 9" />,
    sun: <g><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></g>,
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
    list: <g><line x1="8" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="8" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></g>,
    book: <g><path d="M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2z" /><line x1="9" y1="3" x2="9" y2="21" /></g>,
    sparkles: <g><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></g>,
    edit: <g><path d="M14 4l6 6-11 11H3v-6z" /><path d="M14 4l3-3 6 6-3 3" /></g>,
    trash: <g><polyline points="4 7 20 7" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></g>,
    save: <g><path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /><polyline points="7 4 7 9 14 9 14 4" /><rect x="7" y="14" width="10" height="6" /></g>,
    check: <polyline points="4 12 10 18 20 6" />,
    archive: <g><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><line x1="10" y1="12" x2="14" y2="12" /></g>,
    storage: <g><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const TWEAK_DEFAULTS_AD = {
  "accentHue": 217,
  "background": "deep",
  "showArchived": false
};

function AppAD() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS_AD);
  const [semester, setSemester] = useState("Default");
  const [allSemesters, setAllSemesters] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [count, setCount] = useState("");
  const [bulk, setBulk] = useState("");
  const [storageStats, setStorageStats] = useState({ gpaceSizeKB: 0, totalSizeKB: 0 });

  // Sync with Backend (SemesterService)
  useEffect(() => {
    const initData = async () => {
      if (window.SemesterService) {
        await window.SemesterService.initialize();
        const current = window.SemesterService.getCurrentSemester();
        const semesters = window.SemesterService.getAllSemesters();
        setSemester(current);
        setAllSemesters(semesters);
        const currentSubjects = semesters[current]?.subjects || [];
        setSubjects(currentSubjects);
        
        // Auto-load example data if empty and it's default/new
        if (currentSubjects.length === 0 && (current === 'default' || current === 'Spring 2025')) {
            console.log('[App] Loading example data from timetable...');
            loadExampleData();
        }
      }
      if (window.storageService) {
        setStorageStats(window.storageService.getStats());
      }
    };
    initData();

    // Subscribe to changes
    if (window.SemesterService) {
      const unsubscribe = window.SemesterService.subscribe((event) => {
        if (event.type === 'semester-change' || event.type === 'semester-updated' || event.type === 'semester-created') {
          const semesters = window.SemesterService.getAllSemesters();
          setAllSemesters(semesters);
          if (event.currentSemester) setSemester(event.currentSemester);
          setSubjects(semesters[event.currentSemester || semester]?.subjects || []);
        }
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent-hue", tweaks.accentHue);
    root.dataset.bg = tweaks.background;
  }, [tweaks.accentHue, tweaks.background]);

  const handleSemesterChange = (newSem) => {
    setSemester(newSem);
    if (window.SemesterService) {
      window.SemesterService.setCurrentSemester(newSem);
    }
  };

  const parseBulk = () => {
    const lines = bulk.split("\n").map(l => l.trim()).filter(Boolean);
    const newSubs = lines.map((l, i) => {
      const lastCommaIndex = l.lastIndexOf(',');
      let name = l, cr = 3;
      if (lastCommaIndex !== -1) {
        name = l.substring(0, lastCommaIndex).trim();
        cr = Number(l.substring(lastCommaIndex + 1).trim()) || 3;
      }
      return { 
        id: Date.now() + i, 
        name: name || "Untitled", 
        creditHours: cr, 
        tag: (name || "SUBJ").toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) + Math.floor(Math.random() * 100),
        relativeScore: 0,
        cognitiveDifficulty: 50,
        academicPerformance: 50
      };
    });
    
    const updatedSubjects = [...subjects, ...newSubs];
    setSubjects(updatedSubjects);
    saveToBackend(updatedSubjects);
    setBulk("");
  };

  const saveToBackend = (updatedSubjects) => {
    if (window.SemesterService) {
      window.SemesterService.updateSemester(semester, { subjects: updatedSubjects });
      
      // Notify other components (like flashcards)
      const subjectsChangedEvent = new CustomEvent('subjectsChanged', {
        detail: { subjects: updatedSubjects, semester: semester }
      });
      window.dispatchEvent(subjectsChangedEvent);

      if (window.saveSubjectsToFirestore) {
        window.saveSubjectsToFirestore(updatedSubjects, semester);
      }
    }
  };

  const loadExampleData = () => {
    const example = [
      { name: "Compressible Aerodynamics", creditHours: 3 },
      { name: "Computer Aided Drafting", creditHours: 1 },
      { name: "Mechanics of Materials", creditHours: 3 },
      { name: "Mechanics of Materials Lab", creditHours: 1 },
      { name: "Control Systems", creditHours: 3 },
      { name: "Control Systems Lab", creditHours: 1 },
      { name: "Engineering Mathematics", creditHours: 3 },
      { name: "Numerical Analysis", creditHours: 2 },
      { name: "Numerical Analysis Lab", creditHours: 1 },
    ].map((s, i) => ({
      ...s,
      id: "ex-" + i,
      tag: s.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) + (10 + i),
      relativeScore: 0,
      cognitiveDifficulty: 60,
      academicPerformance: 0
    }));
    setSubjects(example);
    saveToBackend(example);
  };

  const removeSubject = (id) => {
    const updated = subjects.filter(x => x.id !== id && x.tag !== id); // handle both types of IDs
    setSubjects(updated);
    saveToBackend(updated);
  };

  const totalCredits = useMemo(() => subjects.reduce((s, x) => s + (Number(x.creditHours) || 0), 0), [subjects]);
  const storagePercent = Math.min(100, (storageStats.gpaceSizeKB / 102.4) * 100); // Assume 10MB limit

  return (
    <div className="app">
      <TopBarAD />

      <main className="acd-stage">
        <div className="acd-header">
          <h1 className="acd-h1">Academic Details</h1>
          <p className="acd-sub">Manage subjects, credits and semester data. GPAce uses these to weight your tasks and project your GPA.</p>
        </div>

        {/* Semester card */}
        <section className="card acd-card sem-card">
          <div className="sem-head">
            <div className="sem-l">
              <div className="sem-title">
                <h2>{allSemesters[semester]?.name || semester}</h2>
                <div className="sem-chips">
                  <span className="chip-tag synced"><IconAD name="cloud" size={11} /> Cloud Synced</span>
                  <span className="chip-tag local"><IconAD name="drive" size={11} /> Local Storage Only</span>
                </div>
              </div>
              <p className="sem-help"><IconAD name="info" size={12} /> Select or create a semester to manage subject data separately for different academic periods.</p>
            </div>
            <div className="sem-r">
              <div className="sem-select-wrap">
                <label className="sem-label">Select Semester</label>
                <div className="sem-select">
                  <select value={semester} onChange={(e) => handleSemesterChange(e.target.value)}>
                    {Object.keys(allSemesters).map(id => (
                      <option key={id} value={id}>{allSemesters[id].name}</option>
                    ))}
                  </select>
                  <IconAD name="chevD" size={14} />
                </div>
              </div>
              <button className="icon-btn lg" aria-label="Semester options"><IconAD name="settings" size={15} /></button>
            </div>
          </div>
          <div className="sem-foot">
            <div className="storage-row">
              <span className="storage-track"><span className="storage-fill" style={{ width: `${storagePercent}%` }} /></span>
              <span className="muted small">Storage · {storageStats.gpaceSizeKB.toFixed(1)} of 10240 KB used</span>
            </div>
            <div className="sem-toggles">
              <label className="switch">
                <input type="checkbox" checked={tweaks.showArchived} onChange={(e) => setTweak("showArchived", e.target.checked)} />
                <span className="slider" />
                <span className="switch-label">Show Archived</span>
              </label>
              <a href="#" className="link-btn"><IconAD name="storage" size={13} /> Manage Storage</a>
            </div>
          </div>
        </section>

        {/* Add new subject card */}
        <section className="card acd-card newsubj-card">
          <div className="card-head simple">
            <div className="card-icon"><IconAD name="plus" size={16} /></div>
            <div>
              <h2 className="card-title">Add New Subject</h2>
              <p className="card-sub">Generate empty forms or paste a bulk list from your registrar.</p>
            </div>
          </div>

          <div className="form-row">
            <label className="field-label">Enter Number of Subjects</label>
            <div className="form-inline">
              <input
                type="number" min="1" max="20"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="acd-input"
                placeholder="e.g. 5"
              />
              <button className="btn-primary"><IconAD name="sparkles" size={13} /> Generate Forms</button>
            </div>
          </div>

          <div className="div-or"><span>or</span></div>

          <div className="form-row">
            <label className="field-label">Bulk Add Subjects</label>
            <div className="muted small format-hint">Format: <code>Subject Name, Credit Hours</code> — one per line</div>
            <textarea
              className="acd-textarea"
              rows="5"
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={"Linear Algebra, 4\nMechanics, 4\nCognitive Neuroscience, 3"}
            />
            <div className="form-actions">
              <button className="btn-primary" onClick={parseBulk} disabled={!bulk.trim()}>
                <IconAD name="check" size={13} /> Add Subjects
              </button>
              <span className="muted small">{bulk.split("\n").filter(l => l.trim()).length} line(s) detected</span>
            </div>
          </div>
        </section>

        {/* Existing subjects */}
        <section className="card acd-card">
          <div className="card-head simple">
            <div className="card-icon"><IconAD name="book" size={16} /></div>
            <div>
              <h2 className="card-title">Subjects · {subjects.length}</h2>
              <p className="card-sub">{totalCredits} total credits this semester</p>
            </div>
          </div>
          <div className="subj-list">
            {subjects.map((s, idx) => (
              <div key={s.id || s.tag || idx} className="subj-row">
                <div className="subj-pip" style={{ background: `oklch(0.62 0.14 ${(idx * 47) % 360})` }} />
                <div className="subj-name">{s.name}</div>
                <div className="subj-credits"><strong>{s.creditHours}</strong><span>cr</span></div>
                <div className="subj-actions">
                  <button className="ss-btn" aria-label="Edit"><IconAD name="edit" size={13} /></button>
                  <button className="ss-btn" aria-label="Archive"><IconAD name="archive" size={13} /></button>
                  <button className="ss-btn" onClick={() => removeSubject(s.id || s.tag)} aria-label="Delete"><IconAD name="trash" size={13} /></button>
                </div>
              </div>
            ))}
            {subjects.length === 0 && <p className="muted small" style={{textAlign:'center', padding:'20px'}}>No subjects added yet. Use the forms above to add subjects.</p>}
          </div>
        </section>
      </main>

      <button className="theme-fab" aria-label="Toggle theme" onClick={() => {
        const isLight = document.body.classList.toggle('light-theme');
        if (window.storageService) window.storageService.set('theme', isLight ? 'light' : 'dark');
      }}>
        <IconAD name="sun" size={14} />
        <span>Toggle Theme</span>
      </button>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakSlider label="Accent hue" min={0} max={360} step={1} value={tweaks.accentHue} onChange={(v) => setTweak("accentHue", v)} />
          <TweakRadio label="Background" value={tweaks.background} options={[{value:"deep",label:"Deep"},{value:"midnight",label:"Midnight"},{value:"slate",label:"Slate"}]} onChange={(v) => setTweak("background", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function TopBarAD() {
  const tabs = [
    { id: "grind", label: "Grind Mode", icon: "flame", href: "grind.html" },
    { id: "feedback", label: "Test Feedback", icon: "check", href: "instant-test-feedback.html" },
    { id: "station", label: "Grind Station", icon: "target", href: "workspace.html" },
    { id: "drip", label: "Daily Drip", icon: "chart", href: "daily-calendar.html" },
    { id: "juice", label: "Brain Juice", icon: "brain", active: true },
  ];
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
           <IconAD name="target" size={24} />
        </div>
        <div className="brand-name">GPAce</div>
        <div className="brand-meta">Mon · Apr 27</div>
      </div>
      <nav className="tabs">
        {tabs.map(t => (
          <a key={t.id} className={"tab" + (t.active ? " is-active" : "")} href={t.href || "#"}><IconAD name={t.icon} size={15} /><span>{t.label}</span></a>
        ))}
      </nav>
      <div className="top-right">
        <button className="icon-btn" aria-label="Settings"><IconAD name="settings" size={16} /></button>
        <div className="avatar">SR</div>
      </div>
    </header>
  );
}

// Global initialization bridge
const initReactApp = () => {
  const container = document.getElementById("root");
  if (container) {
    ReactDOM.createRoot(container).render(<AppAD />);
  }
};

// Start when everything is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReactApp);
} else {
    initReactApp();
}
