import { supabase } from "./config.js";

// ================= CONNEXION ADMIN =================

/**
 * Hasher un mot de passe avec SHA-256
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Connexion admin avec numéro de téléphone et mot de passe
 */
async function connexionAdmin(telephone, password) {
  try {
    // Nettoyer le numéro
    let phone = telephone.replace(/\s/g, '');
    // Ajouter +221 si le numéro commence par 7
    if (phone.startsWith('7')) {
      phone = '+221' + phone;
    } else if (!phone.startsWith('+')) {
      phone = '+221' + phone;
    }

    if (!password || password.length === 0) {
      throw new Error('Le mot de passe est requis');
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // Vérifier les identifiants dans la table users (doit avoir un rôle admin)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, phone, email, full_name, is_super_admin, admin_role, admin_permissions, can_create_admins, password_hash')
      .eq('phone', phone)
      .not('admin_role', 'is', null) // Doit avoir un rôle admin
      .maybeSingle();

    if (userError) {
      throw new Error('Erreur lors de la vérification: ' + userError.message);
    }

    if (!userData) {
      throw new Error('Numéro de téléphone ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    if (userData.password_hash !== passwordHash) {
      throw new Error('Numéro de téléphone ou mot de passe incorrect');
    }

    // Mettre à jour la date de dernière connexion
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    const sessionData = {
      user_id: userData.id,
      phone: userData.phone,
      email: userData.email,
      nom: userData.full_name || 'Admin',
      is_super_admin: userData.is_super_admin || false,
      admin_role: userData.admin_role || null,
      admin_permissions: userData.admin_permissions || {},
      can_create_admins: userData.can_create_admins || false,
      timestamp: Date.now()
    };

    sauvegarderSessionAdmin(sessionData);

    return { success: true, data: sessionData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ================= SESSION ADMIN =================

function sauvegarderSessionAdmin(admin) {
  localStorage.setItem("majay_admin", JSON.stringify(admin));
}

function getSessionAdmin() {
  const s = localStorage.getItem("majay_admin");
  if (!s) return null;
  
  try {
    const data = JSON.parse(s);
    // Vérifier expiration (7 jours)
    const age = Date.now() - (data.timestamp || 0);
    if (age > 7 * 24 * 60 * 60 * 1000) {
      deconnexionAdmin();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function deconnexionAdmin() {
  localStorage.removeItem("majay_admin");
  sessionStorage.removeItem('majay_admin_connexion_phone');
  supabase.auth.signOut();
  window.location.href = "connexion.html";
}

// ================= VÉRIFICATION AUTH =================

function verifierAuthAdmin() {
  const session = getSessionAdmin();
  
  if (!session) {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'connexion.html' && currentPage !== 'index.html') {
      window.location.href = 'connexion.html';
    }
    return null;
  }
  
  // Vérifier que l'utilisateur a toujours un rôle admin
  if (!session.admin_role) {
    deconnexionAdmin();
    return null;
  }
  
  return session;
}

// ================= ACTIONS ADMIN =================

/**
 * Activer/désactiver une boutique
 */
async function toggleStore(storeId, isActive) {
  const { data, error } = await supabase
    .from('stores')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', storeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Changer le plan d'une boutique
 */
async function changerPlan(storeId, plan) {
  // Vérifier que le plan existe
  const { data: planData, error: planError } = await supabase
    .from('plans')
    .select('name')
    .eq('name', plan)
    .maybeSingle(); // Utiliser maybeSingle() pour gérer le cas où le plan n'existe pas

  if (planError) {
    throw new Error('Erreur lors de la vérification du plan: ' + planError.message);
  }

  if (!planData) {
    throw new Error('Plan invalide ou introuvable');
  }

  const { data, error } = await supabase
    .from('stores')
    .update({ 
      subscription_plan: plan,
      updated_at: new Date().toISOString()
    })
    .eq('id', storeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Supprimer une boutique (soft delete)
 */
async function supprimerStore(storeId) {
  const { data, error } = await supabase
    .from('stores')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', storeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Obtenir les statistiques admin
 */
async function getStatsAdmin() {
  try {
    // Total stores
    const { count: totalStores } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true });

    // Stores actifs
    const { count: storesActifs } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Stores par plan
    const { data: storesByPlan } = await supabase
      .from('stores')
      .select('subscription_plan')
      .eq('is_active', true);

    const vendeursFree = storesByPlan?.filter(s => s.subscription_plan === 'free').length || 0;
    const vendeursPro = storesByPlan?.filter(s => s.subscription_plan === 'pro').length || 0;
    const vendeursEntreprise = storesByPlan?.filter(s => s.subscription_plan === 'entreprise').length || 0;

    // Total produits
    const { count: totalProduits } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Total commandes
    const { count: totalCommandes } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Volume total des ventes
    const { data: orders } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'delivered');

    const volumeVentesTotal = orders?.reduce((sum, o) => sum + (parseInt(o.total) || 0), 0) || 0;

    return {
      total_vendeurs: totalStores || 0,
      vendeurs_actifs: storesActifs || 0,
      vendeurs_inactifs: (totalStores || 0) - (storesActifs || 0),
      vendeurs_free: vendeursFree,
      vendeurs_pro: vendeursPro,
      vendeurs_entreprise: vendeursEntreprise,
      total_produits: totalProduits || 0,
      total_commandes: totalCommandes || 0,
      volume_ventes_total: volumeVentesTotal
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtenir la liste des boutiques
 */
async function getStores(filters = {}) {
  let query = supabase
    .from('stores')
    .select(`
      id,
      name,
      slug,
      subscription_plan,
      is_active,
      total_orders,
      total_revenue,
      created_at,
      owner:users!stores_owner_id_fkey (
        id,
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  if (filters.plan) {
    query = query.eq('subscription_plan', filters.plan);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// ================= EXPORT =================

export const adminAuth = {
  connexionAdmin,
  getSessionAdmin,
  deconnexionAdmin,
  verifierAuthAdmin,
  toggleStore,
  changerPlan,
  supprimerStore,
  getStatsAdmin,
  getStores
};
