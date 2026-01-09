// ==================== SERVICE DE GÉOLOCALISATION IP ====================
// Détecte automatiquement le pays, la ville et le préfixe téléphonique

// Liste des pays avec préfixes téléphoniques
export const COUNTRY_CODES = {
    'SN': { name: 'Sénégal', prefix: '+221', flag: '🇸🇳' },
    'ML': { name: 'Mali', prefix: '+223', flag: '🇲🇱' },
    'CI': { name: 'Côte d\'Ivoire', prefix: '+225', flag: '🇨🇮' },
    'BF': { name: 'Burkina Faso', prefix: '+226', flag: '🇧🇫' },
    'NE': { name: 'Niger', prefix: '+227', flag: '🇳🇪' },
    'TG': { name: 'Togo', prefix: '+228', flag: '🇹🇬' },
    'BJ': { name: 'Bénin', prefix: '+229', flag: '🇧🇯' },
    'GN': { name: 'Guinée', prefix: '+224', flag: '🇬🇳' },
    'MR': { name: 'Mauritanie', prefix: '+222', flag: '🇲🇷' },
    'CM': { name: 'Cameroun', prefix: '+237', flag: '🇨🇲' },
    'GA': { name: 'Gabon', prefix: '+241', flag: '🇬🇦' },
    'CG': { name: 'Congo', prefix: '+242', flag: '🇨🇬' },
    'CD': { name: 'RD Congo', prefix: '+243', flag: '🇨🇩' },
    'MA': { name: 'Maroc', prefix: '+212', flag: '🇲🇦' },
    'DZ': { name: 'Algérie', prefix: '+213', flag: '🇩🇿' },
    'TN': { name: 'Tunisie', prefix: '+216', flag: '🇹🇳' },
    'FR': { name: 'France', prefix: '+33', flag: '🇫🇷' },
    'US': { name: 'États-Unis', prefix: '+1', flag: '🇺🇸' },
    'GB': { name: 'Royaume-Uni', prefix: '+44', flag: '🇬🇧' },
    'DE': { name: 'Allemagne', prefix: '+49', flag: '🇩🇪' },
    'ES': { name: 'Espagne', prefix: '+34', flag: '🇪🇸' },
    'IT': { name: 'Italie', prefix: '+39', flag: '🇮🇹' },
    'BE': { name: 'Belgique', prefix: '+32', flag: '🇧🇪' },
    'CH': { name: 'Suisse', prefix: '+41', flag: '🇨🇭' },
    'CA': { name: 'Canada', prefix: '+1', flag: '🇨🇦' }
};

// Cache pour éviter les appels répétés
let cachedLocation = null;

// URL du Cloudflare Worker (à configurer après déploiement)
// Remplacez par l'URL de votre Worker : https://majay-geolocation.workers.dev
const CLOUDFLARE_WORKER_URL = null; // null = utiliser API tierce par défaut

/**
 * Détecte la localisation de l'utilisateur via son IP
 * Priorité : Cloudflare Worker > API tierce > Fallback
 * @returns {Promise<Object>} Informations de géolocalisation
 */
export async function detectUserLocation() {
    // Vérifier le cache
    if (cachedLocation) {
        return cachedLocation;
    }

    // Vérifier le localStorage (cache persistant)
    const storedLocation = localStorage.getItem('user_location');
    if (storedLocation) {
        try {
            const location = JSON.parse(storedLocation);
            // Cache valide pendant 24h
            if (location.timestamp && Date.now() - location.timestamp < 24 * 60 * 60 * 1000) {
                cachedLocation = location;
                return location;
            }
        } catch (e) {
            console.warn('Cache de localisation invalide');
        }
    }

    // MÉTHODE 1 : Essayer Cloudflare Worker d'abord (si configuré)
    if (CLOUDFLARE_WORKER_URL) {
        try {
            console.log('🌐 Détection via Cloudflare Worker...');
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const location = await response.json();
                
                // Sauvegarder dans le cache
                cachedLocation = location;
                localStorage.setItem('user_location', JSON.stringify(location));
                
                console.log('✅ Localisation détectée via Cloudflare:', location.country);
                return location;
            }
        } catch (error) {
            console.warn('⚠️ Cloudflare Worker non disponible, fallback sur API tierce:', error.message);
        }
    }

    // MÉTHODE 2 : Fallback sur API tierce (ipapi.co)
    try {
        console.log('🌐 Détection via API tierce (ipapi.co)...');
        const response = await fetch('https://ipapi.co/json/', {
            timeout: 5000
        });

        if (!response.ok) {
            throw new Error('Erreur API de géolocalisation');
        }

        const data = await response.json();

        const location = {
            country: data.country_code || 'SN', // Défaut: Sénégal
            countryName: data.country_name || 'Sénégal',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            timezone: data.timezone || 'Africa/Dakar',
            ip: data.ip || null,
            prefix: COUNTRY_CODES[data.country_code]?.prefix || '+221',
            flag: COUNTRY_CODES[data.country_code]?.flag || '🇸🇳',
            timestamp: Date.now()
        };

        // Sauvegarder dans le cache
        cachedLocation = location;
        localStorage.setItem('user_location', JSON.stringify(location));

        console.log('✅ Localisation détectée via API tierce:', location.country);
        return location;
    } catch (error) {
        console.error('❌ Erreur détection localisation:', error);

        // Fallback: retourner Sénégal par défaut
        const fallbackLocation = {
            country: 'SN',
            countryName: 'Sénégal',
            city: 'Dakar',
            region: 'Dakar',
            latitude: 14.6937,
            longitude: -17.4441,
            timezone: 'Africa/Dakar',
            ip: null,
            prefix: '+221',
            flag: '🇸🇳',
            timestamp: Date.now(),
            fallback: true
        };

        cachedLocation = fallbackLocation;
        return fallbackLocation;
    }
}

/**
 * Alternative plus rapide avec API ipify + ip-api
 * (Pas de limite de taux mais moins précis)
 */
export async function detectLocationFast() {
    try {
        // D'abord obtenir l'IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();

        // Ensuite obtenir les détails
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,city,lat,lon,timezone`);
        const data = await geoResponse.json();

        if (data.status === 'success') {
            return {
                country: data.countryCode || 'SN',
                countryName: data.country || 'Sénégal',
                city: data.city || 'Unknown',
                region: data.region || 'Unknown',
                latitude: data.lat || null,
                longitude: data.lon || null,
                timezone: data.timezone || 'Africa/Dakar',
                ip: ip,
                prefix: COUNTRY_CODES[data.countryCode]?.prefix || '+221',
                flag: COUNTRY_CODES[data.countryCode]?.flag || '🇸🇳',
                timestamp: Date.now()
            };
        }
    } catch (error) {
        console.warn('Fallback sur détection principale');
    }

    // Fallback sur la méthode principale
    return detectUserLocation();
}

/**
 * Formater un numéro de téléphone selon le pays
 * @param {string} phone - Numéro brut
 * @param {string} countryCode - Code pays (ex: 'SN')
 * @returns {string} Numéro formaté avec préfixe
 */
export function formatPhoneWithPrefix(phone, countryCode) {
    const country = COUNTRY_CODES[countryCode];
    if (!country) return phone;

    // Nettoyer le numéro
    let cleaned = phone.replace(/\s/g, '').replace(/^0+/, '');

    // Si déjà un préfixe international, le retourner
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // Ajouter le préfixe du pays
    return country.prefix + cleaned;
}

/**
 * Obtenir la liste des pays pour un sélecteur
 * @returns {Array} Liste des pays triés par nom
 */
export function getCountriesList() {
    return Object.entries(COUNTRY_CODES)
        .map(([code, data]) => ({
            code,
            name: data.name,
            prefix: data.prefix,
            flag: data.flag
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sauvegarder la localisation dans la base de données (pour analytics)
 * @param {Object} supabase - Instance Supabase
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} location - Données de localisation
 */
export async function saveUserLocation(supabase, userId, location) {
    try {
        await supabase
            .from('users')
            .update({
                country: location.country,
                city: location.city,
                region: location.region,
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: location.timezone
            })
            .eq('id', userId);
    } catch (error) {
        console.error('Erreur sauvegarde localisation:', error);
    }
}

/**
 * Créer un sélecteur de pays HTML
 * @param {string} selectedCountry - Code pays sélectionné
 * @returns {string} HTML du sélecteur
 */
export function createCountrySelector(selectedCountry = 'SN') {
    const countries = getCountriesList();
    
    return `
        <select id="countrySelector" style="
            width: 100%;
            padding: 14px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 1em;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
        ">
            ${countries.map(country => `
                <option 
                    value="${country.code}" 
                    data-prefix="${country.prefix}"
                    ${country.code === selectedCountry ? 'selected' : ''}>
                    ${country.flag} ${country.name} (${country.prefix})
                </option>
            `).join('')}
        </select>
    `;
}

/**
 * Initialiser la détection automatique sur un formulaire
 * @param {HTMLInputElement} phoneInput - Champ téléphone
 * @param {HTMLElement} countrySelector - Sélecteur de pays (optionnel)
 */
export async function initPhoneAutoDetect(phoneInput, countrySelector = null) {
    try {
        // Détecter la localisation
        const location = await detectUserLocation();

        // Afficher le préfixe à côté du champ
        const prefix = document.createElement('div');
        prefix.id = 'phonePrefix';
        prefix.style.cssText = `
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-weight: 600;
            color: #25D366;
            pointer-events: none;
        `;
        prefix.textContent = location.prefix;

        // Positionner le champ
        phoneInput.parentElement.style.position = 'relative';
        phoneInput.style.paddingLeft = `${location.prefix.length * 12 + 20}px`;
        phoneInput.parentElement.insertBefore(prefix, phoneInput);

        // Mettre à jour le placeholder
        phoneInput.placeholder = phoneInput.placeholder.replace(/\+\d+/, location.prefix);

        // Si un sélecteur de pays est fourni, le synchroniser
        if (countrySelector) {
            countrySelector.value = location.country;
            countrySelector.addEventListener('change', (e) => {
                const selected = e.target.selectedOptions[0];
                const newPrefix = selected.dataset.prefix;
                prefix.textContent = newPrefix;
                phoneInput.style.paddingLeft = `${newPrefix.length * 12 + 20}px`;
            });
        }

        return location;
    } catch (error) {
        console.error('Erreur initialisation détection téléphone:', error);
        return null;
    }
}
