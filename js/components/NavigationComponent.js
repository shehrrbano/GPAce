/**
 * NavigationComponent - Centralized navigation bar injection
 * 
 * Injects a consistent, modern pill-style navigation bar across all pages.
 * 
 * @module NavigationComponent
 */

const NAV_LINKS = [
    { href: 'grind.html', label: 'Grind Mode', icon: 'bi-lightning-charge' },
    { href: 'study-spaces.html', label: 'Grindstation', icon: 'bi-building' },
    { href: 'daily-calendar.html', label: 'Daily Calendar', icon: 'bi-calendar3' },
    { href: 'academic-details.html', label: 'Academic Details', icon: 'bi-mortarboard' },
    { href: 'extracted.html', label: 'Extractor', icon: 'bi-collection' },
    { href: 'subject-marks.html', label: 'Subject Marks', icon: 'bi-graph-up' },
    { href: 'flashcards.html', label: 'Flashcards', icon: 'bi-card-text' },
    { href: 'markdown-converter.html', label: 'Markdown Converter', icon: 'bi-markdown' }
];

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page || 'index.html';
}

function generateNavHTML() {
    const currentPage = getCurrentPage();
    
    const linksHTML = NAV_LINKS.map(link => {
        const isActive = link.href === currentPage;
        return `
            <a href="${link.href}" class="nav-item ${isActive ? 'active' : ''}" data-label="${link.label}">
                <i class="bi ${link.icon}"></i>
                <span class="nav-label">${link.label}</span>
            </a>`;
    }).join('');

    return `
    <nav class="pm-nav" id="mainNavigation">
        <a href="grind.html" class="pm-nav-brand">
            <img src="assets/images/gpace-logo-white.png" alt="GPAce Logo">
            <span>GPAce</span>
        </a>
        
        <div class="pm-nav-links-pill">
            <div class="pm-nav-links">
                ${linksHTML}
            </div>
        </div>

        <div class="pm-nav-actions">
            <button class="pm-drawer-toggle" id="globalSettingsBtn" title="Settings">
                <i class="bi bi-gear-fill"></i>
            </button>
            <button class="pm-nav-toggle d-md-none" id="navToggleBtn">
                <i class="bi bi-list"></i>
            </button>
        </div>
    </nav>
    `;
}

export function injectNavigation(options = {}) {
    const { targetSelector = 'body', force = false } = options;

    if (window.self !== window.top && !force) {
        console.log('[NavigationComponent] Iframe detected, skipping navigation injection');
        document.body.classList.add('no-nav');
        return null;
    }

    document.querySelectorAll('.top-nav, .pm-nav').forEach(el => el.remove());

    const navHTML = generateNavHTML();
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = navHTML.trim();
    const navElement = tempContainer.firstElementChild;

    const target = document.querySelector(targetSelector);
    if (target) {
        target.insertBefore(navElement, target.firstChild);
    }

    setupEventListeners();
    return navElement;
}

function setupEventListeners() {
    const settingsBtn = document.getElementById('globalSettingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('toggleSettingsDrawer'));
        });
    }

    const navToggle = document.getElementById('navToggleBtn');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            document.querySelector('.pm-nav-links-pill').classList.toggle('mobile-show');
        });
    }
}

if (typeof window !== 'undefined') {
    window.NavigationComponent = { injectNavigation, NAV_LINKS };
}

export default { injectNavigation, NAV_LINKS };
