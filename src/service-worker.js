/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

self.addEventListener('fetch', function() {
    return;
});
console.log("Service worker!!")


self.addEventListener('push', function(event) {
    //handle background push notifications
    try {
        console.log("event", event);
        const notif = event.data.json();
        console.log("notification", notif);
        event.waitUntil(self.registration.showNotification(notif.message));
    } catch (err) {
        console.error(err);        
    }
  });