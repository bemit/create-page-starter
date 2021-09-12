var CACHE_NAME = 'cache-v2'
var OFFLINE_URL = '/offline.html'
var urlsToCache = [
    new Request(OFFLINE_URL, {cache: 'reload'}),
]

self.addEventListener('install', function(event) {
    // Perform install steps
    //console.log('sw install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                // Setting {cache: 'reload'} in the new request will ensure that the response
                // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
                return cache.addAll(urlsToCache)
            }),
    )
})

self.addEventListener('activate', function(event) {
    //console.log('sw activate');
    event.waitUntil(function() {
        // Enable navigation preload if it's supported.
        // See https://developers.google.com/web/updates/2017/02/navigation-preload
        if('navigationPreload' in self.registration) {
            return self.registration.navigationPreload.enable()
        }
    })

    // Tell the active service worker to take control of the page immediately.
    self.clients.claim()
})

self.addEventListener('fetch', function(event) {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    //console.log('sw fetch');
    if(event.request.mode === 'navigate') {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                        // Cache hit - return response
                        if(response) {
                            return response
                        }

                        return event.preloadResponse
                    },
                )
                .then(function(response) {
                    if(response) {
                        return response
                    }
                    return fetch(event.request)
                })
                .catch(function(error) {
                    // catch is only triggered if an exception is thrown, which is likely
                    // due to a network error.
                    // If fetch() returns a valid HTTP response with a response code in
                    // the 4xx or 5xx range, the catch() will NOT be called.
                    console.log('Fetch failed: ', error)
                    return caches.open(CACHE_NAME)
                        .then(function(cache) {
                            return cache.match(OFFLINE_URL)
                        })
                }),
        )
    }

    // If our if() condition is false, then this fetch handler won't intercept the
    // request. If there are any other fetch handlers registered, they will get a
    // chance to call event.respondWith(). If no fetch handlers call
    // event.respondWith(), the request will be handled by the browser as if there
    // were no service worker involvement.
})
