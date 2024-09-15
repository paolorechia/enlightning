/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

self.addEventListener('fetch', function() {
    return;
});
console.log("Service worker!!")