/**
 * CalendarRenderer.js
 * Component for rendering the calendar grid, time axis, events, and indicators.
 * Extracted from CalendarManager (Batch 17).
 */

class CalendarRenderer {
    constructor(manager) {
        this.manager = manager;
        this.service = manager.service;
    }

    render() {
        this.updateDateDisplay();
        this.createTimeAxis();
        this.createCalendarGrid();
        this.renderEvents();
        this.renderSleepSchedule();
        this.updateTimeCalculations();
        this.updateCurrentTimeIndicator();
        this.manager.adjustCalendarToViewport();
    }

    updateDateDisplay() {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const dateElement = this.manager.currentDateElement || document.getElementById('currentDate');
        const date = this.manager.currentDate || new Date();
        
        if (dateElement && date instanceof Date && !isNaN(date.getTime())) {
            dateElement.textContent = date.toLocaleDateString('en-US', options);
        }
    }

    createTimeAxis() {
        const axis = document.getElementById('time-axis') || this.manager.timeAxis;
        if (!axis) return;
        
        axis.innerHTML = '';
        const totalHours = 24;
        const rowHeight = 60; // 4 slots * 15px

        for (let hour = 0; hour < totalHours; hour++) {
            const hourBox = document.createElement('div');
            hourBox.className = 'hour-box';
            hourBox.style.height = `${rowHeight}px`;
            hourBox.style.position = 'relative';
            
            const h12 = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
            const ampm = hour < 12 ? 'AM' : 'PM';
            const displayTime = `${h12} ${ampm}`;

            const label = document.createElement('span');
            label.textContent = displayTime;
            Object.assign(label.style, {
                position: 'absolute',
                top: '0',
                right: '10px',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                color: 'var(--dd-text-2)',
                fontFamily: 'Inter, sans-serif'
            });

            hourBox.appendChild(label);
            axis.appendChild(hourBox);
        }
    }

    createCalendarGrid() {
        if (!this.manager.calendarGrid) return;
        this.manager.calendarGrid.innerHTML = '';
        const totalSlots = 96; // 24 hours * 4 slots

        for (let slot = 0; slot < totalSlots; slot++) {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'grid-slot';
            if (slot % 4 === 0) {
                slotDiv.classList.add('hour-mark');
            } else if (slot % 2 === 0) {
                slotDiv.classList.add('half-hour-mark');
            } else {
                slotDiv.classList.add('quarter-mark');
            }
            this.manager.calendarGrid.appendChild(slotDiv);
        }
    }

    renderSleepSchedule() {
        if (!this.manager.calendarGrid) return;
        const schedule = this.service.getSleepSchedule();
        if (!schedule) return;
        const { wakeTime, sleepTime, wakeBuffer, sleepBuffer } = schedule;

        if (wakeTime) {
            const wakeIndicator = document.createElement('div');
            wakeIndicator.className = 'sleep-indicator';
            const wakePosition = this.service.timeToMinutes(wakeTime);
            wakeIndicator.style.top = `${wakePosition}px`;
            wakeIndicator.style.height = '20px';
            this.manager.calendarGrid.appendChild(wakeIndicator);

            if (wakeBuffer > 0) {
                const wakeBufferZone = document.createElement('div');
                wakeBufferZone.className = 'wake-buffer-zone';
                const bufferStart = this.service.timeToMinutes(this.service.adjustTimeByMinutes(wakeTime, -wakeBuffer));
                wakeBufferZone.style.top = `${bufferStart}px`;
                wakeBufferZone.style.height = `${wakeBuffer}px`;
                this.manager.calendarGrid.appendChild(wakeBufferZone);
            }
        }

        if (sleepTime) {
            const sleepIndicator = document.createElement('div');
            sleepIndicator.className = 'sleep-indicator';
            const sleepPosition = this.service.timeToMinutes(sleepTime);
            sleepIndicator.style.top = `${sleepPosition}px`;
            sleepIndicator.style.height = '20px';
            this.manager.calendarGrid.appendChild(sleepIndicator);

            if (sleepBuffer > 0) {
                const sleepBufferZone = document.createElement('div');
                sleepBufferZone.className = 'sleep-buffer-zone';
                const bufferStart = this.service.timeToMinutes(this.service.adjustTimeByMinutes(sleepTime, -sleepBuffer));
                sleepBufferZone.style.top = `${bufferStart}px`;
                sleepBufferZone.style.height = `${sleepBuffer}px`;
                this.manager.calendarGrid.appendChild(sleepBufferZone);
            }
        }
    }

    renderEvents() {
        if (!this.manager.calendarGrid) return;
        document.querySelectorAll('.task-block').forEach(el => el.remove());
        const todayEvents = this.service.getEventsForDate(this.manager.currentDate);

        const timeSlots = new Map();

        todayEvents.forEach(event => {
            const startMinutes = this.service.timeToMinutes(event.startTime);
            const endMinutes = this.service.timeToMinutes(event.endTime);
            const duration = endMinutes - startMinutes;
            
            // Calculate grid rows (for overlap logic)
            const startRow = Math.floor(startMinutes / 15);
            const endRow = Math.ceil(endMinutes / 15);

            const slotHeight = 15; // 15px per 15 minutes
            const top = (startMinutes / 15) * slotHeight + 15;
            const height = Math.max(slotHeight, (duration / 15) * slotHeight);

            // Overlap handling logic
            let horizontalOffset = 0;
            for (let row = startRow; row < endRow; row++) {
                if (timeSlots.has(row)) {
                    horizontalOffset = Math.max(horizontalOffset, timeSlots.get(row) + 1);
                }
            }
            for (let row = startRow; row < endRow; row++) {
                timeSlots.set(row, horizontalOffset);
            }
            
            const taskBlock = document.createElement('div');
            taskBlock.className = `task-block ${event.type}`;
            taskBlock.style.cursor = 'pointer'; // UI/UX Pro Max: cursor-pointer
            
            taskBlock.innerHTML = `
                <div class="task-time">${event.startTime} - ${event.endTime}</div>
                <div class="task-title">
                    ${event.type === 'alarm' ? '<i class="bi bi-alarm me-1"></i>' : ''}
                    ${event.subject || event.title}
                </div>
                ${event.type !== 'alarm' ? '<div class="resize-handle top"></div><div class="resize-handle bottom"></div>' : ''}
            `;

            Object.assign(taskBlock.style, {
                top: `${top}px`,
                height: `${height}px`,
                marginLeft: `${horizontalOffset * 10}%`,
                width: `calc(${100 - (horizontalOffset * 10)}% - 4px)`,
                zIndex: (10 + horizontalOffset).toString(),
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' // UI/UX Pro Max: smooth transitions
            });

            taskBlock.dataset.eventId = event.id;
            this.manager.calendarGrid.appendChild(taskBlock);
            this.manager.eventsController.setupEventBlockInteraction(taskBlock, event);
        });
    }

    updateTimeCalculations() {
        const stats = this.service.calculateDailyStats(this.manager.currentDate);
        
        if (this.manager.totalAvailableTimeElement)
            this.manager.totalAvailableTimeElement.textContent = `Total Available: ${this.service.formatMinutesToTime(stats.totalAvailable)}`;
        if (this.manager.freeStudyTimeElement)
            this.manager.freeStudyTimeElement.textContent = `Study Time: ${this.service.formatMinutesToTime(stats.freeStudy)}`;
        if (this.manager.scheduledTimeElement)
            this.manager.scheduledTimeElement.textContent = `Scheduled: ${this.service.formatMinutesToTime(stats.scheduled)}`;
    }

    updateCurrentTimeIndicator() {
        if (!this.manager.calendarGrid) return;
        try {
            const now = new Date();
            const totalMinutes = now.getHours() * 60 + now.getMinutes();

            let indicator = this.manager.calendarGrid.querySelector('.current-time-indicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'current-time-indicator';
                const timeLabel = document.createElement('div');
                timeLabel.className = 'current-time-label';
                indicator.appendChild(timeLabel);
                this.manager.calendarGrid.appendChild(indicator);
            }

            const slotHeight = 15;
            const topPosition = (totalMinutes / 15) * slotHeight + 15;

            indicator.style.top = `${topPosition}px`;
            indicator.style.display = 'block';

            // Auto-scroll to current time on first load
            if (!this.hasAutoScrolled) {
                const container = document.querySelector('.calendar-grid-container');
                if (container) {
                    container.scrollTop = Math.max(0, topPosition - 100);
                    this.hasAutoScrolled = true;
                }
            }

            const timeLabel = indicator.querySelector('.current-time-label');
            if (timeLabel) {
                timeLabel.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            }

            this.displayCurrentTask(now);

            const gridContainer = document.querySelector('.calendar-grid-container');
            if (gridContainer) {
                const containerHeight = gridContainer.clientHeight;
                const scrollTop = gridContainer.scrollTop;
                const scrollBottom = scrollTop + containerHeight;

                if (totalMinutes < scrollTop || totalMinutes > scrollBottom - 100) {
                    gridContainer.scrollTop = Math.max(0, totalMinutes - (containerHeight / 2));
                }
            }
        } catch (error) {
            console.error("Error updating time indicator:", error);
        }
    }

    displayCurrentTask(currentTime) {
        const todayEvents = this.service.getEventsForDate(currentTime);
        const currentTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
        const currentMinutes = this.service.timeToMinutes(currentTimeStr);

        const currentEvent = todayEvents.find(event => {
            const start = this.service.timeToMinutes(event.startTime);
            const end = this.service.timeToMinutes(event.endTime);
            return currentMinutes >= start && currentMinutes <= end;
        });

        if (window.currentTaskManager) {
            window.currentTaskManager.setCurrentTask(currentEvent || null);
        }

        document.querySelectorAll('.current-active-task').forEach(el => el.classList.remove('current-active-task'));
        if (currentEvent) {
            const eventBlock = document.querySelector(`[data-event-id="${currentEvent.id}"]`);
            if (eventBlock) eventBlock.classList.add('current-active-task');
        }
    }

    formatTime(hours, minutes) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

export default CalendarRenderer;
