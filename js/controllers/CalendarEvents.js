/**
 * CalendarEvents.js
 * Controller for handling calendar interactions: drag-and-drop, resizing, 
 * time block selection, and event creation flow.
 * Extracted from CalendarManager (Batch 17).
 */

class CalendarEvents {
    constructor(manager) {
        this.manager = manager;
        this.service = manager.service;
        this.isSelecting = false;
        this.selectionStart = 0;
    }

    setupEventBlockInteraction(block, event) {
        let isDragging = false;
        let isResizing = false;
        let startY = 0;
        let startTop = 0;
        let startHeight = 0;
        let resizeHandle = null;

        block.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskTitle = document.getElementById('taskTitle');
            if (taskTitle) {
                const eventTitle = block.querySelector('.task-title')?.textContent;
                taskTitle.textContent = eventTitle || 'No Task Selected';
            }
        });

        block.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.manager.openEditModal(event);
        });

        block.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) {
                isResizing = true;
                resizeHandle = e.target;
                startY = e.clientY;
                startTop = parseInt(block.style.top);
                startHeight = parseInt(block.style.height);
            } else {
                isDragging = true;
                startY = e.clientY;
                startTop = parseInt(block.style.top);
            }
            block.style.zIndex = '1000';
        });

        const onMouseMove = (e) => {
            if (!isDragging && !isResizing) return;

            const rawDeltaY = e.clientY - startY;
            // Snap to 15px (15-min) increments
            const deltaY = Math.round(rawDeltaY / 15) * 15;

            if (isResizing) {
                if (resizeHandle.classList.contains('top')) {
                    const newTop = startTop + deltaY;
                    const newHeight = startHeight - deltaY;
                    if (newHeight >= 15) {
                        block.style.top = `${newTop}px`;
                        block.style.height = `${newHeight}px`;
                    }
                } else {
                    const newHeight = startHeight + deltaY;
                    if (newHeight >= 15) {
                        block.style.height = `${newHeight}px`;
                    }
                }
            } else if (isDragging) {
                const newTop = startTop + deltaY;
                if (newTop >= 0 && newTop <= this.manager.calendarGrid.clientHeight - parseInt(block.style.height)) {
                    block.style.top = `${newTop}px`;
                }
            }
        };

        const onMouseUp = () => {
            if (isDragging || isResizing) {
                isDragging = false;
                isResizing = false;
                block.style.zIndex = '1';

                const eventId = block.dataset.eventId;
                const newStartTime = this.manager.pixelsToTime(parseInt(block.style.top));
                const newEndTime = this.manager.pixelsToTime(parseInt(block.style.top) + parseInt(block.style.height));

                this.manager.updateEventTimes(eventId, newStartTime, newEndTime);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    startTimeBlockSelection(e) {
        if (e.target.classList.contains('grid-slot') || e.target.classList.contains('calendar-grid')) {
            this.isSelecting = true;
            const rect = this.manager.calendarGrid.getBoundingClientRect();
            this.selectionStart = e.clientY - rect.top;
        }
    }

    handleTimeBlockSelection(e) {
        if (!this.isSelecting) return;

        const rect = this.manager.calendarGrid.getBoundingClientRect();
        let currentY = e.clientY - rect.top;
        currentY = Math.max(0, Math.min(currentY, rect.height));

        // Snap to 15px slots
        const snappedStart = Math.floor(this.selectionStart / 15) * 15;
        const snappedCurrent = Math.round(currentY / 15) * 15;

        document.querySelectorAll('.selection-preview').forEach(el => el.remove());

        const block = document.createElement('div');
        block.className = 'task-block creating selection-preview';

        const top = Math.min(snappedStart, snappedCurrent);
        const height = Math.max(15, Math.abs(snappedCurrent - snappedStart));

        Object.assign(block.style, {
            position: 'absolute',
            top: `${top}px`,
            height: `${height}px`,
            width: 'calc(100% - 10px)',
            left: '5px',
            zIndex: '10'
        });

        this.manager.calendarGrid.appendChild(block);
    }

    endTimeBlockSelection() {
        if (!this.isSelecting) return;
        this.isSelecting = false;

        const preview = document.querySelector('.selection-preview');
        if (preview) {
            const startTime = this.manager.pixelsToTime(parseInt(preview.style.top));
            const endTime = this.manager.pixelsToTime(parseInt(preview.style.top) + parseInt(preview.style.height));
            preview.remove();
            
            this.manager.openCreateModal(startTime, endTime);
        }
    }

    handleDoubleClick(e) {
        if (e.target.classList.contains('grid-slot') || e.target.classList.contains('calendar-grid')) {
            const rect = this.manager.calendarGrid.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const snappedY = Math.floor(y / 15) * 15;
            
            const startTime = this.manager.pixelsToTime(snappedY);
            const endTime = this.manager.pixelsToTime(snappedY + 60); // Default 1 hour
            
            this.manager.openCreateModal(startTime, endTime);
        }
    }
}

export default CalendarEvents;
