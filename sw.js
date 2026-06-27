// Service Worker - מערכת סידור עבודה
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

self.addEventListener('push', e => {
  if(!e.data) return;
  let data;
  try{ data = e.data.json(); } catch(err){ data = {title:'סידור עבודה', body: e.data.text()}; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'עדכון חדש', {
      body: data.body || '',
      icon: data.icon || '',
      tag: data.tag || 'sched-notif',
      dir: 'rtl',
      lang: 'he',
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

self.addEventListener('message', e => {
  if(!e.data || e.data.type !== 'SHOW_NOTIF') return;
  const {title, body, tag} = e.data;
  e.waitUntil(
    self.registration.showNotification(title || 'עדכון', {
      body: body || '',
      tag: tag || 'sched',
      dir: 'rtl',
      lang: 'he',
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for(const c of list){
        if('focus' in c) return c.focus();
      }
      if(clients.openWindow) return clients.openWindow('./');
    })
  );
});
