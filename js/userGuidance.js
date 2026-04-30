// Get storage service with fallback (use existing or create new)
if (typeof window.getStorage === 'undefined') {
    window.getStorage = () => window.StorageService || {
        get: (k, d) => { try { return JSON.parse(storageService.get(k)) ?? d; } catch { return d; } },
        set: (k, v) => storageService.set(k, v)
    };
}
const getStorage = window.getStorage;

class UserGuidance {
    constructor() {
        this.storageKey = 'userGuidance';
        this.initializeGuidance();
    }

    // Check if it's the first time the user is using the app
    isFirstTimeUser() {
        const guidanceData = this.getGuidanceData();
        return !guidanceData.hasCompletedInitialTour;
    }

    // Get or initialize guidance data
    getGuidanceData() {
        const storage = getStorage();
        return storage.get(this.storageKey, {
            hasCompletedInitialTour: true,
            hasCompletedNavigationGuide: false,
            navigationGuideShown: false,
            completedPages: [],
            lastVisitedPage: null,
            tourProgress: 0
        });
    }

    // Save guidance data
    saveGuidanceData(data) {
        const storage = getStorage();
        storage.set(this.storageKey, data);
    }

    // Initialize guidance system
    initializeGuidance() {
        const guidanceData = this.getGuidanceData();

        // Show navigation guide only once for new users
        if (!guidanceData.hasCompletedNavigationGuide && !guidanceData.navigationGuideShown) {
            // Mark that navigation guide has been shown
            guidanceData.navigationGuideShown = true;
            this.saveGuidanceData(guidanceData);

            // Show navigation guide
            this.showNavigationGuide();
        }
    }

    // Start the initial tour
    startInitialTour() {
        // Create a full-screen overlay with tour information
        const tourOverlay = this.createTourOverlay();
        document.body.appendChild(tourOverlay);
    }

    // Create an interactive tour overlay
    createTourOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'user-guidance-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        const tourSteps = [
            {
                title: "Welcome to GPAce!",
                description: "Your personal productivity and task management companion.",
                nextStep: "Let's get started with a quick tour."
            },
            {
                title: "Grind Page: Your Task Hub",
                description: "This is where you'll manage and track your tasks. Create, prioritize, and complete tasks efficiently.",
                nextStep: "Learn how to add your first task."
            },
            {
                title: "Adding Tasks",
                description: "Click the '+' button to add a new task. You can add details like project, section, and priority.",
                nextStep: "Discover task prioritization."
            },
            {
                title: "Task Prioritization",
                description: "Tasks are automatically prioritized based on various factors. The Priority Calculator helps you understand task importance.",
                nextStep: "Explore more features."
            }
        ];

        let currentStep = 0;

        const titleEl = document.createElement('h1');
        const descriptionEl = document.createElement('p');
        const nextStepEl = document.createElement('p');
        const nextButton = document.createElement('button');

        titleEl.style.cssText = 'font-size: 2rem; margin-bottom: 20px; color: #fe2c55;';
        descriptionEl.style.cssText = 'font-size: 1.2rem; max-width: 600px; margin-bottom: 20px;';
        nextStepEl.style.cssText = 'font-style: italic; margin-bottom: 20px;';
        nextButton.style.cssText = `
            background-color: #fe2c55;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        `;

        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentStep++;
            if (currentStep < tourSteps.length) {
                updateStep();
            } else {
                this.completeTour();
                overlay.remove();
            }
        });

        function updateStep() {
            const step = tourSteps[currentStep];
            titleEl.textContent = step.title;
            descriptionEl.textContent = step.description;
            nextStepEl.textContent = step.nextStep;
            nextButton.textContent = currentStep === tourSteps.length - 1 ? 'Finish' : 'Next';
        }

        updateStep();

        overlay.appendChild(titleEl);
        overlay.appendChild(descriptionEl);
        overlay.appendChild(nextStepEl);
        overlay.appendChild(nextButton);

        return overlay;
    }

    // Complete the initial tour
    completeTour() {
        const guidanceData = this.getGuidanceData();
        guidanceData.hasCompletedInitialTour = true;
        this.saveGuidanceData(guidanceData);
    }

    // Show contextual help for a specific page
    showContextualHelp(pageName) {
        const helpContent = {
            'grind.html': {
                title: 'Task Management',
                description: 'Add, prioritize, and track your tasks here. Use the "+" button to create new tasks.',
                tips: [
                    'Click "+" to add a new task',
                    'Drag and drop to reorder tasks',
                    'Use the priority calculator to understand task importance'
                ]
            },
            'priority-calculator.html': {
                title: 'Priority Insights',
                description: 'Understand how your tasks are prioritized based on various factors.',
                tips: [
                    'View detailed priority breakdown',
                    'Learn why a task is considered high or low priority'
                ]
            }
            // Add more pages as needed
        };

        const content = helpContent[pageName];
        if (!content) return;

        // Create a help modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            color: black;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        modal.innerHTML = `
            <h2 style="color: #fe2c55;">${content.title}</h2>
            <p>${content.description}</p>
            <h3>Quick Tips:</h3>
            <ul>
                ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
            <button id="close-help-modal" style="
                background-color: #fe2c55;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('#close-help-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Add navigation guide method
    showNavigationGuide() {
        // Create a full-screen overlay for navigation guidance
        const navGuideOverlay = document.createElement('div');
        navGuideOverlay.id = 'navigation-guide-overlay';
        navGuideOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        // Enhanced page descriptions with interactive elements
        const pageDescriptions = {
            'grind': {
                title: "Task Management Hub",
                description: "Your central workspace for managing tasks and boosting productivity.",
                features: [
                    "Create and organize tasks by project and priority",
                    "Track progress with visual indicators",
                    "Set deadlines and reminders",
                    "Filter tasks by status or category"
                ],
                demoAction: () => {
                    const demoTask = document.createElement('div');
                    demoTask.className = 'demo-task-card';
                    demoTask.innerHTML = `
                        <div class="task-card-header">
                            <span class="task-status-pill">In Progress</span>
                            <span class="task-priority-tag high">High Priority</span>
                        </div>
                        <h4>Final Research Paper</h4>
                        <p>Complete deep analysis of historical data and finalize the conclusion section.</p>
                        <div class="task-card-footer">
                            <div class="task-meta">
                                <span><i class="bi bi-calendar3"></i> Due Tomorrow</span>
                                <span><i class="bi bi-folder2"></i> Academics</span>
                            </div>
                            <div class="task-actions-demo">
                                <button class="btn-demo secondary"><i class="bi bi-pencil"></i></button>
                                <button class="btn-demo primary"><i class="bi bi-check2-all"></i></button>
                            </div>
                        </div>
                    `;
                    return demoTask;
                }
            },
            'priority-calculator': {
                title: "Smart Priority Calculator",
                description: "Understand and optimize your task prioritization with AI-driven insights.",
                features: [
                    "Automatic priority scoring based on multiple factors",
                    "Visual priority breakdown",
                    "Customizable weight factors",
                    "Priority trends and insights"
                ],
                demoAction: () => {
                    const demoCalc = document.createElement('div');
                    demoCalc.className = 'demo-calculator-card';
                    demoCalc.innerHTML = `
                        <div class="calc-factors">
                            <div class="factor-row">
                                <span>Urgency</span>
                                <div class="factor-bar"><div class="fill" style="width: 85%;"></div></div>
                            </div>
                            <div class="factor-row">
                                <span>Importance</span>
                                <div class="factor-bar"><div class="fill" style="width: 70%;"></div></div>
                            </div>
                            <div class="factor-row">
                                <span>Impact</span>
                                <div class="factor-bar"><div class="fill" style="width: 90%;"></div></div>
                            </div>
                        </div>
                        <div class="priority-score-display">
                            <div class="score-ring">
                                <span class="score-val">9.2</span>
                                <span class="score-label">Score</span>
                            </div>
                            <div class="priority-status">Ultra High</div>
                        </div>
                    `;
                    return demoCalc;
                }
            },
            'study-spaces': {
                title: "Premium Study Environments",
                description: "Create and customize your ideal digital study spaces for deep focus.",
                features: [
                    "Create multiple study space layouts",
                    "Track time spent in each space",
                    "Set environment preferences",
                    "Quick-switch between spaces"
                ],
                demoAction: () => {
                    const demoSpace = document.createElement('div');
                    demoSpace.className = 'demo-space-card';
                    demoSpace.innerHTML = `
                        <div class="space-preview-box">
                            <div class="space-header">
                                <i class="bi bi-layers-fill"></i>
                                <span>Deep Work Mode</span>
                            </div>
                            <div class="space-active-tools">
                                <span class="tool-chip"><i class="bi bi-music-note-beamed"></i> Lo-fi</span>
                                <span class="tool-chip"><i class="bi bi-hourglass-split"></i> 25m</span>
                                <span class="tool-chip"><i class="bi bi-shield-lock"></i> Focused</span>
                            </div>
                        </div>
                    `;
                    return demoSpace;
                }
            },
            'academic-details': {
                title: "Academic Intelligence",
                description: "Monitor your academic journey with advanced analytics and goal tracking.",
                features: [
                    "Track course grades and GPA",
                    "Set academic goals",
                    "View progress trends",
                    "Generate progress reports"
                ],
                demoAction: () => {
                    const demoAcademics = document.createElement('div');
                    demoAcademics.className = 'demo-academic-card';
                    demoAcademics.innerHTML = `
                        <div class="academic-stats-grid">
                            <div class="stat-box">
                                <span class="label">Current GPA</span>
                                <span class="value">3.92</span>
                            </div>
                            <div class="stat-box">
                                <span class="label">Rank</span>
                                <span class="value">Top 5%</span>
                            </div>
                        </div>
                        <div class="progress-section">
                            <div class="progress-info">
                                <span>Semester Progress</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: 75%;"></div>
                            </div>
                        </div>
                    `;
                    return demoAcademics;
                }
            }
        };

        // Create interactive content container
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 30px;
            margin: 20px;
            max-width: 800px;
            width: 90%;
            backdrop-filter: blur(5px);
        `;

        // Style for interactive elements
        const style = document.createElement('style');
        style.textContent = `
            @keyframes guide-fade-in {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes guide-pulse-glow {
                0% { box-shadow: 0 0 10px rgba(255, 45, 85, 0.2); }
                50% { box-shadow: 0 0 25px rgba(255, 45, 85, 0.4); }
                100% { box-shadow: 0 0 10px rgba(255, 45, 85, 0.2); }
            }

            @keyframes guide-slide-in {
                from { transform: translateX(30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            #navigation-guide-overlay {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: radial-gradient(circle at center, rgba(15, 15, 15, 0.85) 0%, rgba(5, 5, 5, 0.95) 100%) !important;
                backdrop-filter: blur(12px) saturate(180%);
            }

            .guide-content-wrapper {
                background: rgba(30, 30, 30, 0.6) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 20px !important;
                padding: 40px !important;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5) !important;
                animation: guide-fade-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                max-width: 800px;
                width: 90%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .demo-section {
                margin: 0;
                padding: 0;
                background: transparent !important;
                text-align: center;
                width: 100%;
            }

            .guide-title {
                color: #FF2D55 !important;
                font-size: 2.5rem !important;
                font-weight: 800 !important;
                margin-bottom: 10px !important;
                letter-spacing: -0.02em !important;
            }

            .guide-desc {
                font-size: 1.2rem !important;
                color: rgba(255, 255, 255, 0.8) !important;
                line-height: 1.5 !important;
                margin-bottom: 30px !important;
            }

            .feature-list {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 25px 0 !important;
                text-align: left !important;
            }

            .feature-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 12px 15px;
                border-radius: 12px;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .feature-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateX(5px);
                border-color: rgba(255, 45, 85, 0.3);
            }

            .feature-item:before {
                content: '✦';
                margin-right: 12px;
                color: #FF2D55;
                font-size: 1.2rem;
            }

            /* Premium Demo Cards */
            .demo-container {
                margin: 30px 0;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                animation: guide-slide-in 0.5s ease-out;
                width: 100%;
                box-sizing: border-box;
            }

            .demo-task-card, .demo-calculator-card, .demo-space-card, .demo-academic-card {
                background: linear-gradient(145deg, rgba(40, 40, 40, 0.95), rgba(20, 20, 20, 0.95));
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 24px;
                color: white;
                text-align: left;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }

            /* Task Card Demo Styles */
            .task-card-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .task-status-pill { background: rgba(0, 178, 255, 0.2); color: #00B2FF; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
            .task-priority-tag { background: rgba(255, 45, 85, 0.2); color: #FF2D55; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
            .demo-task-card h4 { margin: 0 0 8px 0; font-size: 1.3rem; }
            .demo-task-card p { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; margin-bottom: 20px; }
            .task-card-footer { display: flex; justify-content: space-between; align-items: center; }
            .task-meta { display: flex; gap: 15px; color: rgba(255, 255, 255, 0.4); font-size: 0.8rem; }
            .task-actions-demo { display: flex; gap: 10px; }
            .btn-demo { border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
            .btn-demo.primary { background: #FF2D55; color: white; }
            .btn-demo.secondary { background: rgba(255, 255, 255, 0.1); color: white; }

            /* Calculator Demo Styles */
            .factor-row { margin-bottom: 12px; }
            .factor-row span { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 5px; }
            .factor-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
            .factor-bar .fill { height: 100%; background: #FF2D55; border-radius: 10px; }
            .priority-score-display { display: flex; align-items: center; gap: 20px; margin-top: 20px; }
            .score-ring { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #FF2D55; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(255, 45, 85, 0.4); }
            .score-val { font-size: 1.2rem; font-weight: 800; line-height: 1; }
            .score-label { font-size: 0.6rem; opacity: 0.6; }
            .priority-status { font-size: 1.1rem; font-weight: 700; color: #FF2D55; }

            /* Space Card Demo Styles */
            .space-preview-box { height: 120px; background: rgba(0,0,0,0.3); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed rgba(255,255,255,0.2); }
            .space-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; font-size: 1.1rem; }
            .space-active-tools { display: flex; gap: 8px; }
            .tool-chip { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 30px; font-size: 0.75rem; }

            /* Academic Card Demo Styles */
            .academic-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .stat-box { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; }
            .stat-box .label { display: block; font-size: 0.75rem; color: rgba(255,255,255,0.5); }
            .stat-box .value { font-size: 1.4rem; font-weight: 800; color: #FF2D55; }
            .progress-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; }
            .progress-bar-container { height: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; }
            .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #FF2D55, #FF4D70); border-radius: 10px; }

            /* Navigation Controls */
            .guide-nav-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 40px;
                width: 100%;
            }

            .nav-button {
                background: rgba(255, 255, 255, 0.05);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 12px 24px;
                border-radius: 30px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .nav-button:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .nav-button.primary-action {
                background: #FF2D55;
                border-color: #FF2D55;
                box-shadow: 0 4px 15px rgba(255, 45, 85, 0.3);
            }

            .nav-button.primary-action:hover {
                background: #FF4D70;
                box-shadow: 0 6px 20px rgba(255, 45, 85, 0.5);
            }

            .nav-button.close-guide {
                background: transparent;
                border-color: transparent;
                color: rgba(255, 255, 255, 0.5);
            }

            .nav-button.close-guide:hover {
                color: white;
                background: rgba(255, 255, 255, 0.05);
            }

            /* Progress Indicator */
            .guide-progress-dots {
                display: flex;
                gap: 8px;
                margin-top: 20px;
                justify-content: center;
            }

            .progress-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
            }

            .progress-dot.active {
                background: #FF2D55;
                width: 24px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(255, 45, 85, 0.5);
            }
        `;
        document.head.appendChild(style);

        // Function to create section content
        function createSectionContent(pageKey) {
            const pageInfo = pageDescriptions[pageKey];
            if (!pageInfo) return null;

            const section = document.createElement('div');
            section.className = 'demo-section';

            section.innerHTML = `
                <h2 class="guide-title">${pageInfo.title}</h2>
                <p class="guide-desc">${pageInfo.description}</p>
                <div class="feature-list">
                    ${pageInfo.features.map(feature => `
                        <div class="feature-item">${feature}</div>
                    `).join('')}
                </div>
            `;

            // Add interactive demo
            const demoContainer = document.createElement('div');
            demoContainer.className = 'demo-container';
            demoContainer.appendChild(pageInfo.demoAction());
            section.appendChild(demoContainer);

            return section;
        }

        // Navigation controls container
        const guideWrapper = document.createElement('div');
        guideWrapper.className = 'guide-content-wrapper';

        const navControls = document.createElement('div');
        navControls.className = 'guide-nav-controls';

        const progressDots = document.createElement('div');
        progressDots.className = 'guide-progress-dots';

        const pages = Object.keys(pageDescriptions);
        let currentPageIndex = 0;

        function updateContent() {
            guideWrapper.innerHTML = '';
            const content = createSectionContent(pages[currentPageIndex]);
            if (content) {
                guideWrapper.appendChild(content);
            }
            
            // Update dots
            progressDots.innerHTML = '';
            pages.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `progress-dot ${i === currentPageIndex ? 'active' : ''}`;
                progressDots.appendChild(dot);
            });

            guideWrapper.appendChild(navControls);
            guideWrapper.appendChild(progressDots);
        }

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'nav-button';
        prevButton.innerHTML = '<i class="bi bi-chevron-left"></i> Previous';
        prevButton.onclick = () => {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                updateContent();
            }
        };

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'nav-button primary-action';
        nextButton.innerHTML = 'Next <i class="bi bi-chevron-right"></i>';
        nextButton.onclick = () => {
            if (currentPageIndex < pages.length - 1) {
                currentPageIndex++;
                updateContent();
            } else {
                finishGuide();
            }
        };

        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'nav-button close-guide';
        closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
        closeButton.onclick = () => finishGuide();

        const finishGuide = () => {
            navGuideOverlay.style.opacity = '0';
            navGuideOverlay.style.transform = 'scale(1.1)';
            setTimeout(() => {
                navGuideOverlay.remove();
                const guidanceData = this.getGuidanceData();
                guidanceData.hasCompletedNavigationGuide = true;
                this.saveGuidanceData(guidanceData);
            }, 300);
        };

        navControls.appendChild(prevButton);
        navControls.appendChild(nextButton);
        navControls.appendChild(closeButton);

        // Initial content setup
        updateContent();

        navGuideOverlay.appendChild(guideWrapper);
        document.body.appendChild(navGuideOverlay);
    }

    // Modify help button to always show navigation guide
    addHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.id = 'helpButton';
        helpButton.textContent = '?';
        
        // Base styles for the help button
        const baseStyle = `
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fe2c55, #ff4d70);
            color: white;
            border: none;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            cursor: pointer;
            z-index: 1200;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const commandCenter = document.getElementById('commandCenter');
        
        if (commandCenter) {
            helpButton.className = 'cc-tool-btn cc-help-btn';
            helpButton.style.cssText = "position: static !important; margin: 0 !important; background: #fe2c55; color: white; font-weight: bold;";
            commandCenter.appendChild(helpButton);
        } else {
            helpButton.style.cssText = baseStyle + `
                position: fixed;
                top: calc(var(--button-top-position, 5rem) + 7rem);
                left: 1.25rem;
            `;
            document.body.appendChild(helpButton);
        }

        helpButton.addEventListener('click', () => {
            // Always show full navigation guide
            this.showNavigationGuide();
        });

        helpButton.addEventListener('mouseenter', () => {
            helpButton.style.transform = 'scale(1.1)';
            if (!commandCenter) {
                helpButton.style.boxShadow = '0 6px 12px rgba(254, 44, 85, 0.3)';
            }
        });

        helpButton.addEventListener('mouseleave', () => {
            helpButton.style.transform = 'scale(1)';
            if (!commandCenter) {
                helpButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }
        });

        // Add mobile responsiveness if not in command center
        if (!commandCenter) {
            const updateHelpButtonPosition = () => {
                if (window.innerWidth <= 768) {
                    helpButton.style.top = 'var(--button-top-position-mobile, 4rem)';
                    helpButton.style.left = '1.25rem';
                } else {
                    helpButton.style.top = 'var(--button-top-position, 5rem)';
                    helpButton.style.left = '1.25rem';
                }
            };
            window.addEventListener('resize', updateHelpButtonPosition);
            updateHelpButtonPosition();
        }
    }
}

// Initialize user guidance
const userGuidance = new UserGuidance();

// Add help button to all pages
userGuidance.addHelpButton();

export default userGuidance;


