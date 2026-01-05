-- ============================================================================
-- MAJAY - Système de Rôles Administrateurs
-- ============================================================================
-- Ajout des rôles admin et des permissions
-- ============================================================================

-- 1. Ajouter le type enum pour les rôles admin
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM (
        'super_admin',      -- Super administrateur (peut tout faire)
        'admin_commercial', -- Gestion des vendeurs propriétaires
        'admin_gestionnaire', -- Gestion vendeurs entreprises et boutiques
        'admin_commercial_gestionnaire', -- Rôle combiné : Commercial + Gestionnaire
        'admin_analytics',  -- Statistiques et analytics
        'admin_financial'   -- Gestion des paiements
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Si le type existe déjà, ajouter la nouvelle valeur
DO $$ BEGIN
    ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'admin_commercial_gestionnaire';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ajouter les colonnes admin à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS admin_role admin_role,
ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS can_create_admins BOOLEAN DEFAULT false;

-- 3. Mettre à jour les super admins existants
UPDATE users 
SET admin_role = 'super_admin',
    can_create_admins = true,
    admin_permissions = '{"all": true}'::jsonb
WHERE is_super_admin = true;

-- 4. Fonction pour créer un admin
CREATE OR REPLACE FUNCTION create_admin(
    p_phone VARCHAR(20),
    p_email VARCHAR(255),
    p_full_name VARCHAR(255),
    p_admin_role admin_role,
    p_password_hash VARCHAR(255),
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_creator_role admin_role;
    v_permissions JSONB;
BEGIN
    -- Vérifier que le créateur peut créer des admins
    SELECT admin_role INTO v_creator_role
    FROM users
    WHERE id = p_created_by;
    
    IF v_creator_role IS NULL OR v_creator_role != 'super_admin' THEN
        RAISE EXCEPTION 'Seul un super admin peut créer des administrateurs';
    END IF;
    
    -- Définir les permissions selon le rôle
    CASE p_admin_role
        WHEN 'super_admin' THEN
            v_permissions := '{"all": true, "create_admins": true}'::jsonb;
        WHEN 'admin_commercial' THEN
            v_permissions := '{
                "view_vendors": true,
                "edit_vendors": true,
                "activate_vendors": true,
                "deactivate_vendors": true,
                "view_stores": true
            }'::jsonb;
        WHEN 'admin_gestionnaire' THEN
            v_permissions := '{
                "view_stores": true,
                "edit_stores": true,
                "ban_stores": true,
                "restrict_products": true,
                "view_enterprise_vendors": true,
                "manage_enterprise_vendors": true
            }'::jsonb;
        WHEN 'admin_commercial_gestionnaire' THEN
            -- Rôle combiné : toutes les permissions commercial + gestionnaire
            v_permissions := '{
                "view_vendors": true,
                "edit_vendors": true,
                "activate_vendors": true,
                "deactivate_vendors": true,
                "view_stores": true,
                "edit_stores": true,
                "ban_stores": true,
                "restrict_products": true,
                "view_enterprise_vendors": true,
                "manage_enterprise_vendors": true
            }'::jsonb;
        WHEN 'admin_analytics' THEN
            v_permissions := '{
                "view_analytics": true,
                "view_stats": true,
                "export_data": true,
                "view_reports": true
            }'::jsonb;
        WHEN 'admin_financial' THEN
            v_permissions := '{
                "view_payments": true,
                "verify_payments": true,
                "view_invoices": true,
                "manage_subscriptions": true,
                "view_financial_reports": true
            }'::jsonb;
    END CASE;
    
    -- Créer l'utilisateur admin
    INSERT INTO users (
        id,
        phone,
        email,
        password_hash,
        full_name,
        role_type,
        is_super_admin,
        admin_role,
        admin_permissions,
        can_create_admins,
        created_by,
        is_active,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        p_phone,
        p_email,
        p_password_hash,
        p_full_name,
        'owner',
        (p_admin_role = 'super_admin'),
        p_admin_role,
        v_permissions,
        (p_admin_role = 'super_admin'),
        p_created_by,
        true,
        NOW()
    )
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
    p_user_id UUID,
    p_permission VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
    v_admin_role admin_role;
BEGIN
    SELECT admin_permissions, admin_role INTO v_permissions, v_admin_role
    FROM users
    WHERE id = p_user_id;
    
    IF v_admin_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Super admin a tous les droits
    IF v_admin_role = 'super_admin' THEN
        RETURN true;
    END IF;
    
    -- Vérifier la permission spécifique
    IF v_permissions->>'all' = 'true' THEN
        RETURN true;
    END IF;
    
    RETURN COALESCE((v_permissions->>p_permission)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Vue pour les admins avec leurs permissions
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.phone,
    u.email,
    u.full_name,
    u.admin_role,
    u.admin_permissions,
    u.can_create_admins,
    u.is_active,
    u.last_login,
    u.created_at,
    creator.full_name as created_by_name,
    creator.phone as created_by_phone
FROM users u
LEFT JOIN users creator ON u.created_by = creator.id
WHERE u.admin_role IS NOT NULL;

-- 7. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_admin_role ON users(admin_role);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin ON users(is_super_admin);

-- 8. RLS Policies pour les admins
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent voir les autres admins
CREATE POLICY "Admins can view other admins"
ON users FOR SELECT
TO authenticated
USING (
    admin_role IS NOT NULL OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.admin_role IS NOT NULL
    )
);

-- Policy: Seul le super admin peut créer/modifier des admins
CREATE POLICY "Super admin can manage admins"
ON users FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.admin_role = 'super_admin'
        AND u.can_create_admins = true
    )
);

