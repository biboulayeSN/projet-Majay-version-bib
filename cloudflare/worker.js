/**
 * CLOUDFLARE WORKER - Détection de géolocalisation par IP
 * 
 * Ce Worker est déployé sur Cloudflare Edge (gratuit jusqu'à 100k requêtes/jour)
 * Il lit les headers de géolocalisation fournis automatiquement par Cloudflare
 * 
 * URL du Worker une fois déployé : https://geo.votre-domaine.com/location
 * ou : https://votre-worker.workers.dev/location
 */

export default {
  async fetch(request, env, ctx) {
    // Gérer les CORS pour permettre les requêtes depuis votre site
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // À restreindre à votre domaine en production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Gérer les requêtes OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Cloudflare fournit automatiquement ces informations via request.cf
      // Documentation: https://developers.cloudflare.com/workers/runtime-apis/request#incomingrequestcfproperties
      
      const cf = request.cf;
      
      // Extraire les informations de géolocalisation
      const location = {
        // Pays (code ISO 3166-1 alpha-2)
        country: cf?.country || 'SN',
        
        // Ville
        city: cf?.city || 'Unknown',
        
        // Région/État
        region: cf?.region || 'Unknown',
        
        // Code région
        regionCode: cf?.regionCode || '',
        
        // Coordonnées GPS
        latitude: cf?.latitude || null,
        longitude: cf?.longitude || null,
        
        // Fuseau horaire
        timezone: cf?.timezone || 'Africa/Dakar',
        
        // Code postal (si disponible)
        postalCode: cf?.postalCode || '',
        
        // Continent
        continent: cf?.continent || 'AF',
        
        // ASN (Autonomous System Number)
        asn: cf?.asn || null,
        
        // IP du client (depuis les headers Cloudflare)
        ip: request.headers.get('CF-Connecting-IP') || 
            request.headers.get('X-Forwarded-For')?.split(',')[0] || 
            null,
        
        // User Agent
        userAgent: request.headers.get('User-Agent') || '',
        
        // Timestamp
        timestamp: Date.now(),
        
        // Source
        source: 'cloudflare'
      };

      // Ajouter le préfixe téléphonique selon le pays
      const countryPrefixes = {
        'SN': '+221', 'ML': '+223', 'CI': '+225', 'BF': '+226',
        'NE': '+227', 'TG': '+228', 'BJ': '+229', 'GN': '+224',
        'MR': '+222', 'CM': '+237', 'GA': '+241', 'CG': '+242',
        'CD': '+243', 'MA': '+212', 'DZ': '+213', 'TN': '+216',
        'FR': '+33', 'US': '+1', 'GB': '+44', 'DE': '+49',
        'ES': '+34', 'IT': '+39', 'BE': '+32', 'CH': '+41',
        'CA': '+1'
      };

      location.prefix = countryPrefixes[location.country] || '+221';

      // Ajouter les drapeaux emoji
      const countryFlags = {
        'SN': '🇸🇳', 'ML': '🇲🇱', 'CI': '🇨🇮', 'BF': '🇧🇫',
        'NE': '🇳🇪', 'TG': '🇹🇬', 'BJ': '🇧🇯', 'GN': '🇬🇳',
        'MR': '🇲🇷', 'CM': '🇨🇲', 'GA': '🇬🇦', 'CG': '🇨🇬',
        'CD': '🇨🇩', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳',
        'FR': '🇫🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪',
        'ES': '🇪🇸', 'IT': '🇮🇹', 'BE': '🇧🇪', 'CH': '🇨🇭',
        'CA': '🇨🇦'
      };

      location.flag = countryFlags[location.country] || '🌍';

      // Noms des pays
      const countryNames = {
        'SN': 'Sénégal', 'ML': 'Mali', 'CI': 'Côte d\'Ivoire',
        'BF': 'Burkina Faso', 'NE': 'Niger', 'TG': 'Togo',
        'BJ': 'Bénin', 'GN': 'Guinée', 'MR': 'Mauritanie',
        'CM': 'Cameroun', 'GA': 'Gabon', 'CG': 'Congo',
        'CD': 'RD Congo', 'MA': 'Maroc', 'DZ': 'Algérie',
        'TN': 'Tunisie', 'FR': 'France', 'US': 'États-Unis',
        'GB': 'Royaume-Uni', 'DE': 'Allemagne', 'ES': 'Espagne',
        'IT': 'Italie', 'BE': 'Belgique', 'CH': 'Suisse',
        'CA': 'Canada'
      };

      location.countryName = countryNames[location.country] || location.country;

      // Retourner la réponse JSON
      return new Response(JSON.stringify(location, null, 2), {
        status: 200,
        headers: corsHeaders,
      });

    } catch (error) {
      // En cas d'erreur, retourner un fallback (Sénégal)
      const fallback = {
        country: 'SN',
        countryName: 'Sénégal',
        city: 'Dakar',
        region: 'Dakar',
        latitude: 14.6937,
        longitude: -17.4441,
        timezone: 'Africa/Dakar',
        prefix: '+221',
        flag: '🇸🇳',
        ip: null,
        timestamp: Date.now(),
        source: 'cloudflare-fallback',
        error: error.message
      };

      return new Response(JSON.stringify(fallback, null, 2), {
        status: 200,
        headers: corsHeaders,
      });
    }
  }
};
