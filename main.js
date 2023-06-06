console.log('hello depuis main');
const technosDiv = document.querySelector('#technos');

function loadTechnologies() {
    fetch('http://localhost:3001/technos')
        .then(response => {
            response.json()
                .then(technos => {
                    const allTechnos = technos.map(t => `<div><b>${t.name}</b> ${t.description}  <a href="${t.url}">site de ${t.name}</a> </div>`)
                        .join('');

                    technosDiv.innerHTML = allTechnos;
                });
        })
        .catch(console.error);
}

loadTechnologies(technos);

if(navigator.serviceWorker){
    navigator.serviceWorker.register('sw.js')
                           .then(registration => {
                               // publicVapid Key generate with wep-push
                               const publicKey = "BOoIBgXxuDUIj_kMcUb-Aq0-mj7flJ6yFThL4XAc68udsP8WiYyBe1z-jfVCsbxiFLF8jTDHqRUA_l6sh35DZ8g"
                               registration  .pushManager.getSubscription().then(subscription => {
                                   if(subscription){
                                       console.log('subscription', subscription)
                                       // no more keys proprety directly visible on the subscription objet. So you have to use getKey()
                                        const keyArrayBuffer = subscription.getKey('p256dh');
                                        const authArrayBuffer = subscription.getKey('auth');
                                        const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(keyArrayBuffer)));
                                        const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(authArrayBuffer)));
                                        console.log('p256dh key', keyArrayBuffer, p256dh);
                                        console.log('auth key', authArrayBuffer, auth);
                    return subscription;
                                   }else{
                                       // as for a subscription
                                       const convertKey = urlBase64ToUint8Array(publicKey);
                                       return registration.pushManager.subscribe({
                                           userVisibleOnly:true,
                                           applicationServerKey:convertKey
                                       })
                                       .then(newSubscription => {
                                           console.log("new subscription", newSubscription)
                                       })
                                   }
                               })

                           })
}

/*if(window.Notification && window.Notification !== 'denied'){
    Notification.requestPermission(perm => {
        if(perm === 'granted'){
            const notif = new Notification('Hello notification');
        }else{
            console.log("l'autorisation à recevoir des notification à été refusé")
        }
    })
}
*/
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}