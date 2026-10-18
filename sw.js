const CACHE_NAME = 'sistema-anp-v2';

// Todos os ficheiros e bibliotecas (como o SweetAlert2) que o telemóvel deve guardar offline
const URLS_TO_CACHE = [
  './',
  './index.html',
  './cadastro-alunos.html',
  './cadastro-eletivas.html',
  './frequencia-eletivas.html',
  './gestao-notas.html',
  './matricula-eletivas.html',
  './LOGO-removebg-preview.png',
  './login.html',
  
  // As bibliotecas essenciais de visual e alertas bonitos:
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
];

// Quando o sistema instala no celular, ele força o download de tudo listado acima
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Estratégia de Rede: Primeiro verifica se está no cache; se não, tenta a internet.
self.addEventListener('fetch', event => {
  // Ignora chamadas para a API do Google Script (ela tem a própria lógica offline)
  if (event.request.url.includes("script.google.com")) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna a memória offline caso exista
      if (response) {
        return response;
      }
      return fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});

// Limpa qualquer cache muito antigo para garantir que está a usar as atualizações mais recentes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});