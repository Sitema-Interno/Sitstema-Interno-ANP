const CACHE_NAME = 'sistema-anp-v4';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './cadastro-alunos.html',
  './cadastro-eletivas.html',
  './frequencia-eletivas.html',
  './gestao-notas.html',
  './gestao-funcionarios.html',
  './matricula-eletivas.html',
  './registro-ocorrencias.html',
  './mapeamento-sala.html',
  './login.html',
  './manifest.json',
  './LOGO-removebg-preview.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// 1. INSTALAÇÃO: Salva os arquivos essenciais sem travar caso algum link falhe
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of URLS_TO_CACHE) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('Aviso: Não foi possível fazer cache inicial de:', url);
        }
      }
    })
  );
});

// 2. ATIVAÇÃO: Limpa automaticamente versões antigas (como a v3) dos aparelhos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPTAÇÃO (Network First): Busca atualização no GitHub se tiver internet; se estiver offline, usa o cache
self.addEventListener('fetch', event => {
  // Ignora requisições POST e chamadas para a API do Google Apps Script
  if (event.request.method !== 'GET' || event.request.url.includes("script.google.com")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(fetchResponse => {
        // Se baixou com sucesso da internet, atualiza o cache do aparelho e entrega a página nova
        if (fetchResponse && fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      })
      .catch(() => {
        // Se estiver sem internet (offline), entrega a versão salva no cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Caso tente abrir uma página que nunca foi aberta antes estando offline
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
