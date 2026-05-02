/**
 * timerWorker.js
 * A Web Worker that provides a constant heartbeat for the timer and real-time clock.
 * Browsers are less likely to throttle a worker, ensuring the tab title updates reliably.
 */

// Start ticking immediately
let timerId = setInterval(() => {
    self.postMessage({ type: 'tick' });
}, 1000);

self.onmessage = function(e) {
    const { action } = e.data;

    // Reset ticker on start to ensure immediate feedback
    if (action === 'start') {
        if (timerId) clearInterval(timerId);
        self.postMessage({ type: 'tick' }); // Send immediate tick
        timerId = setInterval(() => {
            self.postMessage({ type: 'tick' });
        }, 1000);
    }
    // We don't stop the ticker anymore because the main thread uses it for the clock
};
