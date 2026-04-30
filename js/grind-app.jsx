/**
 * grind-app.jsx - Unified Application Root
 * Sanitized Imports & Strict Hook Ordering
 */
const { useState, useEffect, useCallback, useMemo } = React;

// ─── Component Primitives ───────────────────────────────────────
const Icon = ({ name, size = 18, stroke = 1.6, color = "currentColor" }) => {
  const paths = {
    play: <polygon points="6 4 20 12 6 20 6 4" fill={color} stroke="none" />,
    pause: <g><rect x="6" y="4" width="4" height="16" fill={color} stroke="none" /><rect x="14" y="4" width="4" height="16" fill={color} stroke="none" /></g>,
    reset: <g><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></g>,
    skip: <g><polygon points="5 4 15 12 5 20 5 4" fill={color} stroke={color} /><line x1="19" y1="5" x2="19" y2="19" /></g>,
    timer: <g><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5" /><path d="M9 2h6" /></g>,
    flame: <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 8 12 8 13a4 4 0 0 0 8 0c0-3-2-6-4-10z" />,
    brain: <g><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 4v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3z M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 4v0a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3" /></g>,
    target: <g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill={color} stroke="none" /></g>,
    list: <g><line x1="8" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="8" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" fill={color} /><circle cx="4" cy="12" r="1" fill={color} /><circle cx="4" cy="18" r="1" fill={color} /></g>,
    chart: <g><path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 16l4-5 3 3 5-7" /></g>,
    sparkles: <g><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></g>,
    coffee: <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />,
    clip: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    battery: <g><rect x="1" y="6" width="18" height="12" rx="2" ry="2" /><line x1="23" y1="13" x2="23" y2="11" /></g>,
    search: <g><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></g>,
    externalLink: <g><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></g>,
    fileText: <g><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></g>,
    settings: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></g>,
    plus: <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    code: <polyline points="16 18 22 12 16 6 8 6 2 12 8 18" />,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    battery: <g><rect x="1" y="6" width="18" height="12" rx="2" ry="2" /><line x1="23" y1="13" x2="23" y2="11" /></g>,
    settings: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></g>,
    plus: <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    check: <polyline points="4 12 10 18 20 6" />,
    arrowRight: <g><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></g>,
    arrowUp: <polyline points="18 15 12 9 6 15" />,
    bell: <g><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></g>,
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
    sun: <g><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="5" y1="5" x2="6.5" y2="6.5" /><line x1="17.5" y1="17.5" x2="19" y2="19" /><line x1="5" y1="19" x2="6.5" y2="17.5" /><line x1="17.5" y1="6.5" x2="19" y2="5" /></g>,
    grip: <g><circle cx="9" cy="6" r="1.2" fill={color} stroke="none" /><circle cx="9" cy="12" r="1.2" fill={color} stroke="none" /><circle cx="9" cy="18" r="1.2" fill={color} stroke="none" /><circle cx="15" cy="6" r="1.2" fill={color} stroke="none" /><circle cx="15" cy="12" r="1.2" fill={color} stroke="none" /><circle cx="15" cy="18" r="1.2" fill={color} stroke="none" /></g>,
    code: <g><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></g>,
    coffee: <g><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></g>,
    clip: <path d="M6 7.91V16a6 6 0 0 0 12 0V4.5a4.5 4.5 0 0 0-9 0V15a3 3 0 0 0 6 0V7.91" />,
    camera: <g><rect x="3" y="4" width="18" height="14" rx="2" ry="2" /><circle cx="12" cy="11" r="3" /></g>,
    help: <g><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></g>,
    chevronUp: <polyline points="18 15 12 9 6 15" />,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    graphUp: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />,
    cards: <g><rect x="2" y="4" width="16" height="12" rx="2" /><rect x="6" y="8" width="16" height="12" rx="2" /></g>,
    chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
    fileText: <g><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></g>,
    folder: <g><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></g>,
    search: <g><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></g>,
    externalLink: <g><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></g>,
    link: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />,
    circle: <circle cx="12" cy="12" r="10" />,
    refresh: <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />,
    key: <g><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 2l.103.103A1.5 1.5 0 0 1 12.553 3H14.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a1.5 1.5 0 0 0-1.06.44l-1.503 1.503" /></g>,
    energy1: <path d="M2 16h4l2 1 3-2 3 2 4-1h4" />,
    energy2: <path d="M2 14c3 0 4 2 6 2s3-2 5-2 3 2 5 2 4-2 6-2" />,
    energy3: <path d="M2 13c2 0 3 3 5 3s3-3 5-3 3 3 5 3 3-3 5-3" />,
    energy4: <path d="M2 12h20M4 12h16" strokeOpacity="0.3" />,
    energy5: <path d="M2 16c4 0 6-4 10-4s6-6 10-6" />,
    energy6: <g><path d="M2 12h2l2-8 3 16 3-16 3 16 2-8h5" /><path d="M2 12h22" strokeOpacity="0.1" /></g>,
    energy7: <g>
      <path d="M12 12l-2 5 1 3 3-1 5-2-7-5z" fill="rgba(0,255,255,0.1)" />
      <path d="M12 12c2-2 5-3 10-10-7 5-8 8-10 10z" />
      <path d="M7 21l3-1 2-5-5 2-1 3-2 1 3-1z" />
      <path d="M12 12l-5 2M12 12l-2 5" />
      <circle cx="18" cy="6" r="1" fill={color} stroke="none" />
      <path d="M4 20l-2 2" strokeWidth="1" />
    </g>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ─── Main Application ──────────────────────────────────────────
function App() {
  const [tasks, setTasks] = useState([]);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [insightIdx, setInsightIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timerState, setTimerState] = useState({ timeLeft: 1500, duration: 1500, isRunning: false, mode: 'focus', pomodoroCount: 0 });
  const [fatigue, setFatigue] = useState(0);
  const [focusScore, setFocusScore] = useState(0);
  const [utilization, setUtilization] = useState(0);
  const [energySeries, setEnergySeries] = useState([]);
  const [isFatigueModalOpen, setIsFatigueModalOpen] = useState(false);
  const [pendingAutoStart, setPendingAutoStart] = useState(false);
  const [taskFiles, setTaskFiles] = useState([]);
  const [loadingTaskFiles, setLoadingTaskFiles] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationResult, setCalibrationResult] = useState(null);
  
  useEffect(() => {
    window.showFatigueModal = (autoStart = false) => {
      setPendingAutoStart(autoStart);
      setIsFatigueModalOpen(true);
    };
    window.hideFatigueModal = () => setIsFatigueModalOpen(false);
  }, []);

  const handleFatigueSelect = (level, label) => {
    if (window.energyController) {
      window.energyController.handleFatigueSelection(level, label);
      if (pendingAutoStart) {
        setPendingAutoStart(false);
        setTimeout(() => {
            if (window.timerController) window.timerController.startTimer();
        }, 100);
      }
    }
    setIsFatigueModalOpen(false);
  };

  const handleStartCalibration = async () => {
    try {
        const success = await window.biometricService?.startCapture();
        if (success) {
            setIsCalibrating(true);
        } else {
            alert('Camera access denied or torch not supported. Stand in a bright light for calibration.');
            setIsCalibrating(true);
        }
    } catch (err) {
        console.error('Failed to start calibration:', err);
    }
  };

  const handleCalibrationComplete = (results) => {
    setCalibrationResult(results);
    setIsCalibrating(false);
    
    // Update global state
    if (window.energyTracker) {
        window.energyTracker.addEnergyLevel(
            Math.round((results.readiness / 100) * 6 + 1), 
            `Focus Calibration: ${results.bpm} BPM, ${results.rmssd}ms RMSSD`
        );
    }
    if (window.updateHologramEnergy) {
        window.updateHologramEnergy(Math.round((results.readiness / 100) * 6 + 1));
    }
  };

  const getDynamicCircadianCurve = useCallback(() => {
    const wake = localStorage.getItem('wakeTime') || "07:00";
    const sleep = localStorage.getItem('sleepTime') || "23:00";
    const [wH] = wake.split(':').map(Number);
    const [sH] = sleep.split(':').map(Number);
    return Array.from({length: 9}, (_, i) => {
      const hour = wH + (i * (sH - wH) / 8);
      const midpoint = (wH + sH) / 2;
      const variance = Math.sin((hour - midpoint) * (Math.PI / (sH - wH) * 1.5));
      return { t: `${Math.floor(hour % 12 || 12)}${hour >= 12 ? 'p' : 'a'}`, v: Math.max(0.2, 0.5 + (variance * 0.3)) };
    });
  }, []);

  const insights = useMemo(() => [
    { tag: "Pattern", text: "Your focus peaks between 9–11am. Study high-priority tasks now." },
    { tag: "Risk", text: `You've logged ${tasks.filter(t => t.completed).length} tasks already. Take a 15-min break.` },
    { tag: "Streak", text: `GPAce Streak: ${streak} days active.` },
  ], [tasks, streak]);

  useEffect(() => {
    const sync = () => {
      try {
        const storage = window.storageService || (window.getStorage ? window.getStorage() : null);
        if (storage) {
          const tasksJson = storage.get('calculatedPriorityTasks', []);
          let parsedTasks = [];
          if (Array.isArray(tasksJson)) {
            parsedTasks = tasksJson;
          } else if (typeof tasksJson === 'string') {
            try {
              parsedTasks = JSON.parse(tasksJson) || [];
            } catch (e) {
              console.error('[App] JSON Parse failed for tasks:', e);
              parsedTasks = [];
            }
          }
          setTasks(parsedTasks);
          setStreak(storage.get('currentStreak', 0));
        }
        if (window.timerController?.state) {
          const ts = window.timerController.state;
          setTimerState({ timeLeft: ts.timeLeft, duration: ts.duration || 1500, isRunning: ts.isRunning, mode: ts.currentState || 'focus', pomodoroCount: ts.pomodoroCount });
        }
        if (window.statsController) {
            setFocusScore(window.statsController.calculateFocusScore() || 0);
            setUtilization(window.statsController.calculateTimeUtilization() || 0);
        }
        const currentLevel = localStorage.getItem('currentEnergyLevel');
        if (currentLevel) setFatigue(Math.round(((parseInt(currentLevel) - 1) / 6) * 100));
        if (window.energyTracker) {
            const levels = window.energyTracker.getTodayEnergyLevels();
            if (levels?.length > 1) {
                setEnergySeries(levels.map(l => {
                    try {
                        const ts = l.timestamp ? new Date(l.timestamp) : new Date();
                        return { 
                            t: ts.toLocaleTimeString([], {hour: 'numeric', hour12: true}).toLowerCase().replace(' ', ''), 
                            v: (7 - (l.level || 4)) / 6 
                        };
                    } catch (e) {
                        return { t: '?', v: 0.5 };
                    }
                }));
            } else {
                setEnergySeries(getDynamicCircadianCurve());
            }
        }
      } catch (err) {
        console.error('[App] Sync error:', err);
      }
    };
    sync();
    const id = setInterval(sync, 1000); // Relaxed frequency to 1s
    window.addEventListener('storage', sync);
    window.addEventListener('tasksUpdated', sync);
    return () => { clearInterval(id); window.removeEventListener('storage', sync); window.removeEventListener('tasksUpdated', sync); };
  }, [getDynamicCircadianCurve]);


  useEffect(() => {
    const id = setInterval(() => setInsightIdx(i => (i + 1) % insights.length), 7000);
    return () => clearInterval(id);
  }, [insights]);

  const toggleWorkspace = useCallback(() => setIsWorkspaceOpen(prev => !prev), []);
  useEffect(() => {
    window.openWorkspace = toggleWorkspace;
  }, [toggleWorkspace]);
  const currentTask = tasks.find(t => t.current) || tasks.find(t => !t.completed && !t.done);
  const cognitiveLoad = useMemo(() => tasks.filter(t => !t.completed && !t.done).reduce((sum, t) => sum + (t.weight || 10), 0), [tasks]);

  const [libraryFiles, setLibraryFiles] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  useEffect(() => {
    if (!currentTask?.id) return;
    
    const fetchAllFiles = async () => {
      if (!window.googleDriveAPI) return;
      
      // Fetch Library Files
      const projectPrefix = (currentTask.projectId || currentTask.id || '').match(/^[a-zA-Z]+/)?.[0] || '';
      if (projectPrefix) {
        try {
          setLoadingLibrary(true);
          const files = await window.googleDriveAPI.getSubjectFiles(projectPrefix);
          setLibraryFiles(files || []);
        } catch (err) {
          console.error('[App] Failed to fetch library files:', err);
        } finally {
          setLoadingLibrary(false);
        }
      }

      // Fetch Task-specific Files
      try {
        setLoadingTaskFiles(true);
        const files = await window.googleDriveAPI.getTaskFiles(currentTask.id);
        setTaskFiles(files || []);
      } catch (err) {
        console.error('[App] Failed to fetch task files:', err);
      } finally {
        setLoadingTaskFiles(false);
      }
    };

    fetchAllFiles();
    
    const handleDriveUpdate = () => fetchAllFiles();
    
    window.addEventListener('google-drive-initialized', handleDriveUpdate);
    window.addEventListener('google-drive-authenticated', handleDriveUpdate);
    
    return () => {
      window.removeEventListener('google-drive-initialized', handleDriveUpdate);
      window.removeEventListener('google-drive-authenticated', handleDriveUpdate);
    };
  }, [currentTask?.id]);

  return (
    <div className="app">
          {/* TopBar removed - handled by js/inject-header.js */}
          <GlobalProgressBar />
          
          <div className="layout-master">
            <main className="stage">
              <section className="left-col">
                <CurrentTaskCard 
                  task={currentTask} 
                  libraryCount={libraryFiles.length} 
                  taskFiles={taskFiles}
                  loadingFiles={loadingTaskFiles}
                />
                <InsightStrip insight={insights[insightIdx]} idx={insightIdx} total={insights.length} setIdx={setInsightIdx} />
                <SubjectLibrary 
                  files={libraryFiles} 
                  loading={loadingLibrary} 
                  taskId={currentTask?.id} 
                />
                <TaskTimer />
              </section>

              <section className="right-col">
                <TaskQueue tasks={tasks} />
                <TelemetryGrid 
                  fatigue={fatigue} 
                  cognitiveLoad={cognitiveLoad} 
                  sessions={timerState.pomodoroCount} 
                  streak={streak}
                  focusScore={focusScore}
                  utilization={utilization}
                  isCompact={isWorkspaceOpen}
                  onCalibrate={handleStartCalibration}
                  calibrationResult={calibrationResult}
                />
                <EnergyChart series={energySeries} />
              </section>
            </main>
          </div>

          {/* Workspace Side Panel (Sliding Drawer) */}
          <div className={`workspace-panel ${isWorkspaceOpen ? 'is-open' : ''}`}>
            <div className="workspace-header">
                <div className="wh-title">
                    <Icon name="code" size={18} color="var(--accent)" />
                    <span>Workspace Stage</span>
                </div>
                <button className="workspace-close" onClick={toggleWorkspace} aria-label="Close Workspace">
                    <Icon name="plus" size={24} color="var(--text-muted)" />
                </button>
            </div>
            <div className="workspace-content">
                <iframe 
                  src="workspace.html" 
                  frameBorder="0" 
                  className="workspace-iframe"
                  title="GPAce Legacy Stage"
                />
            </div>
          </div>

          {/* Workspace Overlay */}
          <div className={`workspace-overlay ${isWorkspaceOpen ? 'is-visible' : ''}`} onClick={toggleWorkspace} />

          <CommandCenter onToggleAI={toggleWorkspace} />
          <FatigueModal 
            isOpen={isFatigueModalOpen} 
            onClose={() => setIsFatigueModalOpen(false)} 
            onSelect={handleFatigueSelect} 
          />
          {isCalibrating && (
            <FocusCalibrationHUD 
                onComplete={handleCalibrationComplete}
                onCancel={() => setIsCalibrating(false)}
                subject={currentTask?.projectId || 'General'}
            />
          )}
          <WorkspaceToggle active={isWorkspaceOpen} onClick={toggleWorkspace} />
        </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────

function GlobalProgressBar({ isCompact }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sync = () => {
      if (window.timerController?.state) {
        const ts = window.timerController.state;
        const p = Math.max(0, Math.min(1, 1 - (ts.timeLeft / (ts.duration || 1500))));
        setProgress(p * 100);
      }
    };
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`global-progress-bar ${isCompact ? 'is-compact' : ''}`}>
      <div className="gpb-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

function TaskTimer({ isCompact }) {
  const [timerState, setTimerState] = useState({
    timeLeft: 1500,
    duration: 1500,
    isRunning: false,
    mode: 'focus'
  });

  useEffect(() => {
    const sync = () => {
      if (window.timerController?.state) {
        const ts = window.timerController.state;
        setTimerState({
          timeLeft: ts.timeLeft,
          duration: ts.duration || 1500,
          isRunning: ts.isRunning,
          mode: ts.currentState || 'focus'
        });
      }
    };
    sync();
    const id = setInterval(sync, 250);
    return () => clearInterval(id);
  }, []);

  const timeLeft = timerState.timeLeft || 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const progress = (timeLeft / (timerState.duration || 1500)) * 100;

  if (isCompact) {
    return (
      <div className={`task-timer-indicator is-compact ${timerState.isRunning ? 'running' : 'paused'}`}>
        <div className="tt-content">
          <div className="tt-time">
            <span className="mode-dot" data-mode={timerState.mode}></span>
            <span>{mm}:{ss}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={"timer-widget glass-panel " + (timerState.isRunning ? "running" : "paused")}>
      <div className="tw-bg-glow" />
      <div className="tw-content">
        <div className="tw-main">
          <div className="tw-visual">
             <svg viewBox="0 0 100 100" className="progress-ring">
               <circle className="ring-bg" cx="50" cy="50" r="45" />
               <circle 
                 className="ring-fill" 
                 cx="50" cy="50" r="45" 
                 style={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
               />
             </svg>
             <div className="tw-time-large">{mm}:{ss}</div>
          </div>
          <div className="tw-info">
             <div className="tw-label">{timerState.mode.toUpperCase()} SESSION</div>
             <div className="tw-status">
               <span className="pulse-dot" />
               {timerState.isRunning ? "ACTIVE" : "PAUSED"}
             </div>
          </div>
        </div>
        
        <div className="tw-controls-pro">
          <button className="tw-ctrl reset" onClick={() => window.timerController?.handleReset()} title="Reset">
            <Icon name="reset" size={18} />
          </button>
          <button className="tw-ctrl main-play" onClick={() => window.timerController?.handleToggle()}>
            <Icon name={timerState.isRunning ? "pause" : "play"} size={24} fill="white" />
          </button>
          <button className="tw-ctrl skip" onClick={() => (window.timerController?.skipSession?.() || window.timerController?.skipBreak?.())} title="Skip">
            <Icon name="skip" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ sessions, isCompact }) {
  const [user, setUser] = React.useState(null);
  const [activeDropdown, setActiveDropdown] = React.useState(null);

  useEffect(() => {
    const checkAuth = () => {
      if (window.auth) {
        setUser(window.auth.currentUser);
        const unsubscribe = window.auth.onAuthStateChanged((u) => {
          setUser(u);
        });
        return unsubscribe;
      }
      return null;
    };

    let unsub = checkAuth();
    if (!unsub) {
      const interval = setInterval(() => {
        unsub = checkAuth();
        if (unsub) clearInterval(interval);
      }, 500);
      return () => {
        clearInterval(interval);
        if (unsub && typeof unsub === 'function') unsub();
      };
    }
    return () => { if (unsub && typeof unsub === 'function') unsub(); };
  }, []);

  useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const handleLogin = () => {
    if (window.signInWithGoogle) window.signInWithGoogle();
  };

  const handleLogout = () => {
    if (window.signOutUser) window.signOutUser();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SR';
  };

  const productivityTabs = [
    { id: "grind", label: "Grind Mode", icon: "flame", active: true, action: () => window.location.href = 'grind.html' },
    { id: "queue", label: "Task Queue", icon: "list", action: () => window.location.href = 'tasks.html' },
    { id: "drip", label: "Daily Drip", icon: "chart", action: () => window.location.href = 'daily-calendar.html' },
  ];

  const studyTabs = [
    { id: "marks", label: "Subject Marks", icon: "graphUp", action: () => window.location.href = 'subject-marks.html' },
    { id: "flashcards", label: "Flashcards", icon: "cards", action: () => window.location.href = 'flashcards.html' },
    { id: "station", label: "Grind Station", icon: "target", action: () => window.location.href = 'study-spaces.html' },
  ];

  const appTabs = [
    { id: "juice", label: "Brain Juice", icon: "brain", action: () => window.location.href = 'academic-details.html' },
    { id: "hustle", label: "Hustle Hub", icon: "collection", action: () => window.location.href = 'extracted.html' },
    { id: "feedback", label: "Test Feedback", icon: "chat", action: () => window.location.href = 'instant-test-feedback.html' },
    { id: "converter", label: "MD Converter", icon: "fileText", action: () => window.location.href = 'markdown-converter.html' },
  ];

  return (
    <header className={`topbar ${isCompact ? 'is-compact' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Icon name="target" size={20} color="var(--accent)" /></div>
        {!isCompact && <div className="brand-name">GPAce</div>}
        <div className="brand-meta">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', ' ·')}</div>
      </div>
      
      <nav className="nav-container">
        <div className="tab-group productivity">
          {productivityTabs.map(t => (
            <button key={t.id} className={"tab" + (t.active ? " is-active" : "")} onClick={t.action} title={t.label}>
              <Icon name={t.icon} size={15} />{!isCompact && <span>{t.label}</span>}
            </button>
          ))}
        </div>

        <div className="tab-group utilities">
          <div className="dropdown-wrap">
            <button 
              className={"tab dropdown-trigger" + (activeDropdown === 'toolkit' ? " is-open" : "")} 
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'toolkit' ? null : 'toolkit'); }}
              title="Toolkit"
            >
              <Icon name="folder" size={15} />{!isCompact && <span>Toolkit</span>}
              <Icon name="chevronDown" size={12} stroke={2} />
            </button>
            {activeDropdown === 'toolkit' && (
              <div className="dropdown-menu">
                <div className="dropdown-label">Study Tools</div>
                {studyTabs.map(t => (
                  <button key={t.id} className="dropdown-item" onClick={t.action}>
                    <Icon name={t.icon} size={14} /><span>{t.label}</span>
                  </button>
                ))}
                <div className="dropdown-divider" />
                <div className="dropdown-label">Applications</div>
                {appTabs.map(t => (
                  <button key={t.id} className="dropdown-item" onClick={t.action}>
                    <Icon name={t.icon} size={14} /><span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="top-right">
        <div className="session-pill"><span>{sessions}{!isCompact && ' sessions'}</span></div>
        <button className="btn-icon ghost" onClick={() => window.dispatchEvent(new CustomEvent('toggleSettingsDrawer'))} aria-label="Settings" title="Settings">
          <Icon name="settings" size={18} />
        </button>
        {user ? (
          <div className="auth-area auth-user" onClick={handleLogout} title="Click to Logout" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar">{getInitials(user.displayName || user.email)}</div>
            )}
          </div>
        ) : (
          <button className="btn-ghost small auth-login" onClick={handleLogin}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}

function CurrentTaskCard({ task, libraryCount = 0, taskFiles = [], loadingFiles = false }) {
  const [activeTab, setActiveTab] = React.useState('subtasks');


  if (!task) {
    return (
      <div className="card current-task empty">
        <div className="muted">No active task available</div>
        <button className="btn-primary" onClick={() => window.taskCreationController?.showTaskModal()}>
          <Icon name="plus" size={14} /> Create Task
        </button>
      </div>
    );
  }

  const handleInterleave = () => {
    try {
        if (window.interleaveTask) {
            window.interleaveTask();
        } else if (window.taskDisplayController?.navigateTask) {
            window.taskDisplayController.navigateTask('next');
        }
    } catch (err) {
        console.error('[App] Interleave execution failed:', err);
    }
  };

  const handleSkip = () => {
    try {
        if (window.skipTask) {
            window.skipTask();
        } else if (window.taskDisplayController?.navigateTask) {
            window.taskDisplayController.navigateTask('next');
        }
    } catch (err) {
        console.error('[App] Skip execution failed:', err);
    }
  };

  return (
    <div className="card current-task">
      <div className="card-header">
        <div className="card-header-top">
          <div className="task-meta">
            <span className="status-badge">NOW FOCUSING</span>
            <span className={"priority-tag " + (task.priority || 'medium')}>{task.priority} priority</span>
          </div>
        </div>
        <h1 className="task-title">{task.title}</h1>
        <div className="ct-meta"><span>{task.projectId}</span><span className="sep">·</span><span>~{task.est || 90}m</span></div>
      </div>
      
      <div className="ct-subtabs">
        <button className={"st-btn" + (activeTab === 'subtasks' ? " active" : "")} onClick={() => setActiveTab('subtasks')}>
          SUBTASKS
        </button>
        <button className={"st-btn" + (activeTab === 'attachments' ? " active" : "")} onClick={() => setActiveTab('attachments')}>
          ATTACHMENTS ({taskFiles.length || 0})
        </button>
        <button className={"st-btn" + (activeTab === 'links' ? " active" : "")} onClick={() => setActiveTab('links')}>
          LINKS ({task.links?.length || 0})
        </button>
      </div>

      <div className="ct-tab-content">
        {activeTab === 'subtasks' && (
          <div className="tab-pane">
            {task.subtasks && task.subtasks.length > 0 ? (
              <ul className="mini-subtask-list">
                {task.subtasks.map((st, i) => (
                  <li key={i} className="mini-st-item">
                    <Icon name={st.completed ? "check" : "circle"} size={12} color={st.completed ? "var(--accent)" : "var(--muted)"} />
                    <span>{st.text || st.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="muted smaller" style={{ marginBottom: '8px' }}>No subtasks defined</div>
            )}
            <button className="btn-ghost small" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={() => window.taskCreationController?.showSubtaskModal?.(task.id)}>
                <Icon name="plus" size={12} /> ADD SUBTASK
            </button>
          </div>
        )}
        {activeTab === 'attachments' && (
          <div className="tab-pane">
             {loadingFiles ? (
               <div className="center-all p-3"><div className="spinner-small" /></div>
             ) : taskFiles.length > 0 ? (
               <div className="task-attachments-grid mb-3">
                 {taskFiles.map(file => (
                   <div key={file.id} className="task-attachment-item" onClick={() => window.open(file.webViewLink, '_blank')}>
                     {file.mimeType.startsWith('image/') ? (
                       <img src={file.thumbnailLink || file.webContentLink} alt={file.name} className="attachment-thumb" />
                     ) : (
                       <div className="attachment-icon-box">
                         <Icon name="fileText" size={24} />
                       </div>
                     )}
                     <span className="attachment-name-mini">{file.name}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="muted smaller center-all p-2">No specific files for this task</div>
             )}
             <div className="d-flex gap-2">
               <button className="btn-ghost small flex-grow-1" style={{ justifyContent: 'center' }} onClick={() => window.openWorkspace?.(task.id)}>
                  <Icon name="clip" size={12} /> SUBJECT LIBRARY
               </button>
               <button className="btn-ghost small flex-grow-1" style={{ justifyContent: 'center' }} onClick={() => window.googleDriveAPI?.authorize().then(() => window.taskCreationController?.showTaskModal())}>
                  <Icon name="plus" size={12} /> ADD IMAGE
               </button>
             </div>
          </div>
        )}
        {activeTab === 'links' && (
          <div className="tab-pane">
            {task.links && task.links.length > 0 ? (
              <ul className="mini-link-list">
                {task.links.map((link, i) => (
                  <li key={i} className="mini-link-item">
                    <a href={link.url || link} target="_blank" rel="noopener noreferrer">
                      <Icon name="link" size={12} /> {link.title || (typeof link === 'string' ? link.substring(0, 30) + '...' : 'External Link')}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="muted smaller" style={{ marginBottom: '8px' }}>No links attached</div>
            )}
            <button className="btn-ghost small" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={() => window.addNewLink?.(task.id)}>
                <Icon name="plus" size={12} /> ADD LINK
            </button>
          </div>
        )}
      </div>

      <div className="ct-actions">
        <button className="btn-ghost" onClick={() => {
            try {
                const sys = window.TaskSystem || window.taskService;
                if (sys?.completeTask) {
                    sys.completeTask(task.projectId, task.id);
                }
            } catch (err) {
                console.error('[App] Complete Task failed:', err);
            }
        }}>
            <Icon name="check" size={14} /> COMPLETE
        </button>
        <button className="btn-interleave" onClick={handleInterleave}><Icon name="refresh" size={14} /> INTERLEAVE</button>
        <button className="btn-ghost" onClick={handleSkip}><Icon name="skip" size={14} /> SKIP</button>
        <button className="btn-ghost" onClick={() => window.performAISearch?.()}><Icon name="sparkles" size={14} /> AI HELP</button>
      </div>
    </div>
  );
}

function SubjectLibrary({ files, loading, taskId }) {
  const [filter, setFilter] = React.useState('');
  
  const filteredFiles = React.useMemo(() => {
    const unique = (files || []).filter((f, i, self) => self.findIndex(t => t.id === f.id) === i);
    return unique.filter(f => {
      const isLibrary = f.appProperties?.isLibraryItem === 'true';
      const isTextbook = /textbook|reference|manual|handbook|guide|syllabus/i.test(f.name);
      
      // Prioritize properly tagged library items and academic reference materials
      return (isLibrary || isTextbook) && f.name.toLowerCase().includes(filter.toLowerCase());
    });
  }, [files, filter]);

  const getFileBadge = (file) => {
    const materialType = file.appProperties?.materialType || file.appProperties?.category;
    if (materialType) {
      const type = materialType.toLowerCase();
      if (type.includes('reference')) return <span className="sl-badge badge-reference">REFERENCE</span>;
      if (type.includes('textbook')) return <span className="sl-badge badge-textbook">TEXTBOOK</span>;
      if (type.includes('solution')) return <span className="sl-badge badge-solution">SOLUTION</span>;
      return <span className="sl-badge badge-general">{type.toUpperCase()}</span>;
    }
    const n = file.name.toLowerCase();
    if (n.includes('reference')) return <span className="sl-badge badge-reference">REFERENCE</span>;
    if (n.includes('textbook')) return <span className="sl-badge badge-textbook">TEXTBOOK</span>;
    if (n.includes('solution')) return <span className="sl-badge badge-solution">SOLUTION</span>;
    return null;
  };

  return (
    <div className="subject-library glass-panel">
      <div className="sl-head">
        <div className="sl-title">SUBJECT LIBRARY</div>
        <div className="sl-search">
          <Icon name="search" size={10} />
          <label htmlFor="sl-filter" className="visually-hidden">Filter subject library</label>
          <input 
            type="text" 
            id="sl-filter"
            name="libraryFilter"
            placeholder="Filter..." 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
          />
        </div>
      </div>
      <div className="sl-scroll-area">
        {loading ? (
          <div className="muted smaller center-all" style={{ height: '100px' }}><div className="spinner-small" /> Loading...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="muted smaller center-all" style={{ height: '100px' }}>{filter ? 'No matches' : 'Empty Library'}</div>
        ) : (
          <div className="sl-list">
            {filteredFiles.map(file => (
              <div key={file.id} className="sl-item">
                <div className="sl-item-main">
                  <Icon name="fileText" size={14} className="muted" />
                  <div className="sl-item-info">
                    <span className="sl-name">{file.name}</span>
                    {getFileBadge(file)}
                  </div>
                </div>
                <div className="sl-item-actions">
                  <a href={file.webViewLink} target="_blank" className="sl-action-btn" title="Open"><Icon name="externalLink" size={12} /></a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="btn-add-library" onClick={() => window.noteToTaskController?.openFilePicker()}>
        <Icon name="plus" size={10} /> ADD TO LIBRARY
      </button>
    </div>
  );
}

function InsightStrip({ insight, idx, total, setIdx, isCompact }) {
  if (!insight || isCompact) return null;
  return (
    <div className="card insight">
      <div className="insight-icon"><Icon name="sparkles" size={16} /></div>
      <div className="insight-body">
        <div className="insight-tag">Gemini · {insight.tag}</div>
        <div className="insight-text">{insight.text}</div>
      </div>
      <div className="insight-nav">
        {[...Array(total)].map((_, i) => <button key={i} className={"d" + (i === idx ? " active" : "")} onClick={() => setIdx(i)} />)}
      </div>
    </div>
  );
}

function TaskQueue({ tasks, isCompact }) {
  const open = tasks.filter(t => !t.completed && !t.done);
  return (
    <div className={`card queue ${isCompact ? 'is-compact' : ''}`}>
      <div className="queue-head">
        <h3>Up next</h3>
        {!isCompact && <button className="btn-ghost small" onClick={() => window.taskCreationController?.showTaskModal()}><Icon name="plus" size={13} /> Add</button>}
      </div>
      <ul className="task-list">
        {open.slice(1, isCompact ? 4 : 6).map(t => (
          <li key={t.id} className={"task-row" + (t.current ? " is-current" : "")}>
            <button className="check" onClick={() => window.TaskSystem?.completeTask(t.projectId, t.id)} aria-label="Complete"><span className="check-box" /></button>
            <div className="task-main" onClick={() => window.taskDisplayController?.navigateTask('next')}>
              <div className="task-title">{t.title}</div>
              <div className="task-meta">
                <span className="course-pill">{t.projectId}</span>
                {!isCompact && t.links && t.links.length > 0 && (
                  <span className="meta-badge"><Icon name="link" size={10} /> {t.links.length}</span>
                )}
              </div>
            </div>
            <div className="task-right"><span className={"prio-dot prio-" + (t.priority || 'medium')} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TelemetryGrid({ fatigue, cognitiveLoad, sessions, streak, focusScore, utilization, isCompact, onCalibrate, calibrationResult }) {
  const stats = useMemo(() => {
    // If we have fresh calibration results, override the mock metrics
    if (calibrationResult) {
      return {
        fatigue: 100 - calibrationResult.readiness,
        focus: Math.round(calibrationResult.rmssd * 1.5), 
        cogLoad: Math.round(calibrationResult.bpm * 4.5 + (cognitiveLoad || 0)),
        stress: Math.round(100 - (calibrationResult.rmssd / 1.5)),
        energy: calibrationResult.readiness,
        status: (100 - calibrationResult.readiness) < 40 ? { label: 'Peak', class: 'active' } : { label: 'Steady', class: 'ok' }
      };
    }
    const level = Math.round(((100 - fatigue) / 100) * 6 + 1);
    const mapping = { 1: { label: 'Exhausted', class: 'bad' }, 2: { label: 'Tired', class: 'warn' }, 3: { label: 'Drained', class: 'warn' }, 4: { label: 'Steady', class: 'ok' }, 5: { label: 'Good', class: 'ok' }, 6: { label: 'Sharp', class: 'active' }, 7: { label: 'Peak', class: 'active' } };
    return {
        fatigue: 100 - fatigue,
        focus: focusScore,
        cogLoad: cognitiveLoad,
        stress: 45,
        energy: 100 - fatigue,
        status: mapping[level] || { label: 'Steady', class: 'ok' }
    };
  }, [fatigue, focusScore, cognitiveLoad, calibrationResult]);

  return (
    <div className={`telemetry ${isCompact ? 'is-compact' : ''}`}>
      {/* Hero Card: Calibrate */}
      <div className="card metric hero-card clickable" onClick={onCalibrate}>
        <div className="metric-head"><Icon name="brain" size={14} /><span>Calibrate</span></div>
        <div className="metric-value">GO</div>
        <div className="metric-foot">
           <span className="chip active">READY FOR PREP</span>
        </div>
      </div>

      {/* Row 1 Metrics */}
      <div className="card metric">
        <div className="metric-head"><Icon name="target" size={14} /><span>Fatigue</span></div>
        <div className="metric-value">{stats.fatigue}<span className="unit">%</span></div>
        <div className="metric-foot">
           <span className={`chip ${stats.status.class}`}>{stats.status.label}</span>
           <div className="ff-range"><div className="fill" style={{ width: `${stats.fatigue}%`, background: 'var(--accent)' }} /></div>
        </div>
      </div>

      <div className="card metric">
        <div className="metric-head"><Icon name="sparkles" size={14} /><span>Focus Score</span></div>
        <div className="metric-value">{stats.focus}<span className="unit">%</span></div>
      </div>

      {/* Row 2 Metrics */}
      <div className="card metric">
        <div className="metric-head"><Icon name="chart" size={14} /><span>Utilization</span></div>
        <div className="metric-value">{utilization}<span className="unit">%</span></div>
      </div>

      <div className="card metric">
        <div className="metric-head"><Icon name="target" size={14} /><span>Cog Load</span></div>
        <div className="metric-value">{stats.cogLoad}<span className="unit">pts</span></div>
      </div>

      <div className="card metric">
        <div className="metric-head"><Icon name="timer" size={14} /><span>Sessions</span></div>
        <div className="metric-value">{sessions}</div>
      </div>

      {/* Row 3 Metrics */}
      <div className="card metric">
        <div className="metric-head"><Icon name="flame" size={14} /><span>Streak</span></div>
        <div className="metric-value">{streak}<span className="unit">d</span></div>
      </div>

      <div className="card metric">
        <div className="metric-head"><Icon name="zap" size={14} /><span>Stress</span></div>
        <div className="metric-value">{stats.stress}<span className="unit">%</span></div>
      </div>

      <div className="card metric">
        <div className="metric-head"><Icon name="battery" size={14} /><span>Energy</span></div>
        <div className="metric-value">{stats.energy}<span className="unit">%</span></div>
      </div>
    </div>
  );
}

function EnergyChart({ series, isCompact }) {
  const w = 600, h = 120, pad = 16;
  const hasData = series && series.length >= 2;
  let path = "", fillPath = "", xs = [], ys = [];
  if (hasData) {
    xs = series.map((_, i) => pad + (i * (w - 2 * pad)) / (series.length - 1));
    ys = series.map(d => h - pad - d.v * (h - 2 * pad));
    path = xs.map((x, i) => i === 0 ? `M ${x} ${ys[i]}` : `C ${(xs[i-1]+x)/2} ${ys[i-1]} ${(xs[i-1]+x)/2} ${ys[i]} ${x} ${ys[i]}`).join(" ");
    fillPath = `${path} L ${xs[xs.length - 1]} ${h - pad} L ${xs[0]} ${h - pad} Z`;
  }
  return (
    <div className={`card chart-card ${isCompact ? 'is-compact' : ''}`}>
      <div className="chart-head">
          <div><h3>Energy curve</h3>{!isCompact && <div className="muted small">Predicted from sleep & history</div>}</div>
          {!isCompact && <div className="legend"><span><i className="dot1" /> Today</span></div>}
      </div>
      <div className="chart-body" style={{ position: 'relative', height: isCompact ? h / 1.5 : h + 24 }}>
          <canvas id="energyGraph" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '100%', height: '100%' }}></canvas>
          {hasData ? (
            <svg viewBox={`0 0 ${w} ${h + 24}`} className="chart" preserveAspectRatio="none">
              <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
              <path d={fillPath} fill="url(#areaGrad)" /><path d={path} stroke="var(--accent)" strokeWidth="2.2" fill="none" />
              {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={3} fill="var(--accent)" />)}
            </svg>
          ) : <div className="flex-center muted small" style={{ height: '100%' }}>Initializing energy prediction...</div>}
      </div>
    </div>
  );
}

function CommandCenter({ onToggleAI }) {
  const [query, setSearchQuery] = React.useState("");
  const handleSearch = () => { if (window.performAISearch && query) { const input = document.getElementById('searchQuery'); if (input) input.value = query; window.performAISearch(); setSearchQuery(""); } };
  return (
    <div className="gpac-command-dock-connected">
        <div className="cc-connected-wrap">
            <button className="cc-btn amber circle" title="Relaxed Mode" onClick={() => window.location.href='relaxed-mode/index.html'}><Icon name="coffee" size={18} color="white" /></button>
            <button className="cc-btn ghost" title="Upload" onClick={() => document.getElementById('imageUpload')?.click()}><Icon name="clip" size={18} /></button>
            <div className="cc-input-group">
                <label htmlFor="cc-chat-input" className="visually-hidden">How can I help you?</label>
                <input 
                    type="text" 
                    id="cc-chat-input"
                    name="commandChat"
                    placeholder="How can I help you?" 
                    value={query} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                />
            </div>
            <button className="cc-btn ghost" title="Camera" onClick={() => window.noteToTaskController?.openFilePicker()}><Icon name="camera" size={18} /></button>
            <button className="cc-btn blue circle" title="Add Task" onClick={() => window.taskCreationController?.showTaskModal()}><Icon name="plus" size={20} color="white" /></button>
            <button className="cc-btn cyan circle" title="Send" onClick={handleSearch}><Icon name="arrowUp" size={20} color="white" /></button>
            <button className="cc-btn ghost" title="API Configuration" onClick={() => window.openApiSettingsModal?.()}><Icon name="settings" size={18} /></button>
            <button className="cc-btn ghost" title="Gemini Key Toggle" onClick={() => window.geminiKeyManagerUI?.showModal()}><Icon name="key" size={18} /></button>
            <button className="cc-btn red circle" title="Help"><Icon name="help" size={18} color="white" /></button>
        </div>
    </div>
  );
}

function WorkspaceToggle({ active, onClick }) {
  return (
    <button className={`workspace-toggle ${active ? 'is-active' : ''}`} onClick={onClick} aria-label="Toggle Workspace">
      <div className="diamond-wrap">
        <i className="bi bi-diamond-fill"></i>
      </div>
    </button>
  );
}

function FatigueModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;
  const levels = [{ id: 1, label: "Exhausted", desc: "I need a break" }, { id: 2, label: "Very Tired", desc: "Struggling to focus" }, { id: 3, label: "Tired", desc: "Low energy" }, { id: 4, label: "Okay", desc: "Feeling fine" }, { id: 5, label: "Good", desc: "Ready to work" }, { id: 6, label: "Great", desc: "Very energetic" }, { id: 7, label: "God Mode", desc: "Maximum focus" }];
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex' }}>
      <div className="modal-content bento-modal energy-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Energy Level Check</h2><p>How are you feeling before starting this session?</p></div>
        <div className="fatigue-grid native-svg-grid">
          {levels.map(l => (
            <div key={l.id} className={`fatigue-level native-asset ${selected === l.id ? 'active' : ''}`} onMouseEnter={() => setHovered(l.id)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(l.id)}>
              <div className="level-icon-wrap"><Icon name={`energy${l.id}`} size={32} stroke={1.8} color={selected === l.id || hovered === l.id ? "var(--accent)" : "rgba(255,255,255,0.4)"} /></div>
              <h3>{l.label}</h3><p>{l.desc}</p>
            </div>
          ))}
        </div>
        <div className="modal-footer"><button className="btn-ghost" onClick={onClose}>Skip</button><button className="btn-primary" disabled={!selected} onClick={() => onSelect(selected, levels.find(l => l.id === selected).label)}>Start Session</button></div>
      </div>
    </div>
  );
}
function FocusCalibrationHUD({ onComplete, onCancel, subject }) {
  const [progress, setProgress] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);
  const [metrics, setMetrics] = useState({ bpm: '--', rmssd: '--', stamina: '--' });

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return p + 2; 
      });
      
      setMetrics(m => ({
        bpm: 65 + Math.floor(Math.random() * 10),
        rmssd: 45 + Math.floor(Math.random() * 20),
        stamina: 70 + Math.floor(Math.random() * 20)
      }));

      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 200);
    }, 1000);

    return () => {
        clearInterval(interval);
        if (window.biometricService) {
            window.biometricService.stopCapture();
        }
    };
  }, []);

  const handleFinish = () => {
    if (window.biometricService) {
        const results = window.biometricService.calculateResults();
        window.biometricService.stopCapture();
        onComplete(results);
    }
  };

  return (
    <div className="biometric-hud-overlay">
      <div className="hud-content">
        <div className="hud-header">
          <div className="hud-label">FOCUS CALIBRATION</div>
          <div className="hud-subject">{subject.toUpperCase()} GRIND</div>
        </div>

        <div className={`focus-ring-container ${pulseActive ? 'pulse' : ''}`}>
           <div className="ring-outer" />
           <div className="ring-inner" />
           <div className="focus-score">{progress}%</div>
        </div>

        <div className="hud-metrics">
          <div className="hud-metric">
             <div className="m-label">MENTAL STAMINA</div>
             <div className="m-value">{metrics.stamina}%</div>
          </div>
          <div className="hud-metric">
             <div className="m-label">HEART RATE</div>
             <div className="m-value">{metrics.bpm} <span className="unit">BPM</span></div>
          </div>
          <div className="hud-metric">
             <div className="m-label">HRV (RMSSD)</div>
             <div className="m-value">{metrics.rmssd} <span className="unit">MS</span></div>
          </div>
        </div>

        <div className="hud-footer">
           <div className="hud-tip">STABILIZE FINGER ON CAMERA & BREATHE DEEPLY</div>
           <button className="btn-ghost small" onClick={onCancel}>CANCEL SESSION</button>
        </div>
      </div>
    </div>
  );
}


function ErrorBoundary({ children }) {
  const [errorInfo, setErrorInfo] = useState(null);
  useEffect(() => {
    const handle = (e) => { 
      console.error('[App] Boundary Error:', e); 
      setErrorInfo(e.message || String(e)); 
    };
    window.addEventListener('error', handle);
    return () => window.removeEventListener('error', handle);
  }, []);
  if (errorInfo) return (
    <div className="error-screen">
      <h1>App Collision</h1>
      <p>Manual edits fragmented the React tree. Attempting recovery...</p>
      <div style={{ color: '#ff5555', margin: '20px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
        {errorInfo}
      </div>
      <button onClick={() => window.location.reload()}>RELOAD STAGE</button>
    </div>
  );
  return children;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
