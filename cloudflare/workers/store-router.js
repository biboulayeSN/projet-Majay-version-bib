/**
 * CLOUDFLARE WORKER - Routage Intelligent des Boutiques
 * 
 * Redirige majay.com/ma-boutique vers catalogue.html?shop=ma-boutique
 * Sans toucher au serveur backend !
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Liste des chemins à ignorer (fichiers statiques, admin, etc.)
    const ignorePaths = [
      '/css/', '/js/', '/images/', '/fonts/',
      '/admin/', '/vendeur/',
      '/index.html', '/catalogue.html', '/panier-demo.html',
      '/demo-shop.html', '/store-router.html',
      '/.well-known/', '/api/', '/favicon.ico'
    ];

    // Vérifier si le chemin doit être ignoré
    const shouldIgnore = ignorePaths.some(prefix => path.startsWith(prefix));
    
    if (shouldIgnore || path === '/') {
      return fetch(request);
    }

    // Extraire le slug de la boutique
    const slug = path.split('/')[1];

    // Vérifier que le slug est valide (lettres, chiffres, tirets)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return fetch(request);
    }

    // Rediriger vers le catalogue avec le slug
    const catalogueUrl = new URL('/catalogue.html', request.url);
    catalogueUrl.searchParams.set('shop', slug);

    // Utiliser 301 (permanent) pour SEO
    return Response.redirect(catalogueUrl.toString(), 301);
  }
};
