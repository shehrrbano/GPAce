/**
 * priority-list-engine.js  v2
 * Reads TaskSystem V5 storage, waits for Firebase data, calculates real scores.
 */

// ── Storage helpers ──────────────────────────────────────────────────────────
const PFX = 'gpace_';

function rawGet(key) {
    try { return localStorage.getItem(PFX + key) ?? localStorage.getItem(key); }
    catch { return null; }
}

function rawParse(key) {
    const s = rawGet(key);
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
}

/** StorageService stores V5 wrappers: {version,schema,data:[...]}. Unwrap them. */
function readV5Array(key) {
    const val = rawParse(key);
    if (!val) return null;
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.data)) return val.data;
    return null;
}

function storageSet(key, value) {
    const s = JSON.stringify(value);
    try { localStorage.setItem(PFX + key, s); } catch {}
    try { localStorage.setItem(key, s); } catch {}
}

// ── Subject helpers ──────────────────────────────────────────────────────────
function getSubjects() {
    // SemesterService may be loaded by now
    if (window.SemesterService?.getCurrentSubjects) {
        const s = window.SemesterService.getCurrentSubjects();
        if (Array.isArray(s) && s.length) return s;
    }
    return readV5Array('academicSubjects') || [];
}

/** Get all active tasks for a project, trying every known key format */
function getProjectTasks(projectId) {
    // V5 format (TaskSystem primary)
    const v5 = readV5Array(`tasks_v5.${projectId}`);
    if (v5 && v5.length) return v5.filter(t => !t.completed && !t.deleted);

    // Legacy formats
    for (const key of [`tasks-${projectId}`, `gpace_tasks-${projectId}`]) {
        const raw = rawParse(key);
        if (Array.isArray(raw) && raw.length) return raw.filter(t => !t.completed && !t.deleted);
    }
    return [];
}

// ── Scoring ──────────────────────────────────────────────────────────────────
function timePoints(dueDate) {
    if (!dueDate) return 0;
    let dl;
    try {
        dl = new Date(dueDate);
        if (isNaN(dl)) return 0;
    } catch { return 0; }
    const now = new Date();
    now.setHours(0,0,0,0); dl.setHours(0,0,0,0);
    const diff = dl - now;
    if (diff > 0) {
        const d = diff / 86400000;
        return (1 / Math.max(0.042, d)) * 10;
    }
    return 10 * (1 + Math.log(Math.min(Math.abs(Math.floor(diff/86400000)), 30) + 1));
}

const SECTION_WEIGHT = {
    assignment:15, assignments:15,
    quiz:10, quizzes:10,
    midterm:30, 'mid term / oht':30,
    final:40, finals:40,
    revision:5, project:20
};

function sectionWeight(section) {
    return SECTION_WEIGHT[(section||'').toLowerCase().trim()] || 10;
}

function scoreTask(task, subject) {
    const ch = Number(subject?.relativeScore || 0);
    const cd = Number(subject?.cognitiveDifficulty || 0);
    return Math.max(0, ch + cd + sectionWeight(task.section) + timePoints(task.dueDate));
}

// ── Data loading ─────────────────────────────────────────────────────────────
function loadAndScore() {
    // 1. Check priority cache – if it has real scores, use it
    const cached = readV5Array('calculatedPriorityTasks');
    if (cached?.length && cached.some(t => Number(t.priorityScore) > 0)) {
        console.log('[PLEngine] Using cached scored tasks:', cached.length);
        return cached;
    }

    // 2. Rebuild from subjects + tasks
    const subjects = getSubjects();
    console.log('[PLEngine] Subjects found:', subjects.length);

    if (!subjects.length) {
        // No subjects yet — if cache exists score it minimally
        if (cached?.length) {
            return cached.map(t => ({
                ...t,
                priorityScore: timePoints(t.dueDate) + sectionWeight(t.section)
            }));
        }
        return [];
    }

    const all = [];
    subjects.forEach(sub => {
        getProjectTasks(sub.tag).forEach(task => {
            all.push({
                ...task,
                priorityScore: scoreTask(task, sub),
                projectName: sub.name || sub.tag,
                projectId: sub.tag
            });
        });
    });

    all.sort((a,b) => b.priorityScore - a.priorityScore);
    if (all.length) storageSet('calculatedPriorityTasks', all);
    console.log('[PLEngine] Recalculated', all.length, 'tasks');
    return all;
}

// ── Rendering ────────────────────────────────────────────────────────────────
function fmtDate(ds) {
    if (!ds) return 'No due date';
    const d = new Date(ds);
    if (isNaN(d)) return '—';
    const t = new Date(); const tm = new Date(t); tm.setDate(t.getDate()+1);
    if (d.toDateString()===t.toDateString()) return 'Today';
    if (d.toDateString()===tm.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

function dueMeta(ds) {
    if (!ds) return {cls:'',label:'No due date',icon:'bi-calendar2'};
    const d=new Date(ds), t=new Date();
    t.setHours(0,0,0,0); d.setHours(0,0,0,0);
    const days=Math.round((d-t)/86400000);
    if (days<0) return {cls:'overdue',label:fmtDate(ds),icon:'bi-exclamation-triangle-fill'};
    if (days===0) return {cls:'due-today',label:'Today',icon:'bi-lightning-fill'};
    if (days<=2) return {cls:'due-soon',label:fmtDate(ds),icon:'bi-clock-fill'};
    return {cls:'',label:fmtDate(ds),icon:'bi-calendar2-event'};
}

function scoreColor(s) {
    if (s>=100) return '#FF3B30';
    if (s>=60)  return '#FF9F0A';
    if (s>=30)  return '#34C759';
    return '#007AFF';
}

function scoreRing(score) {
    const c=2*Math.PI*18, off=c*(1-Math.min(score/200,1)), col=scoreColor(score);
    return `<svg width="48" height="48" viewBox="0 0 48 48" class="score-ring">
        <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="4"/>
        <circle cx="24" cy="24" r="18" fill="none" stroke="${col}" stroke-width="4"
            stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round"
            transform="rotate(-90 24 24)"/>
        <text x="24" y="28" text-anchor="middle" font-size="9" fill="${col}" font-weight="700"
            font-family="'JetBrains Mono',monospace">${score.toFixed(0)}</text>
    </svg>`;
}

function breakdownHTML(task) {
    const tp=timePoints(task.dueDate), sw=sectionWeight(task.section);
    const sub=getSubjects().find(s=>s.tag===task.projectId);
    const ch=Number(sub?.relativeScore||0), cd=Number(sub?.cognitiveDifficulty||0);
    return `<div class="score-breakdown">
        ${[
            {l:'Time Urgency',v:tp,i:'bi-clock',c:'#FF9F0A'},
            {l:'Task Weightage',v:sw,i:'bi-bar-chart',c:'#5856D6'},
            {l:'Credit Hours',v:ch,i:'bi-book',c:'#34C759'},
            {l:'Cognitive Load',v:cd,i:'bi-cpu',c:'#FF3B30'}
        ].map(x=>`<div class="breakdown-item">
            <i class="${x.i}" style="color:${x.c}"></i>
            <span class="breakdown-label">${x.l}</span>
            <span class="breakdown-value" style="color:${x.c}">${x.v.toFixed(1)}</span>
        </div>`).join('')}
    </div>`;
}

function taskHTML(task, idx) {
    const sc=Number(task.priorityScore)||0, col=scoreColor(sc);
    const dm=dueMeta(task.dueDate);
    const tid=task.id||idx;
    return `<div class="task-card" data-task-id="${tid}" style="--score-color:${col}">
        <div class="task-card-main" onclick="window.PLEngine.toggleExpand('${tid}')">
            <div class="task-rank"><span class="rank-number">#${idx+1}</span></div>
            <div class="task-score-ring">${scoreRing(sc)}</div>
            <div class="task-info">
                <div class="task-title">${task.title||'Untitled'}</div>
                <div class="task-meta">
                    <span class="task-section-badge">${task.section||'General'}</span>
                    <span class="task-project">${task.projectName||task.projectId||'—'}</span>
                </div>
            </div>
            <div class="task-due ${dm.cls}"><i class="bi ${dm.icon}"></i><span>${dm.label}</span></div>
            <div class="task-actions">
                <button class="action-btn complete-btn" title="Complete"
                    onclick="event.stopPropagation();window.PLEngine.completeTask('${task.projectId}','${tid}')">
                    <i class="bi bi-check2-circle"></i></button>
                <button class="action-btn skip-btn" title="Skip"
                    onclick="event.stopPropagation();window.PLEngine.skipTask('${tid}')">
                    <i class="bi bi-skip-forward-fill"></i></button>
                <button class="action-btn" title="Details">
                    <i class="bi bi-chevron-down expand-chevron" id="chv-${tid}"></i></button>
            </div>
        </div>
        <div class="task-card-detail" id="det-${tid}" style="display:none">
            ${breakdownHTML(task)}
            <div class="detail-actions">
                <button class="detail-btn" onclick="window.PLEngine.genSubtasks('${tid}')">
                    <i class="bi bi-list-nested"></i> Generate Subtasks</button>
            </div>
            <div class="subtasks-list" id="sub-${tid}"></div>
        </div>
    </div>`;
}

function groupHeader(label, count) {
    return `<div class="group-header">
        <div class="group-header-left"><div class="group-dot"></div>
            <span class="group-label">${label}</span></div>
        <span class="group-count">${count} task${count!==1?'s':''}</span>
    </div>`;
}

function emptyState() {
    return `<div class="empty-state">
        <div class="empty-icon"><i class="bi bi-clipboard-check"></i></div>
        <h3>No Priority Tasks</h3>
        <p>Run the <strong>Priority Calculator</strong> to generate your ranked task list.</p>
        <a href="priority-calculator.html" class="empty-cta">
            <i class="bi bi-calculator"></i> Open Calculator</a>
    </div>`;
}

// ── Render entry point ───────────────────────────────────────────────────────
let _tasks=[], _sortField='score', _sortDir='desc', _search='';

function renderList(tasks) {
    const el=document.getElementById('pl-task-list');
    if (!el) return;
    if (!tasks?.length) { el.innerHTML=emptyState(); updateStats(0,0,0); return; }

    // Sort
    const sorted=[...tasks].sort((a,b)=>{
        let c=0;
        if (_sortField==='score') c=(b.priorityScore||0)-(a.priorityScore||0);
        else if (_sortField==='dueDate') {
            if (!a.dueDate&&!b.dueDate) c=0;
            else if (!a.dueDate) c=1; else if (!b.dueDate) c=-1;
            else c=new Date(a.dueDate)-new Date(b.dueDate);
        } else if (_sortField==='title') c=(a.title||'').localeCompare(b.title||'');
        else if (_sortField==='project') c=(a.projectName||'').localeCompare(b.projectName||'');
        return _sortDir==='asc'?-c:c;
    });

    // Group by interleave date
    const groups={};
    sorted.forEach(t=>{
        const k=t.lastInterleaved?new Date(t.lastInterleaved).toISOString().split('T')[0]:'none';
        if(!groups[k]) groups[k]=[];
        groups[k].push(t);
    });

    const keys=Object.keys(groups).sort((a,b)=>{
        if(a==='none') return -1; if(b==='none') return 1;
        return new Date(a)-new Date(b);
    });

    let html='', gi=0;
    keys.forEach(k=>{
        const grp=groups[k];
        const lbl=k==='none'?'Never Interleaved':
            `Interleaved on ${new Date(k).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`;
        html+=groupHeader(lbl,grp.length);
        grp.forEach(t=>{ html+=taskHTML(t,gi++); });
    });

    el.innerHTML=html;
    requestAnimationFrame(()=>{
        el.querySelectorAll('.task-card').forEach((c,i)=>{
            c.style.animationDelay=`${i*35}ms`;
            c.classList.add('animate-in');
        });
    });

    const scores=sorted.map(t=>t.priorityScore||0);
    updateStats(sorted.length, Math.max(...scores),
        sorted.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()).length);
}

function updateStats(total, top, overdue) {
    const g=id=>document.getElementById(id);
    if(g('stat-total')) g('stat-total').textContent=total;
    if(g('stat-top-score')) g('stat-top-score').textContent=isFinite(top)?top.toFixed(1):'0.0';
    if(g('stat-overdue')) g('stat-overdue').textContent=overdue;
}

// ── Refresh ──────────────────────────────────────────────────────────────────
function refresh() {
    _tasks=loadAndScore();
    const q=_search.trim().toLowerCase();
    const filtered=q?_tasks.filter(t=>
        (t.title||'').toLowerCase().includes(q)||
        (t.projectName||'').toLowerCase().includes(q)||
        (t.section||'').toLowerCase().includes(q)
    ):_tasks;
    renderList(filtered);
}

// ── Init ─────────────────────────────────────────────────────────────────────
function bindControls() {
    const sf=document.getElementById('pl-sort-field');
    if(sf) sf.addEventListener('change',()=>{ _sortField=sf.value; refresh(); });

    const sd=document.getElementById('pl-sort-dir');
    if(sd) sd.addEventListener('click',()=>{
        _sortDir=_sortDir==='desc'?'asc':'desc';
        sd.innerHTML=_sortDir==='desc'
            ?'<i class="bi bi-sort-down-alt"></i>'
            :'<i class="bi bi-sort-up-alt"></i>';
        refresh();
    });

    const si=document.getElementById('pl-search');
    if(si) si.addEventListener('input',()=>{ _search=si.value; refresh(); });

    const rb=document.getElementById('pl-refresh');
    if(rb) rb.addEventListener('click',()=>{
        rb.querySelector('i').classList.add('spinning');
        // Clear cache so we force recalc
        try { localStorage.removeItem(PFX+'calculatedPriorityTasks'); } catch{}
        refresh();
        setTimeout(()=>rb.querySelector('i').classList.remove('spinning'),700);
    });
}

function init() {
    // Initial render (may be empty if data not loaded yet)
    refresh();
    bindControls();

    // ── Listen for data arrival events ─────────────────────────────────────
    // 1. DataInitializationService fires this when auth + subjects + tasks loaded
    window.addEventListener('dataInitialized', ()=>{
        console.log('[PLEngine] dataInitialized → refreshing');
        // Give TaskSystem a moment to write to storage
        setTimeout(refresh, 200);
        setTimeout(refresh, 800);  // second pass after subscriptions settle
    });

    // 2. TaskSystem fires this on every task write
    window.addEventListener('gpac_tasks_updated', ()=>{
        console.log('[PLEngine] gpac_tasks_updated → refreshing');
        setTimeout(refresh, 150);
    });

    // 3. Generic tasksUpdated from multiple sources
    window.addEventListener('tasksUpdated', ()=>{ setTimeout(refresh, 150); });

    // 4. storage event (cross-tab or same-tab legacy writes)
    window.addEventListener('storage', e=>{
        const k=e.key||'';
        if(k.includes('calculatedPriorityTasks')||k.includes('academicSubjects')||
           k.includes('tasks_v5.')||k.includes('tasks-')) {
            setTimeout(refresh, 200);
        }
    });

    // 5. Polling fallback — retry up to 10s after page load if still empty
    let polls=0;
    const poll=setInterval(()=>{
        polls++;
        if(_tasks.length>0 || polls>20) { clearInterval(poll); return; }
        console.log(`[PLEngine] Poll #${polls} – retrying load`);
        refresh();
    }, 500);
}

// ── Task actions ─────────────────────────────────────────────────────────────
function toggleExpand(tid) {
    const d=document.getElementById(`det-${tid}`);
    const c=document.getElementById(`chv-${tid}`);
    if(!d) return;
    const open=d.style.display!=='none';
    d.style.display=open?'none':'block';
    if(c) c.style.transform=open?'':'rotate(180deg)';
}

function completeTask(pid, tid) {
    if(window.TaskSystem?.completeTask) { window.TaskSystem.completeTask(pid, tid); }
    _tasks=_tasks.filter(t=>String(t.id)!==String(tid));
    storageSet('calculatedPriorityTasks', _tasks);
    refresh();
    toast('✅ Task completed!','success');
}

function skipTask(tid) {
    const i=_tasks.findIndex(t=>String(t.id)===String(tid));
    if(i===-1) return;
    const [t]=_tasks.splice(i,1);
    t.lastSkipped=new Date().toISOString();
    _tasks.push(t);
    storageSet('calculatedPriorityTasks',_tasks);
    refresh();
    toast('⏭ Task skipped','info');
}

async function genSubtasks(tid) {
    const box=document.getElementById(`sub-${tid}`);
    if(!box) return;
    if(box.children.length){box.innerHTML='';return;}
    box.innerHTML='<div class="subtask-loading"><i class="bi bi-arrow-repeat spinning"></i> Generating…</div>';
    const task=_tasks.find(t=>String(t.id)===String(tid));
    if(!task){box.innerHTML='<div class="subtask-error">Task not found</div>';return;}
    try {
        const r=await fetch('/api/generate-subtasks',{
            method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({prompt:`Break this into steps:\nTask: ${task.title}\nSection: ${task.section}`})
        });
        if(!r.ok) throw new Error('API error');
        const d=await r.json();
        const subs=d.subtasks||[];
        if(!subs.length) throw new Error('No subtasks');
        box.innerHTML=subs.map((s,i)=>`<div class="subtask-item">
            <input type="checkbox" class="subtask-check" id="s-${tid}-${i}"
                onchange="this.closest('.subtask-item').classList.toggle('done',this.checked)">
            <label for="s-${tid}-${i}">${s}</label>
        </div>`).join('');
    } catch(e) {
        box.innerHTML=`<div class="subtask-error"><i class="bi bi-exclamation-triangle"></i> ${e.message}</div>`;
    }
}

function toast(msg, type='info') {
    const t=document.createElement('div');
    t.className=`pl-toast pl-toast-${type}`;
    t.textContent=msg;
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400);},2500);
}

// ── Export & auto-init ───────────────────────────────────────────────────────
window.PLEngine={init,refresh,toggleExpand,completeTask,skipTask,genSubtasks,toast};

if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
