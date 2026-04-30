/**
 * CalendarService.js
 * Logic for managing calendar events, time calculations, and persistence.
 * Extracted from CalendarManager (Batch 9).
 */

import { storageService } from './StorageService.js';

class CalendarService {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/timetable');
            const data = await response.json();
            if (data.success && data.data) {
                this.events = data.data;
                return this.events;
            }
        } catch (error) {
            console.error('[CalendarService] Error loading events:', error);
            // Fallback to local storage if API fails
            this.events = storageService.get('calendar_events_backup', []);
        }
        return this.events;
    }

    async saveEvents(events = null) {
        if (events) this.events = events;
        
        try {
            // Backup locally first
            storageService.set('calendar_events_backup', this.events);

            const response = await fetch('/api/save-timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: this.events })
            });
            return response.ok;
        } catch (error) {
            console.error('[CalendarService] Error saving events:', error);
            return false;
        }
    }

    getEventsForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.events.filter(e => e.date === dateStr).sort((a, b) => {
            return this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime);
        });
    }

    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours * 60) + minutes;
    }

    adjustTimeByMinutes(timeStr, mins) {
        if (!timeStr) return '00:00';
        let total = this.timeToMinutes(timeStr) + mins;
        if (total < 0) total += 24 * 60;
        if (total >= 24 * 60) total -= 24 * 60;
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    formatMinutesToTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours}h ${mins}m`;
    }

    calculateTimeDifference(startTime, endTime) {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        let diff = end - start;
        if (diff < 0) diff += 24 * 60;
        return diff;
    }

    getSleepSchedule() {
        return storageService.get('dailySchedule', {
            wakeTime: '00:00',
            sleepTime: '23:59',
            wakeBuffer: 0,
            sleepBuffer: 0
        });
    }

    calculateDailyStats(date) {
        const schedule = this.getSleepSchedule();
        const totalAvailable = this.calculateTimeDifference(schedule.wakeTime, schedule.sleepTime);
        
        const todayEvents = this.getEventsForDate(date);
        let scheduledMinutes = 0;
        todayEvents.forEach(e => {
            scheduledMinutes += this.calculateTimeDifference(e.startTime, e.endTime);
        });

        return {
            totalAvailable,
            scheduled: scheduledMinutes,
            freeStudy: Math.max(0, totalAvailable - scheduledMinutes)
        };
    }
}

const calendarService = new CalendarService();
export default calendarService;
export { calendarService, CalendarService };
