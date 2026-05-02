/**
 * RedirectController.js
 * Handles intelligent landing page redirection
 */

class RedirectController {
    static init() {
        if ('caches' in window) {
            caches.match('landing.html').then(response => {
                if (response) {
                    window.location.href = 'landing.html';
                } else {
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = 'landing.html';
                    document.head.appendChild(prefetchLink);
                    setTimeout(() => {
                        window.location.href = 'landing.html';
                    }, 100);
                }
            });
        } else {
            window.location.href = 'landing.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => // RedirectController.init());
