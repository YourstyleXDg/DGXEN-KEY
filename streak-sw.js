// DGXEN Streak Elite — push notification service worker.
// Registered by index.html (see registerStreakPush() in its script) so
// the browser can deliver "Streak {n} at risk" reminders even when this
// tab/site isn't open, and show them as a normal OS-level notification.
//
// Deliberately minimal and separate from any other service worker this
// site may already use — this file's only job is receiving a push event
// and displaying it. It doesn't cache anything, doesn't intercept fetch,
// and doesn't affect the page's normal offline/online behavior at all.

self.addEventListener('push', (event) => {
    let data = { title: 'DGXEN Streak', body: 'Your streak needs attention.' };
    try {
        if (event.data) {
            const parsed = event.data.json();
            if (parsed && (parsed.title || parsed.body)) data = parsed;
        }
    } catch (e) {
        // Payload wasn't JSON for some reason — fall back to the default
        // text above rather than showing a broken/empty notification.
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'DGXEN Streak', {
            body: data.body || '',
            icon: './assets/logo.png',
            badge: './assets/logo.png',
            tag: 'dgxen-streak-reminder',
            renotify: true
        })
    );
});

// Tapping the notification focuses an already-open tab of this site if
// one exists, otherwise opens a new one — standard pattern, doesn't
// assume any particular page.
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('./steps.html');
        })
    );
});
