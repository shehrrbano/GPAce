/* GPAce — Academic Details React Logic */
console.log('[AcademicDetails] JSX script starting...');
const { useState, useEffect, useMemo, useRef } = React;

const IconAD = ({ name, size = 18, stroke = 2 }) => {
  const paths = {
    flame: <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 8 12 8 13a4 4 0 0 0 8 0c0-3-2-6-4-10z" />,
    target: <g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></g>,
    chart: <g><path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 16l4-5 3 3 5-7" /></g>,
    brain: <g><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 4v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3z" /><path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 4v0a3 3 0 0 1-3 3" /></g>,
    settings: <g><circle cx="12" cy="12" r="3" /><path d="M19 13a1.7 1.7 0 0 0 0 -2l1-1-2-3-1 .5a1.7 1.7 0 0 1 -2-1L14 5h-4l-1 1.5a1.7 1.7 0 0 1-2 1l-1-.5-2 3 1 1a1.7 1.7 0 0 0 0 2l-1 1 2 3 1-.5a1.7 1.7 0 0 1 2 1L10 19h4l1-1.5a1.7 1.7 0 0 1 2-1l1 .5 2-3z" /></g>,
    info: <g><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="8.5" /><line x1="12" y1="11" x2="12" y2="16" /></g>,
    plus: <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    chevD: <polyline points="6 9 12 15 18 9" />,
    sun: <g><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></g>,
    book: <g><path d="M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2z" /><line x1="9" y1="3" x2="9" y2="21" /></g>,
    sparkles: <g><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></g>,
    edit: <g><path d="M14 4l6 6-11 11H3v-6z" /><path d="M14 4l3-3 6 6-3 3" /></g>,
    trash: <g><polyline points="4 7 20 7" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></g>,
    check: <polyline points="4 12 10 18 20 6" />,
    cloud: <path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5-2A4 4 0 0 0 7 18z" />,
    archive: <g><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><line x1="10" y1="12" x2="14" y2="12" /></g>,
    drive: <g><rect x="3" y="6" width="18" height="13" rx="2" /><line x1="7" y1="11" x2="9" y2="11" /></g>,
    database: <g><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

function AppAD() {
  const [semester, setSemester] = useState("default");
  const [allSemesters, setAllSemesters] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [count, setCount] = useState("");
  const [bulk, setBulk] = useState("");
  const [stats, setStats] = useState({ gpaceSizeKB: 0 });
  const [showArchived, setShowArchived] = useState(false);
  const [forms, setForms] = useState([]);

  const saveToBackend = (updatedSubjects, targetSem = semester) => {
    if (window.SemesterService) {
      window.SemesterService.updateSemester(targetSem, { subjects: updatedSubjects });
      window.dispatchEvent(new CustomEvent('subjectsChanged', { detail: { subjects: updatedSubjects, semester: targetSem } }));
      if (window.saveSubjectsToFirestore) window.saveSubjectsToFirestore(updatedSubjects, targetSem);
    }
  };

  const init = async () => {
    if (!window.SemesterService || !window.storageService) return;
    try {
      await window.SemesterService.initialize();
      const cur = window.SemesterService.getCurrentSemester() || 'default';
      const sems = window.SemesterService.getAllSemesters() || {};
      setSemester(cur);
      setAllSemesters(sems);
      const curSubs = sems[cur]?.subjects || [];
      setSubjects(curSubs);
      setStats(window.storageService.getStats() || { gpaceSizeKB: 0 });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const check = setInterval(() => {
      if (window.SemesterService && window.storageService) { init(); clearInterval(check); }
    }, 100);
    return () => clearInterval(check);
  }, []);

  const totalCredits = useMemo(() => (subjects || []).reduce((s, x) => s + (Number(x.creditHours) || 0), 0), [subjects]);
  const gpaceKB = Number(stats?.gpaceSizeKB) || 0;
  const storagePercent = Math.min(100, (gpaceKB / 10240) * 100);
  const currentSemesterData = allSemesters?.[semester] || { name: semester };

  const generateForms = () => {
    const n = parseInt(count);
    if (isNaN(n) || n <= 0) return;
    const newForms = Array.from({ length: n }, (_, i) => ({
      id: Date.now() + i,
      name: "",
      creditHours: 3,
      cognitiveDifficulty: 50,
      tag: ""
    }));
    setForms(newForms);
  };

  const handleFormChange = (id, field, value) => {
    setForms(prev => prev.map(f => {
        if (f.id === id) {
            const updated = { ...f, [field]: value };
            if (field === 'name') {
                const base = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || "SUBJ";
                updated.tag = base + Math.floor(Math.random() * 900 + 100);
            }
            return updated;
        }
        return f;
    }));
  };

  const deleteGeneratedForm = (id) => {
    setForms(prev => prev.filter(f => f.id !== id));
  };

  const saveAllSubjects = () => {
    const validForms = forms.filter(f => f.name.trim());
    if (validForms.length === 0) {
        setForms([]);
        return;
    }
    const updated = [...subjects, ...validForms.map(f => ({
        ...f,
        relativeScore: 0,
        academicPerformance: 50
    }))];
    setSubjects(updated);
    saveToBackend(updated);
    setForms([]);
    setCount("");
  };

  const totalFormCredits = useMemo(() => forms.reduce((s, x) => s + (Number(x.creditHours) || 0), 0), [forms]);

  const parseBulk = () => {
    const lines = bulk.split("\n").map(l => l.trim()).filter(Boolean);
    const newSubs = lines.map((l, i) => {
      const lastComma = l.lastIndexOf(',');
      let name = l, cr = 3;
      if (lastComma !== -1) {
        name = l.substring(0, lastComma).trim();
        cr = Number(l.substring(lastComma + 1).trim()) || 3;
      }
      return { 
        id: Date.now() + i, name: name || "Untitled", creditHours: cr, 
        tag: (name || "SUBJ").toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) + Math.floor(Math.random() * 900 + 100),
        relativeScore: 0, cognitiveDifficulty: 50, academicPerformance: 50
      };
    });
    const updated = [...subjects, ...newSubs];
    setSubjects(updated);
    saveToBackend(updated);
    setBulk("");
  };

  return (
    <div className="app">
      <main className="acd-stage">
        <div className="acd-header">
          <h1 className="acd-h1">Academic Details</h1>
          <p className="acd-sub">Manage subjects, credits and semester data. GPAce uses these to weight your tasks and project your GPA.</p>
        </div>

        <section className="card">
          <div className="sem-head">
            <div className="sem-left">
              <div className="sem-title">
                <h2 style={{color:'white'}}>{currentSemesterData.name || semester}</h2>
                <span className="chip synced"><IconAD name="cloud" size={12} /> Cloud Synced</span>
                <span className="chip local"><IconAD name="info" size={12} /> Local Storage Only</span>
              </div>
              <div className="sem-help">Select or create a semester to manage subject data separately for different academic periods.</div>
            </div>
            <div className="sem-select-wrap">
               <div className="sem-select-container">
                 <div className="sem-label-side">
                   <span>Select</span>
                   <span>Semester:</span>
                 </div>
                 <div className="sem-select-group">
                   <div className="sem-select">
                      <select value={semester} onChange={(e) => {
                        setSemester(e.target.value); 
                        window.SemesterService.setCurrentSemester(e.target.value);
                        const sems = window.SemesterService.getAllSemesters() || {};
                        setSubjects(sems[e.target.value]?.subjects || []);
                      }}>
                        {Object.keys(allSemesters || {}).map(id => <option key={id} value={id}>{allSemesters[id].name || id}</option>)}
                      </select>
                      <IconAD name="chevD" size={14} />
                   </div>
                   <div className="sem-actions-wrap">
                     <button className="icon-btn-outline">
                       <IconAD name="settings" size={18} />
                       <IconAD name="chevD" size={10} stroke={3} />
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="storage-section">
            <div className="storage-bar-container">
               <div className="storage-bar-meta">
                  <div className="storage-track"><div className="storage-fill" style={{ width: `${storagePercent}%` }} /></div>
                  <span className="storage-text">Storage · {gpaceKB.toFixed(1)} of 10240 KB used</span>
               </div>
               <div className="storage-actions">
                  <label className="switch-wrap">
                     <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
                     <div className="toggle-switch"></div>
                     <span className="switch-label">Show Archived</span>
                  </label>
                  <a href="#" className="manage-storage-link"><IconAD name="database" size={14} /> Manage Storage</a>
               </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="add-subj-header">
            <div className="add-subj-icon"><IconAD name="plus" size={20} /></div>
            <div className="add-subj-text">
              <h3>Add New Subject</h3>
              <p>Generate empty forms or paste a bulk list from your registrar.</p>
            </div>
          </div>

          <label className="form-label">Enter Number of Subjects</label>
          <div className="inline-form">
            <input type="number" value={count} onChange={e => setCount(e.target.value)} className="acd-input" placeholder="e.g. 5" />
            <button className="btn-primary" onClick={generateForms}><IconAD name="sparkles" size={16} /> Generate Forms</button>
          </div>

          <div className="divider-or">OR</div>

          <label className="form-label">Bulk Add Subjects</label>
          <p className="acd-sub" style={{fontSize:'13px', marginBottom:'12px'}}>Format: <code style={{color:'var(--accent)'}}>Subject Name, Credit Hours</code> — one per line</p>
          <textarea className="bulk-textarea" value={bulk} onChange={e => setBulk(e.target.value)} placeholder={"Linear Algebra, 4\nMechanics, 4\nCognitive Neuroscience, 3"} />
          <div className="inline-form" style={{justifyContent:'space-between', alignItems:'center', marginTop:'16px'}}>
            <button className="btn-primary" onClick={parseBulk} disabled={!bulk.trim()}><IconAD name="check" size={16} /> Add Subjects</button>
            <span style={{fontSize:'13px', color:'var(--dd-text-muted)'}}>{(bulk.split("\n").filter(l => l.trim()).length)} line(s) detected</span>
          </div>

          {forms.length > 0 && (
            <div className="generated-forms" style={{marginTop:'32px'}}>
                {forms.map((f, i) => (
                    <div key={f.id} className="subject-form-block" style={{marginBottom:'24px', padding:'20px', border:'1px solid var(--dd-line)', borderRadius:'12px'}}>
                        <h4 style={{color:'white', marginBottom:'16px'}}>Subject {i+1}</h4>
                        <div className="mb-3">
                            <label className="form-label">Subject Name</label>
                            <input type="text" className="acd-input w-100" value={f.name} onChange={e => handleFormChange(f.id, 'name', e.target.value)} />
                            {f.tag && <div style={{fontSize:'12px', color:'var(--dd-text-muted)', marginTop:'4px'}}>Tag: {f.tag}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Credit Hours</label>
                            <input type="number" className="acd-input w-100" value={f.creditHours} onChange={e => handleFormChange(f.id, 'creditHours', e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label mb-0">Cognitive Difficulty Level (1-100)</label>
                                <span style={{color:'white', fontWeight:600}}>{f.cognitiveDifficulty}</span>
                            </div>
                            <input type="range" className="w-100" min="1" max="100" value={f.cognitiveDifficulty} onChange={e => handleFormChange(f.id, 'cognitiveDifficulty', e.target.value)} />
                            <div style={{fontSize:'11px', color:'var(--dd-text-muted)', marginTop:'8px'}}>
                                1 = Very Easy, 50 = Moderate, 100 = Very Challenging
                            </div>
                        </div>
                    </div>
                ))}
                <button className="btn-primary w-100" style={{padding:'14px'}} onClick={saveAllSubjects}>Save All Subjects</button>
            </div>
          )}
        </section>

        <section className="card">
          <div className="subjects-card-header">
            <div className="subj-list-icon"><IconAD name="book" size={20} /></div>
            <div>
              <h2 style={{fontSize:'20px', fontWeight:700, margin:0, color:'white'}}>Subjects · {subjects.length}</h2>
              <p style={{fontSize:'14px', color:'var(--dd-text-muted)', margin:'4px 0 0'}}>{totalCredits} total credits this semester</p>
            </div>
          </div>
          <div className="subj-list">
            {subjects.map((s, idx) => (
              <div key={s.id || idx} className="subj-row">
                <div className="subj-pip" style={{ background: `oklch(0.65 0.2 ${(idx * 47) % 360})` }} />
                <div className="subj-name" style={{color:'white'}}>{s.name || "Untitled Subject"}</div>
                <div className="subj-meta">
                  <div className="credits-badge"><strong>{s.creditHours}</strong><span>CR</span></div>
                  <button className="action-btn" title="Edit"><IconAD name="edit" size={14} /></button>
                  <button className="action-btn" title="Archive"><IconAD name="archive" size={14} /></button>
                  <button className="action-btn" onClick={() => {
                    const up = subjects.filter(x => (x.id || x.tag) !== (s.id || s.tag));
                    setSubjects(up); saveToBackend(up);
                  }} title="Delete"><IconAD name="trash" size={14} /></button>
                </div>
              </div>
            ))}
            {subjects.length === 0 && <p style={{textAlign:'center', padding:'40px', color:'var(--dd-text-muted)'}}>No subjects added yet.</p>}
          </div>
        </section>
      </main>
    </div>
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
