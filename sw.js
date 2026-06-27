// Service Worker for Push Notifications - מערכת סידור עבודה
const CACHE='sched-v1';

self.addEventListener('install',e=>{
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(clients.claim());
});

// Handle push events from server
self.addEventListener('push',e=>{
  if(!e.data)return;
  let data;
  try{ data=e.data.json(); }
  catch(err){ data={title:'סידור עבודה',body:e.data.text()}; }
  const opts={
    body:data.body||'',
    icon:data.icon||'/icon-192.png',
    badge:'/badge-72.png',
    tag:data.tag||'sched-notif',
    data:data.url||'/',
    dir:'rtl',
    lang:'he',
    requireInteraction:false,
    actions:[
      {action:'open',title:'פתח'},
      {action:'dismiss',title:'סגור'},
    ],
    vibrate:[200,100,200],
  };
  e.waitUntil(self.registration.showNotification(data.title||'עדכון חדש',opts));
});

// Handle notification click
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  if(e.action==='dismiss')return;
  const url=e.notification.data||'/';
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if(client.url.includes(self.location.origin)&&'focus' in client){
          client.focus();
          client.postMessage({type:'NOTIF_CLICK',url});
          return;
        }
      }
      if(clients.openWindow)return clients.openWindow(url);
    })
  );
});

// Background sync for Firebase polling
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SHOW_NOTIF'){
    const {title,body,tag}=e.data;
    self.registration.showNotification(title,{
      body,tag:tag||'sched',icon:'/icon-192.png',badge:'/badge-72.png',
      dir:'rtl',lang:'he',vibrate:[200,100,200],
    });
  }
});
