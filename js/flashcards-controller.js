/**
 * flashcards-controller.js
 * Main controller for the Flashcards page
 */

import { SM2 } from './sm2.js';
import storageService from './services/StorageService.js';
import sanitizer from './utils/Sanitizer.js';
import { firebaseConfig, getOrCreateFirebaseApp } from './firebaseConfig.js';

// ============================================
// Firebase SDK Imports
// ============================================
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// ============================================
// State Management
// ============================================
class FlashcardsState {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.subjectsWithDecks = [];
        this.currentStudySession = null;
    }
}

const state = new FlashcardsState();

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// ============================================
// Initialization
// ============================================
async function init() {
    console.log('[Flashcards] Initializing...');
    
    try {
        const app = await getOrCreateFirebaseApp(initializeApp, getApps);
        state.db = getFirestore(app);
        state.auth = getAuth(app);

        onAuthStateChanged(state.auth, async (user) => {
            if (user) {
                state.currentUser = user;
                await loadSubjects();
                await loadDecks();
            } else {
                console.warn('[Flashcards] No user session');
            }
        });

        setupEventListeners();
    } catch (e) {
        console.error('[Flashcards] Init failed:', e);
    }
}

async function loadSubjects() {
    const select = document.getElementById('deckSubject');
    if (!select) return;

    select.innerHTML = '<option value="">Select a subject</option>';

    // Wait for SemesterService
    if (window.SemesterService && !window.SemesterService.initialized) {
        await new Promise(r => {
            const i = setInterval(() => { if(window.SemesterService.initialized) { clearInterval(i); r(); } }, 100);
            setTimeout(() => { clearInterval(i); r(); }, 2000);
        });
    }

    const subjects = window.SemesterService?.getCurrentSubjects() || [];
    subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.tag;
        opt.textContent = s.name;
        select.appendChild(opt);
    });
}

// ============================================
// Deck Operations
// ============================================
async function createDeck() {
    console.log('[Flashcards] Creating deck...');
    const titleInput = document.getElementById('deckTitle');
    const subjectSelect = document.getElementById('deckSubject');
    const descInput = document.getElementById('deckDescription');

    const title = titleInput.value.trim();
    const subjectId = subjectSelect.value;
    const subjectName = subjectSelect.options[subjectSelect.selectedIndex]?.text;

    if (!title || !subjectId) {
        alert('Please provide a title and select a subject.');
        return;
    }

    try {
        const userId = state.currentUser.uid;
        await addDoc(collection(state.db, `users/${userId}/flashcardDecks`), {
            title,
            subjectId,
            subjectName,
            description: descInput.value.trim(),
            cardCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Close modal
        const modalEl = document.getElementById('createDeckModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();

        // Refresh
        await loadDecks();
        
        // Reset form
        titleInput.value = '';
        descInput.value = '';
        subjectSelect.selectedIndex = 0;
    } catch (e) {
        console.error('[Flashcards] Create error:', e);
    }
}

async function loadDecks() {
    const list = document.getElementById('decksList');
    if (!list || !state.currentUser) return;

    list.innerHTML = '';
    const q = query(collection(state.db, `users/${state.currentUser.uid}/flashcardDecks`), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        document.getElementById('noDecksMessage').style.display = 'block';
        return;
    }
    document.getElementById('noDecksMessage').style.display = 'none';

    snapshot.forEach(doc => {
        const deck = { ...doc.data(), id: doc.id };
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="deck-card" data-deck-id="${deck.id}" data-action="open-deck">
                <div class="deck-title">${escapeHtml(deck.title)}</div>
                <div class="deck-desc">${escapeHtml(deck.description || 'No description')}</div>
                <div class="deck-meta">
                    <span class="badge-outline">${deck.cardCount || 0} cards</span>
                </div>
                <div class="deck-footer">
                    <div class="deck-subject"><i class="bi bi-journal-text"></i> ${escapeHtml(deck.subjectName)}</div>
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

function setupEventListeners() {
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        if (action === 'save-deck' || target.id === 'saveDeckBtn') {
            await createDeck();
        } else if (action === 'open-deck') {
            // Future impl for deck details
            console.log('Open deck:', target.dataset.deckId);
        }
    });

    document.getElementById('createDeckBtn')?.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('createDeckModal'));
        modal.show();
    });
    
    document.getElementById('saveDeckBtn')?.addEventListener('click', createDeck);
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
