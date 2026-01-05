import { supabase } from "./config.js";

// ================= AUTHENTIFICATION SUPABASE PHONE =================

/**
 * Envoyer le code OTP par SMS
 */
async function envoyerOTP(telephone) {
  try {
    // Nettoyer le numéro (enlever espaces, garder +)
    const phone = telephone.replace(/\s/g, '').replace(/^0/, '+221');
    if (!phone.startsWith('+')) {
      throw new Error('Le numéro doit commencer par + (ex: +221771234567)');
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        channel: 'sms'
      }
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Vérifier le code OTP et connecter l'utilisateur
 */
async function verifierOTP(telephone, code) {
  try {
    const phone = telephone.replace(/\s/g, '').replace(/^0/, '+221');
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms'
    });

    if (error) throw error;

    // Récupérer l'utilisateur et sa boutique
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        phone,
        email,
        full_name,
        role_type,
        stores!inner (
          id,
          name,
          slug,
          subscription_plan,
          whatsapp_number,
          is_active
        )
      `)
      .eq('id', data.user.id)
      .eq('stores.is_active', true)
      .limit(1)
      .single();

    if (userError) throw userError;

    if (!userData.stores || userData.stores.length === 0) {
      throw new Error('Aucune boutique active trouvée pour ce compte');
    }

    const store = Array.isArray(userData.stores) ? userData.stores[0] : userData.stores;

    const sessionData = {
      user_id: userData.id,
      store_id: store.id,
      phone: userData.phone,
      email: userData.email,
      full_name: userData.full_name || store.name,
      store_name: store.name,
      store_slug: store.slug,
      subscription_plan: store.subscription_plan,
      whatsapp_number: store.whatsapp_number,
      role_type: userData.role_type,
      timestamp: Date.now()
    };

    sauvegarderSession(sessionData);
    return { success: true, data: sessionData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ================= INSCRIPTION =================

/**
 * Inscrire un nouveau vendeur avec création de boutique
 */
async function inscrireVendeur(data) {
  try {
    const { nom, slug, telephone, whatsapp, full_name } = data;

    // Nettoyer le numéro
    const phone = telephone.replace(/\s/g, '').replace(/^0/, '+221');
    if (!phone.startsWith('+')) {
      throw new Error('Le numéro doit commencer par + (ex: +221771234567)');
    }

    // Vérifier que le slug est valide
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets');
    }

    // Vérifier que le slug n'existe pas déjà
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingStore) {
      throw new Error('Ce nom de boutique est déjà pris. Choisissez-en un autre.');
    }

    // Envoyer OTP pour créer le compte
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        channel: 'sms',
        data: {
          full_name: full_name || nom,
          store_name: nom,
          store_slug: slug,
          whatsapp_number: whatsapp || phone
        }
      }
    });

    if (otpError) throw otpError;

    // Stocker temporairement les données d'inscription
    sessionStorage.setItem('majay_inscription_temp', JSON.stringify({
      nom,
      slug,
      telephone: phone,
      whatsapp: whatsapp || phone,
      full_name: full_name || nom
    }));

    return { 
      success: true, 
      message: 'Code de vérification envoyé par SMS',
      phone: phone
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Finaliser l'inscription après vérification OTP
 */
async function finaliserInscription(telephone, code) {
  try {
    const phone = telephone.replace(/\s/g, '').replace(/^0/, '+221');
    
    // Vérifier le code OTP
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms'
    });

    if (authError) throw authError;

    // Récupérer les données temporaires
    const tempData = JSON.parse(sessionStorage.getItem('majay_inscription_temp') || '{}');
    
    if (!tempData.nom) {
      throw new Error('Données d\'inscription introuvables. Veuillez recommencer.');
    }

    // Créer l'utilisateur et la boutique via la fonction RPC
    const { data: result, error: rpcError } = await supabase.rpc('create_user_and_store', {
      p_auth_user_id: authData.user.id,
      p_phone: phone,
      p_full_name: tempData.full_name || tempData.nom,
      p_store_name: tempData.nom,
      p_store_slug: tempData.slug,
      p_whatsapp_number: tempData.whatsapp || phone
    });

    if (rpcError) throw rpcError;

    // Nettoyer les données temporaires
    sessionStorage.removeItem('majay_inscription_temp');

    // Récupérer les données complètes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        phone,
        full_name,
        stores!inner (
          id,
          name,
          slug,
          subscription_plan,
          whatsapp_number
        )
      `)
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    const store = Array.isArray(userData.stores) ? userData.stores[0] : userData.stores;

    const sessionData = {
      user_id: userData.id,
      store_id: store.id,
      phone: userData.phone,
      full_name: userData.full_name || store.name,
      store_name: store.name,
      store_slug: store.slug,
      subscription_plan: store.subscription_plan,
      whatsapp_number: store.whatsapp_number,
      role_type: 'owner',
      timestamp: Date.now()
    };

    sauvegarderSession(sessionData);
    return { success: true, data: sessionData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ================= CONNEXION =================

/**
 * Connexion d'un vendeur existant (envoie OTP)
 * IMPORTANT: L'utilisateur doit être préalablement inscrit
 */
async function connexionVendeur(telephone) {
  try {
    const phone = telephone.replace(/\s/g, '').replace(/^0/, '+221');
    
    // Vérifier que l'utilisateur existe dans la table users
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('phone', phone)
      .single();

    if (userError || !existingUser) {
      return { 
        success: false, 
        error: 'Aucun compte trouvé avec ce numéro. Veuillez vous inscrire d\'abord.',
        needsSignup: true
      };
    }

    // Vérifier que l'utilisateur a au moins une boutique active
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', existingUser.id)
      .eq('is_active', true)
      .limit(1);

    if (storesError || !stores || stores.length === 0) {
      return { 
        success: false, 
        error: 'Aucune boutique active trouvée. Veuillez vous inscrire pour créer une boutique.',
        needsSignup: true
      };
    }
    
    // Envoyer OTP
    const result = await envoyerOTP(phone);
    if (!result.success) {
      return result;
    }

    // Stocker le numéro pour la vérification
    sessionStorage.setItem('majay_connexion_phone', phone);
    
    return { 
      success: true, 
      message: 'Code de vérification envoyé par SMS',
      phone: phone
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Vérifier le code OTP et connecter
 */
async function verifierConnexion(code) {
  try {
    const phone = sessionStorage.getItem('majay_connexion_phone');
    if (!phone) {
      throw new Error('Session de connexion expirée. Veuillez recommencer.');
    }

    const result = await verifierOTP(phone, code);
    if (result.success) {
      sessionStorage.removeItem('majay_connexion_phone');
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ================= SESSION =================

function sauvegarderSession(session) {
  localStorage.setItem("majay_session", JSON.stringify(session));
}

function getSession() {
  const s = localStorage.getItem("majay_session");
  if (!s) return null;
  
  try {
    const data = JSON.parse(s);
    // Vérifier expiration (30 jours)
    const age = Date.now() - (data.timestamp || 0);
    if (age > 30 * 24 * 60 * 60 * 1000) {
      deconnexion();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function deconnexion() {
  localStorage.removeItem("majay_session");
  sessionStorage.removeItem('majay_inscription_temp');
  sessionStorage.removeItem('majay_connexion_phone');
  supabase.auth.signOut();
  window.location.href = "connexion.html";
}

// ================= COMPATIBILITÉ ANCIEN CODE =================

/**
 * @deprecated Utiliser connexionVendeur() puis verifierConnexion()
 * Fonction de compatibilité pour l'ancien code
 */
async function connexionVendeurAncien(telephone) {
  // Pour compatibilité, on envoie juste l'OTP
  return await connexionVendeur(telephone);
}

export const authMajay = {
  // Nouvelles fonctions
  envoyerOTP,
  verifierOTP,
  inscrireVendeur,
  finaliserInscription,
  connexionVendeur,
  verifierConnexion,
  getSession,
  deconnexion,
  sauvegarderSession,
  // Compatibilité
  connexionVendeurAncien
};
