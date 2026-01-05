import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/**
 * CONFIG SUPABASE
 * 
 * 🔒 SÉCURITÉ :
 * - Cette clé "anon" est PUBLIQUE par design (fait pour être dans le frontend)
 * - Elle est PROTÉGÉE par RLS (Row Level Security) activé dans le schéma SQL
 * - Chaque utilisateur ne peut accéder qu'à SES propres données
 * - Même si quelqu'un vole cette clé, il ne peut pas accéder aux données des autres
 * 
 * ⚠️ IMPORTANT :
 * - La clé "service_role" (dans .env.local) ne doit JAMAIS être ici
 * - La clé service_role est uniquement pour le backend
 */
export const supabase = createClient(
  "https://ptscvapqhsctosjpdbkr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0c2N2YXBxaHNjdG9zanBkYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTk5MDEsImV4cCI6MjA4Mjc3NTkwMX0.EESazxd1Q0KfZtRzWndrV28jzybn6-UcUBpX3SfimGM"
);

/**
 * Slug de la boutique depuis l'URL
 * Supporte deux formats :
 * 1. www.site.com/lien_boutique (nouveau format)
 * 2. catalogue.html?shop=demo-shop (ancien format pour compatibilité)
 * Retourne le slug de la boutique ou null si non trouvé
 */
export function getStoreSlug() {
    // Essayer d'abord le nouveau format (depuis le path)
    const path = window.location.pathname;
    const systemPages = ['/index.html', '/catalogue.html', '/test-connection.html', '/test-complet.html'];
    const isSystemPage = systemPages.some(page => path.includes(page));
    
    if (!isSystemPage && path !== '/' && path !== '/index.html') {
        // Extraire le slug depuis le path
        let slug = path.replace(/^\//, '').replace(/\.html$/, '');
        if (slug && slug !== 'index') {
            return slug;
        }
    }
    
    // Fallback sur l'ancien format (query parameter)
    const params = new URLSearchParams(window.location.search);
    return params.get("shop");
}

/**
 * @deprecated Utiliser getStoreSlug() à la place
 * Slug vendeur depuis l'URL (compatibilité)
 */
export function getVendeurSlug() {
  return getStoreSlug();
}

/**
 * Numéro WhatsApp ADMIN
 * (pour upgrade plan)
 */
export const ADMIN_PHONE = "+221771234567";
