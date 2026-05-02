// Clock Display Module for Sleep Saboteurs
let is24HourFormat = false;

/**
 * Initialize the clock display functionality
 */
function initializeClockDisplay() {
    // Start the clock update interval
    setInterval(updateClock, 1000);
    updateClock();
}

/**
 * Update the clock display with current time
 */
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours for display
    if (!is24HourFormat) {
        hours = hours % 12;
        hours = hours ? hours : 12;
    }

    // Update display
    const hourEl = document.querySelector('.hour');
    const minuteEl = document.querySelector('.minute');
    const secondEl = document.querySelector('.second');
    const ampmEl = document.querySelector('.am-pm');

    if (hourEl) hourEl.textContent = hours.toString().padStart(2, '0');
    if (minuteEl) minuteEl.textContent = minutes.toString().padStart(2, '0');
    if (secondEl) secondEl.textContent = seconds.toString().padStart(2, '0');
    if (ampmEl) ampmEl.textContent = is24HourFormat ? '' : ampm;

    // Update date
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const monthEl = document.querySelector('.month');
    const dayEl = document.querySelector('.day');
    const dateEl = document.querySelector('.date');

    if (monthEl) monthEl.textContent = months[now.getMonth()];
    if (dayEl) dayEl.textContent = days[now.getDay()];
    if (dateEl) dateEl.textContent = now.getDate().toString().padStart(2, '0');
}

/**
 * Initialize the time format toggle functionality
 */
function initializeTimeFormatToggle() {
    const timeFormatToggle = document.querySelector('.time-format-toggle');
    if (!timeFormatToggle) return;
    
    timeFormatToggle.addEventListener('click', () => {
        is24HourFormat = !is24HourFormat;
        timeFormatToggle.querySelector('.format-text').textContent = is24HourFormat ? '12hr' : '24hr';
        updateClock();
    });
}

// Export functions for use in other modules
window.clockDisplay = {
    initializeClockDisplay,
    initializeTimeFormatToggle,
    updateClock
};

