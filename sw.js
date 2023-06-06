const { channel } = require("diagnostics_channel");
const { request } = require("http");

const cacheName = 'veille-techno 2.0'
self.addEventListener('install', e => {
    console.log('install event', e);
   const cachePromise =  caches.open(cacheName).then(cache => {
        cache.addAll([
            'index.html',
            'main.js',
            'add_techno.js',
            'add_techno.html',
            'contact.html',
            'contact.js',
            'vendors/bootstrap4.min.css'
        ])
    }); 
    e.waitUntil(cachePromise);
}); 

self.addEventListener('activate', e => {
    console.log('activate e', e)
    e.waitUntil(
        caches.keys().then( cacheName => {
            return Promise.all(
                cacheName.filter( name =>{
                    name !== cacheName
                }).map(cacheName =>{
                    return caches.delete(cacheName);
                })
            )
        } )
    )
});

self.addEventListener('fetch', e => {
    if(!navigator.onLine){
        const headers = {headers: {'content-type': 'text/html:charset-utf-8'}};
        e.respondWith(new response('<h1>Pas de connexion internet</h1>', headers));
    }
    console.log("fetch event sur l'url", e.request.url);

    // strategie de cache only with network fallback
    
    /* e.respondWith(
      caches.match(e.request).then(res => {
            console.log("l'url fetchée", res)
            if(res){
                return res;
            }
            return fetch(e.request).then(newResponse => {
                console.log(`Url recuperer sur le réseau puis mis en cache ${e.request.url}`, newResponse);
                caches.open(cacheName).then(cache => cache.put(e.request, newResponse));
                return newResponse.clone();
            })
        })
    )
    */
    // strategie de network first with cache fallback. 
    e.respondWith(
        fetch(e.request).then(res => {
            caches.open(cacheName).then(cache => cache.put(e.request, res));
            return res.clone();
        }).catch(err => {
            console.log(`${e.request.url} fetchée depuis le cache`)
            return caches.match(e.request);
        })
    );

})

/*self.Registration.showNotification('notif depuis le service worker', {
    body: 'Je suis une notification dite "persistance"'
    
})
*/
self.addEventListener('push', e => {
    console.log('push event',e)
        console.log("data envoyer sur la push notification des dev tools", e.data.text());
        const title = e.data.text();
        self.registration.showNotification(title, 
            {body: 'ok pour la notification', image:'images/icons/icons-notif.png'})
    
})

self.addEventListener('sync', e => {
    if (e.tag === 'sync-technos') {
        console.log('attempting sync', e.tag);
        console.log('syncing', e.tag);
        e.waitUntil(
            getAllTechnos().then(technos => {

                console.log('got technos from sync callback', technos);

                const unsynced = technos.filter(techno => techno.unsynced);

                console.log('pending sync', unsynced);

                return Promise.all(unsynced.map(techno => {
                    console.log('Attempting fetch', techno);
                    fetch('https://nodetestapi-thyrrtzgdz.now.sh/technos', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify(techno)
                    })
                        .then(() => {
                            console.log('Sent to server');
                            console.log('id passé à putTechno', techno.id);
                            return putTechno(Object.assign({}, techno, { unsynced: false }), techno.id);
                        })
                }))
            })
        )
    }
});

self.addEventListener("fetch", e=> {
    e.respondWith(fetch(e.request))
});