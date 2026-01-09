/**
 * CLOUDFLARE WORKER - Rate Limiting
 * 
 * Protection contre les abus et spam sur les inscriptions/connexions
 * Gratuit jusqu'à 100k requêtes/jour
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Récupérer l'IP du client
    const clientIP = request.headers.get('CF-Connecting-IP');
    
    // Définir les limites selon l'endpoint
    const limits = {
      '/vendeur/inscription.html': {
        maxRequests: 5,
        windowMinutes: 60,
        message: 'Trop de tentatives d\'inscription. Réessayez dans 1 heure.'
      },
      '/vendeur/connexion.html': {
        maxRequests: 10,
        windowMinutes: 15,
        message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
      },
      '/admin/connexion.html': {
        maxRequests: 5,
        windowMinutes: 30,
        message: 'Trop de tentatives de connexion admin. Réessayez dans 30 minutes.'
      }
    };

    // Vérifier si l'endpoint nécessite rate limiting
    const limit = limits[url.pathname];
    
    if (!limit) {
      // Pas de limite pour cet endpoint, laisser passer
      return fetch(request);
    }

    // Créer une clé unique pour le cache
    const key = `ratelimit:${url.pathname}:${clientIP}`;
    const now = Date.now();
    const windowMs = limit.windowMinutes * 60 * 1000;

    // Utiliser le KV storage de Cloudflare (gratuit avec Workers)
    // Note: Nécessite de créer un KV namespace
    // Pour la version gratuite, on utilise la mémoire du Worker
    
    // Simuler avec headers pour le cache edge
    const cacheUrl = new URL(request.url);
    cacheUrl.pathname = `/cache/${key}`;
    
    const cache = caches.default;
    let response = await cache.match(cacheUrl);
    
    let requests = [];
    if (response) {
      const data = await response.json();
      requests = data.requests || [];
    }

    // Nettoyer les anciennes requêtes (hors fenêtre)
    requests = requests.filter(timestamp => now - timestamp < windowMs);

    // Vérifier si la limite est atteinte
    if (requests.length >= limit.maxRequests) {
      const oldestRequest = Math.min(...requests);
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
      
      return new Response(JSON.stringify({
        error: limit.message,
        retryAfter: retryAfter,
        limit: limit.maxRequests,
        window: limit.windowMinutes
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(oldestRequest + windowMs).toISOString()
        }
      });
    }

    // Ajouter la requête actuelle
    requests.push(now);

    // Sauvegarder dans le cache
    const cacheResponse = new Response(JSON.stringify({ requests }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${limit.windowMinutes * 60}`
      }
    });
    
    ctx.waitUntil(cache.put(cacheUrl, cacheResponse));

    // Ajouter les headers de rate limit à la réponse
    const remainingRequests = limit.maxRequests - requests.length;
    
    return new Response(JSON.stringify({
      success: true,
      remaining: remainingRequests,
      limit: limit.maxRequests,
      window: limit.windowMinutes
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.maxRequests.toString(),
        'X-RateLimit-Remaining': remainingRequests.toString()
      }
    });
  }
};
