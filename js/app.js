import { supabase, getStoreSlug } from "./config.js";
import { getDemoStore, isDemoStore } from "./demo-data.js";

// ==================== VARIABLES GLOBALES ====================
let produits = [];
let panier = [];
let categorieActive = 'tous';
let storeInfo = {};
let isDemo = false;

// ==================== CHARGEMENT DES DONNÉES ====================
async function chargerProduits() {
    try {
        const slug = getStoreSlug();
        if (!slug) {
            afficherErreur("Aucune boutique spécifiée dans l'URL");
            return;
        }

        // Vérifier si c'est une boutique de démonstration
        if (isDemoStore(slug)) {
            isDemo = true;
            const demoStore = getDemoStore(slug);
            
            if (!demoStore) {
                afficherErreur("Boutique de démonstration introuvable");
                return;
            }

            storeInfo = {
                name: demoStore.name,
                whatsapp: demoStore.whatsapp,
                slug: slug
            };

            produits = demoStore.products;

            // Mettre à jour le header
            document.querySelector('.logo').textContent = `🛍️ ${demoStore.name}`;
            document.querySelector('.tagline').textContent = '✨ Boutique de démonstration - Exemples de produits';

            // Ajouter un badge de démo
            const header = document.querySelector('.header');
            const demoBadge = document.createElement('div');
            demoBadge.style.cssText = 'background: #25D366; color: white; padding: 10px 20px; text-align: center; font-weight: 700;';
            demoBadge.textContent = '🎭 Mode Démonstration - Ces produits sont des exemples';
            header.insertAdjacentElement('afterend', demoBadge);

            afficherProduits(categorieActive);
            initialiserEvenements();
            return;
        }

        // Récupérer la boutique par slug (mode normal)
        const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("*")
            .eq("slug", slug)
            .eq("is_active", true)
            .single();

        if (storeError) throw storeError;
        if (!store) {
            afficherErreur("Boutique introuvable ou inactive");
            return;
        }

        storeInfo = store;

        // Mettre à jour le header
        document.querySelector('.logo').textContent = `🛍️ ${store.name}`;
        if (store.description) {
            document.querySelector('.tagline').textContent = store.description;
        }

        // Récupérer les produits actifs
        const { data: produitsData, error: produitsError } = await supabase
            .from("products")
            .select("*")
            .eq("store_id", store.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (produitsError) throw produitsError;

        produits = produitsData || [];

        // Enregistrer un événement de vue pour analytics
        if (produits.length > 0) {
            produits.forEach(produit => {
                enregistrerClickEvent(produit.id, store.id, 'view');
            });
        }

        afficherProduits(categorieActive);
        initialiserEvenements();

    } catch (error) {
        console.error("Erreur:", error);
        afficherErreur(error.message);
    }
}

// ==================== ENREGISTREMENT CLICKS POUR ANALYTICS ====================
async function enregistrerClickEvent(productId, storeId, eventType) {
    // Ne pas enregistrer d'analytics en mode démo
    if (isDemo) return;
    
    try {
        // Récupérer la ville depuis l'IP (simplifié - en production utiliser un service)
        const customerCity = 'Unknown'; // À améliorer avec un service de géolocalisation

        await supabase.from('click_events').insert({
            product_id: productId,
            store_id: storeId,
            event_type: eventType,
            customer_city: customerCity,
            session_id: getSessionId()
        });
    } catch (error) {
        // Ignorer les erreurs d'analytics silencieusement
        console.warn('Erreur analytics:', error);
    }
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('majay_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('majay_session_id', sessionId);
    }
    return sessionId;
}

// ==================== AFFICHAGE PRODUITS ====================
function afficherProduits(categorie) {
    const grid = document.getElementById('productsGrid');
    
    const produitsFiltres = categorie === 'tous' 
        ? produits 
        : produits.filter(p => p.category === categorie);

    if (produitsFiltres.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: white;">
                <div style="font-size: 4em; margin-bottom: 20px;">📦</div>
                <h3 style="font-size: 1.5em;">Aucun produit disponible</h3>
                <p style="margin-top: 10px;">Le vendeur n'a pas encore ajouté de produits</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = produitsFiltres.map(produit => {
        // Gérer les images pour mode normal (images array) et mode démo (image_url string)
        let imageUrl;
        if (isDemo) {
            imageUrl = produit.image_url || 'https://via.placeholder.com/300';
        } else {
            imageUrl = produit.images && produit.images.length > 0 
                ? produit.images[0] 
                : 'https://via.placeholder.com/300';
        }

        const currency = produit.currency || 'FCFA';

        return `
        <div class="product-card" data-id="${produit.id}">
            <img src="${imageUrl}" 
                 alt="${produit.name}" 
                 class="product-image" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300?text=Image'">
            <div class="product-info">
                <span class="product-category">${produit.category || 'Non catégorisé'}</span>
                <h3 class="product-name">${produit.name}</h3>
                <p class="product-desc">${produit.description || ''}</p>
                <div class="product-footer">
                    <span class="product-price">${formaterPrix(produit.price)} ${currency}</span>
                    <button class="add-btn" data-id="${produit.id}">
                        <span class="btn-text">+ Ajouter</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Ajouter les événements sur les boutons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            ajouterAuPanier(id, this);
        });
    });
}

// ==================== GESTION PANIER ====================
function ajouterAuPanier(idProduit, bouton) {
    const produit = produits.find(p => p.id === idProduit);
    
    if (!produit) return;

    const itemExistant = panier.find(item => item.id === idProduit);

    if (itemExistant) {
        itemExistant.quantite += 1;
    } else {
        panier.push({
            ...produit,
            quantite: 1
        });
    }

    // Enregistrer l'événement "cart_add" (sauf en mode démo)
    if (!isDemo && storeInfo.id) {
        enregistrerClickEvent(idProduit, storeInfo.id, 'cart_add');
    }

    mettreAJourBadgePanier();
    animerBoutonAjout(bouton);
    afficherNotification('✅ Produit ajouté au panier');
}

function animerBoutonAjout(bouton) {
    const contenuOriginal = bouton.innerHTML;
    bouton.disabled = true;
    bouton.innerHTML = '<span class="btn-text">✓ Ajouté !</span>';
    bouton.classList.add('btn-success');
    
    setTimeout(() => {
        bouton.innerHTML = contenuOriginal;
        bouton.classList.remove('btn-success');
        bouton.disabled = false;
    }, 1500);
}

function retirerDuPanier(idProduit) {
    panier = panier.filter(item => item.id !== idProduit);
    mettreAJourBadgePanier();
    afficherPanier();
}

function mettreAJourBadgePanier() {
    const badge = document.getElementById('cartBadge');
    const total = panier.reduce((sum, item) => sum + item.quantite, 0);
    badge.textContent = total;
}

// ==================== AFFICHAGE MODAL PANIER ====================
function afficherPanier() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('totalAmount');
    const currency = isDemo ? 'FCFA' : (storeInfo.currency || 'XOF');

    if (panier.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p class="cart-empty-text">Votre panier est vide</p>
            </div>
        `;
        totalEl.textContent = `0 ${currency}`;
        return;
    }

    container.innerHTML = panier.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name} × ${item.quantite}</div>
                <div class="cart-item-price">${formaterPrix(parseInt(item.price) * item.quantite)} ${currency}</div>
            </div>
            <button class="remove-btn" data-id="${item.id}">✕</button>
        </div>
    `).join('');

    // Ajouter événements suppression
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            retirerDuPanier(id);
        });
    });

    const total = calculerTotal();
    totalEl.textContent = `${formaterPrix(total)} ${currency}`;
}

function calculerTotal() {
    return panier.reduce((sum, item) => sum + (parseInt(item.price) * item.quantite), 0);
}

// ==================== ENVOI WHATSAPP ====================
async function envoyerVersWhatsApp() {
    if (panier.length === 0) {
        afficherNotification('❌ Votre panier est vide !');
        return;
    }

    // MODE DÉMO : Rediriger vers l'inscription au lieu de WhatsApp
    if (isDemo) {
        const totalItems = panier.reduce((sum, item) => sum + item.quantite, 0);
        const confirmation = confirm(
            `🎭 MODE DÉMONSTRATION\n\n` +
            `Vous avez ${totalItems} article(s) dans votre panier.\n\n` +
            `Pour passer une vraie commande, vous devez créer votre compte vendeur.\n\n` +
            `Voulez-vous vous inscrire maintenant ?`
        );
        
        if (confirmation) {
            window.location.href = 'vendeur/inscription.html';
        }
        return;
    }

    let message = `🛍️ *NOUVELLE COMMANDE - ${storeInfo.name.toUpperCase()}*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    const items = [];
    
    panier.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   📦 Quantité: ${item.quantite}\n`;
        message += `   💰 Prix unitaire: ${formaterPrix(item.price)} ${item.currency || 'XOF'}\n`;
        message += `   ✅ Sous-total: ${formaterPrix(parseInt(item.price) * item.quantite)} ${item.currency || 'XOF'}\n\n`;
        
        items.push({
            product_id: item.id,
            name: item.name,
            price: parseInt(item.price),
            quantity: item.quantite
        });
    });

    const total = calculerTotal();
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💵 *TOTAL: ${formaterPrix(total)} ${storeInfo.currency || 'XOF'}*\n\n`;
    message += `Merci de confirmer ma commande ! 🙏`;

    // Enregistrer la commande dans la base de données
    try {
        // Générer un numéro de commande unique
        const orderNumber = 'CMD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

        // Créer ou récupérer le client (simplifié - en production demander les infos)
        let customerId = null;
        // Pour l'instant, on crée une commande sans customer_id
        // En production, on devrait demander le nom et téléphone du client

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                store_id: storeInfo.id,
                customer_id: customerId,
                order_number: orderNumber,
                customer_name: 'Client', // À améliorer
                customer_phone: '+221000000000', // À améliorer
                items: items,
                subtotal: total,
                delivery_fee: 0,
                total: total,
                discount_amount: 0,
                currency: storeInfo.currency || 'XOF',
                status: 'pending',
                source: 'direct' // ou 'whatsapp', 'telegram'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Erreur enregistrement commande:', orderError);
        } else {
            // Enregistrer les événements "purchase"
            items.forEach(item => {
                enregistrerClickEvent(item.product_id, storeInfo.id, 'purchase');
            });
        }
    } catch (error) {
        console.error('Erreur enregistrement commande:', error);
    }

    // Ouvrir WhatsApp
    const numeroWhatsApp = (storeInfo.whatsapp_number || '').replace(/\s/g, '').replace(/\+/g, '');
    if (!numeroWhatsApp) {
        const { showError } = await import('./notifications.js');
        showError('Numéro WhatsApp non configuré pour cette boutique');
        return;
    }

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Vider le panier après envoi
    panier = [];
    mettreAJourBadgePanier();
    afficherPanier();
}

// ==================== FILTRES ====================
function initialiserFiltres() {
    const boutons = document.querySelectorAll('.category-btn');
    
    boutons.forEach(btn => {
        btn.addEventListener('click', function() {
            boutons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            categorieActive = this.dataset.category;
            afficherProduits(categorieActive);
        });
    });
}

// ==================== MODAL ====================
function ouvrirPanier() {
    afficherPanier();
    
    // Adapter le texte du bouton selon le mode
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (isDemo) {
        whatsappBtn.innerHTML = `
            <span>🚀</span>
            <span>S'inscrire pour commander</span>
        `;
    } else {
        whatsappBtn.innerHTML = `
            <span>📲</span>
            <span>Commander sur WhatsApp</span>
        `;
    }
    
    document.getElementById('cartModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fermerPanier() {
    document.getElementById('cartModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ==================== ÉVÉNEMENTS ====================
function initialiserEvenements() {
    document.getElementById('cartBtn').addEventListener('click', ouvrirPanier);
    document.getElementById('closeBtn').addEventListener('click', fermerPanier);
    document.getElementById('modalOverlay').addEventListener('click', fermerPanier);
    document.getElementById('whatsappBtn').addEventListener('click', envoyerVersWhatsApp);
    
    initialiserFiltres();
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fermerPanier();
        }
    });
}

// ==================== UTILITAIRES ====================
function formaterPrix(prix) {
    return parseFloat(prix).toLocaleString('fr-FR');
}

function afficherNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

function afficherErreur(msg) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: white;">
            <div style="font-size: 4em; margin-bottom: 20px;">⚠️</div>
            <h3 style="font-size: 1.5em; margin-bottom: 15px;">Erreur</h3>
            <p>${msg}</p>
            <button onclick="location.reload()" style="
                margin-top: 20px;
                padding: 12px 24px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 8px;
                font-weight: 700;
                cursor: pointer;
            ">Réessayer</button>
        </div>
    `;
}

// ==================== ANIMATIONS CSS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .btn-success {
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%) !important;
    }
    .cart-empty {
        text-align: center;
        padding: 60px 20px;
        color: #718096;
    }
    .cart-empty-icon {
        font-size: 4em;
        margin-bottom: 15px;
    }
    .cart-empty-text {
        font-size: 1.2em;
    }
`;
document.head.appendChild(style);

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', chargerProduits);
