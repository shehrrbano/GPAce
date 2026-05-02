/**
 * CalendarManager.js
 * Main orchestrator for the daily calendar view.
 * Decoupled into Service (logic), Renderer (UI), and Events (interaction).
 */

import { calendarService } from './services/CalendarService.js';
import CalendarRenderer from './components/CalendarRenderer.js';
import CalendarEvents from './controllers/CalendarEvents.js';

class CalendarManager {
    constructor() {
        this.service = calendarService;
        this.renderer = new CalendarRenderer(this);
        this.eventsController = new CalendarEvents(this);
        
        this.currentDate = this.service.currentDate || new Date();

        this.initializeElements();
        this.setupEventListeners();
        
        // Initial UI render (Grid, Axis, Time Indicator) - Instant feedback
        this.render();
        this.renderer.updateCurrentTimeIndicator();
        
        this.loadSavedData();
        
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('dailySchedule')) this.render();
            if (e.key && e.key.includes('alarms')) this.render();
        });

        // Use internal subscription for same-tab updates
        storageService.subscribe('alarms', () => this.render());
    }

    get events() { return this.service.events; }

    async loadSavedData() {
        await this.service.loadEvents();
        this.render();
    }

    render() {
        this.renderer.render();
    }

    initializeElements() {
        this.prevButton = document.getElementById('prevDay');
        this.nextButton = document.getElementById('nextDay');
        this.currentDateElement = document.getElementById('currentDate');
        this.wakeTimeInput = document.getElementById('wakeTime');
        this.sleepTimeInput = document.getElementById('sleepTime');
        this.applyTimesButton = document.getElementById('applyTimes');
        this.calendarGrid = document.querySelector('.calendar-grid');
        this.timeAxis = document.querySelector('.time-axis');

        this.totalAvailableTimeElement = document.getElementById('ddStatTotal') || document.getElementById('totalAvailableTime');
        this.freeStudyTimeElement = document.getElementById('ddStatStudy') || document.getElementById('freeStudyTime');
        this.scheduledTimeElement = document.getElementById('ddStatScheduled') || document.getElementById('scheduledTime');

        // Modals
        this.modal = document.querySelector('.event-edit-modal');
        this.modalBackdrop = document.querySelector('.modal-backdrop');
        this.eventTitleInput = document.getElementById('eventTitle');
        this.eventTypeSelect = document.getElementById('eventType');
        this.eventStartInput = document.getElementById('eventStart');
        this.eventEndInput = document.getElementById('eventEnd');
        
        this.createModal = document.querySelector('.event-create-modal');
        this.newEventTitle = document.getElementById('newEventTitle');
        this.newEventType = document.getElementById('newEventType');
        this.newEventStart = document.getElementById('newEventStart');
        this.newEventEnd = document.getElementById('newEventEnd');
    }

    setupEventListeners() {
        this.prevButton?.addEventListener('click', () => this.navigateDate(-1));
        this.nextButton?.addEventListener('click', () => this.navigateDate(1));
        this.applyTimesButton?.addEventListener('click', () => this.render());

        this.calendarGrid?.addEventListener('mousedown', (e) => this.eventsController.startTimeBlockSelection(e));
        this.calendarGrid?.addEventListener('dblclick', (e) => this.eventsController.handleDoubleClick(e));
        document.addEventListener('mousemove', (e) => this.eventsController.handleTimeBlockSelection(e));
        document.addEventListener('mouseup', () => this.eventsController.endTimeBlockSelection());

        document.getElementById('saveEvent')?.addEventListener('click', () => this.saveEventChanges());
        document.getElementById('deleteEvent')?.addEventListener('click', () => this.deleteCurrentEvent());
        document.getElementById('createEvent')?.addEventListener('click', () => this.createNewEvent());
        
        document.querySelectorAll('.modal-close, #cancelEdit, #cancelCreate').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
    }

    navigateDate(delta) {
        this.currentDate.setDate(this.currentDate.getDate() + delta);
        this.render();
    }

    openEditModal(event) {
        this.editingEvent = event;
        this.eventTitleInput.value = event.subject || event.title;
        this.eventTypeSelect.value = event.type;
        this.eventStartInput.value = event.startTime;
        this.eventEndInput.value = event.endTime;
        this.modal.classList.add('show');
        this.modalBackdrop.classList.add('show');
    }

    openCreateModal(start, end) {
        this.newEventStart.value = start;
        this.newEventEnd.value = end;
        this.createModal.classList.add('show');
        this.modalBackdrop.classList.add('show');
    }

    closeModals() {
        this.modal?.classList.remove('show');
        this.createModal?.classList.remove('show');
        this.modalBackdrop?.classList.remove('show');
        this.editingEvent = null;
    }

    async saveEventChanges() {
        if (!this.editingEvent) return;
        const updates = {
            title: this.eventTitleInput.value,
            type: this.eventTypeSelect.value,
            startTime: this.eventStartInput.value,
            endTime: this.eventEndInput.value
        };
        const idx = this.service.events.findIndex(e => e.id === this.editingEvent.id);
        if (idx !== -1) {
            this.service.events[idx] = { ...this.service.events[idx], ...updates };
            await this.service.saveEvents();
            this.render();
        }
        this.closeModals();
    }

    async deleteCurrentEvent() {
        if (!this.editingEvent) return;
        this.service.events = this.service.events.filter(e => e.id !== this.editingEvent.id);
        await this.service.saveEvents();
        this.render();
        this.closeModals();
    }

    async createNewEvent() {
        const event = {
            id: Math.random().toString(36).substr(2, 9),
            title: this.newEventTitle.value || 'New Event',
            type: this.newEventType.value,
            startTime: this.newEventStart.value,
            endTime: this.newEventEnd.value,
            date: this.currentDate.toISOString().split('T')[0]
        };
        this.service.events.push(event);
        await this.service.saveEvents();
        this.render();
        this.closeModals();
    }

    updateEventTimes(id, start, end) {
        const idx = this.service.events.findIndex(e => e.id === id);
        if (idx !== -1) {
            this.service.events[idx].startTime = start;
            this.service.events[idx].endTime = end;
            this.service.saveEvents();
        }
    }

    pixelsToTime(px) {
        // Account for 15px top padding
        const totalMins = Math.round(px - 15);
        const hours = Math.floor(Math.max(0, totalMins) / 60);
        const mins = Math.max(0, totalMins) % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

}

document.addEventListener('DOMContentLoaded', () => {
    window.calendarManager = new CalendarManager();
    setInterval(() => window.calendarManager.renderer.updateCurrentTimeIndicator(), 60000);
});

export default CalendarManager;
