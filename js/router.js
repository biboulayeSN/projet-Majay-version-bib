/**
 * Système de routage pour MAJAY
 * Gère les URLs propres pour les boutiques et l'admin
 */

/**
 * Détecte si on est sur le sous-domaine admin
 */
export function isAdminDomain() {
    const hostname = window.location.hostname;
    return hostname.startsWith('admin.') || hostname === 'localhost' && window.location.pathname.startsWith('/admin');
}

/**
 * Détecte si on est sur une page boutique
 */
export function isStorePage() {
    const path = window.location.pathname;
    // Exclure les pages système
    const systemPages = ['/index.html', '/catalogue.html', '/test-connection.html', '/test-complet.html'];
    const isSystemPage = systemPages.some(page => path.includes(page));
    
    // Si c'est une page système, ce n'est pas une boutique
    if (isSystemPage) return false;
    
    // Si c'est juste "/" ou "/index.html", ce n'est pas une boutique
    if (path === '/' || path === '/index.html') return false;
    
    // Sinon, c'est probablement une boutique
    return true;
}

/**
 * Extrait le slug de la boutique depuis l'URL
 * Format: www.site.com/lien_boutique
 */
export function getStoreSlugFromPath() {
    const path = window.location.pathname;
    
    // Enlever le "/" initial et les extensions
    let slug = path.replace(/^\//, '').replace(/\.html$/, '');
    
    // Si c'est vide ou "index", pas de boutique
    if (!slug || slug === 'index') return null;
    
    return slug;
}

/**
 * Génère l'URL complète d'une boutique
 */
export function getStoreUrl(slug) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/${slug}`;
}

/**
 * Redirige vers une boutique
 */
export function navigateToStore(slug) {
    window.location.href = getStoreUrl(slug);
}

/**
 * Redirige vers l'admin
 */
export function navigateToAdmin(path = '') {
    const hostname = window.location.hostname;
    let adminUrl;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // En développement, utiliser /admin
        adminUrl = `/admin${path}`;
    } else {
        // En production, utiliser le sous-domaine
        const domain = hostname.replace(/^www\./, '');
        adminUrl = `https://admin.${domain}${path}`;
    }
    
    window.location.href = adminUrl;
}

/**
 * Redirige vers la page d'accueil
 */
export function navigateToHome() {
    window.location.href = '/';
}

/**
 * Redirige vers la page de connexion vendeur
 */
export function navigateToVendorLogin() {
    window.location.href = '/vendeur/connexion.html';
}

/**
 * Redirige vers la page d'inscription vendeur
 */
export function navigateToVendorSignup() {
    window.location.href = '/vendeur/inscription.html';
}

/**
 * Initialise le routage au chargement de la page
 */
export function initRouter() {
    // Si on est sur une page boutique, charger la boutique
    if (isStorePage() && !isAdminDomain()) {
        const slug = getStoreSlugFromPath();
        if (slug) {
            // Charger le catalogue avec le slug
            loadStoreCatalog(slug);
            return;
        }
    }
    
    // Si on est sur admin, rediriger vers la page admin appropriée
    if (isAdminDomain()) {
        const path = window.location.pathname;
        if (path === '/' || path === '/admin' || path === '/admin/') {
            window.location.href = '/admin/dashboard.html';
        }
    }
}

/**
 * Charge le catalogue d'une boutique
 */
async function loadStoreCatalog(slug) {
    // Importer dynamiquement le module app.js pour charger le catalogue
    const { default: initCatalog } = await import('./app.js');
    
    // Le module app.js doit être adapté pour accepter un slug en paramètre
    // Pour l'instant, on redirige vers catalogue.html avec le slug
    window.location.href = `/catalogue.html?shop=${slug}`;
}

