-- ============================================================================
-- MAJAY - SCHEMA SUPABASE COMPLET (CONSOLIDÉ)
-- ============================================================================
-- Version: 2.0
-- Date: Janvier 2025
-- Description: Schema complet avec tous les fixes et fonctions
-- 
-- INSTRUCTIONS D'EXÉCUTION:
-- 1. Créer un nouveau projet Supabase
-- 2. Aller dans SQL Editor → New Query
-- 3. Copier TOUT le contenu de ce fichier
-- 4. Exécuter (Run)
-- 5. Vérifier qu'il n'y a pas d'erreurs
-- ============================================================================

-- ============================================================================
-- PARTIE 1: ENUM TYPES
-- ============================================================================

CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'entreprise');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE sales_channel AS ENUM ('whatsapp', 'telegram', 'direct');
CREATE TYPE customer_segment AS ENUM ('champion', 'loyal', 'potential', 'at_risk', 'lost', 'new');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'overdue', 'refunded');
CREATE TYPE role_type AS ENUM ('owner', 'manager', 'agent', 'accountant');

-- ============================================================================
-- PARTIE 2: TABLES CORE
-- ============================================================================

-- 2.1 PLANS (Définition des abonnements)
CREATE TABLE plans (
  id BIGSERIAL PRIMARY KEY,
  name subscription_plan NOT NULL UNIQUE,
  annual_price BIGINT NOT NULL,
  max_products INT NOT NULL,
  max_stores INT NOT NULL DEFAULT 1,
  max_photos_per_product INT NOT NULL DEFAULT 3,
  max_team_members INT NOT NULL DEFAULT 1,
  features JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plans (name, annual_price, max_products, max_stores, max_photos_per_product, max_team_members, features)
VALUES
  ('free', 0, 7, 1, 3, 1, '{"whatsapp": true, "crm": false, "trend_radar": false, "geo_analytics": false, "relance": false, "multi_store": false}'::jsonb),
  ('pro', 25000, -1, 1, 10, 1, '{"whatsapp": true, "crm": true, "trend_radar": false, "geo_analytics": false, "relance": true, "multi_store": false}'::jsonb),
  ('entreprise', 250000, -1, 5, 20, -1, '{"whatsapp": true, "crm": true, "trend_radar": true, "geo_analytics": true, "relance": true, "multi_store": true}'::jsonb);

-- 2.2 USERS (Super Admins et Vendeurs)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role_type role_type NOT NULL DEFAULT 'owner',
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 STORES (Boutiques)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  cover_url VARCHAR(500),
  whatsapp_number VARCHAR(20),
  telegram_username VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Senegal',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  subscription_starts_at TIMESTAMP WITH TIME ZONE,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_orders INT NOT NULL DEFAULT 0,
  total_revenue BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
  theme_color VARCHAR(7) DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subscription_plan_fk FOREIGN KEY (subscription_plan) REFERENCES plans(name)
);

CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_city ON stores(city);

-- 2.4 PRODUCTS (Catalogue)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  compare_price BIGINT,
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
  images TEXT[],
  category VARCHAR(100),
  stock INT NOT NULL DEFAULT 99,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views_count INT NOT NULL DEFAULT 0,
  cart_adds_count INT NOT NULL DEFAULT 0,
  orders_count INT NOT NULL DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- 2.5 CUSTOMERS (Clients)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_orders INT NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  customer_segment customer_segment NOT NULL DEFAULT 'new',
  favorite_category VARCHAR(100),
  private_notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_segment ON customers(customer_segment);

-- 2.6 ORDERS (Commandes)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT,
  customer_city VARCHAR(100),
  items JSONB NOT NULL,
  subtotal BIGINT NOT NULL,
  delivery_fee BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL,
  discount_amount BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
  status order_status NOT NULL DEFAULT 'pending',
  source sales_channel NOT NULL,
  notes TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 2.7 TEAM MEMBERS (Agents/Collaborateurs)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role role_type NOT NULL DEFAULT 'agent',
  habilitations JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, user_id)
);

CREATE INDEX idx_team_members_store_id ON team_members(store_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- 2.8 SUBSCRIPTIONS (Historique des abonnements)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  plan_name subscription_plan NOT NULL REFERENCES plans(name),
  annual_price BIGINT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_store_id ON subscriptions(store_id);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- 2.9 INVOICES (Factures)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  line_items JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_store_id ON invoices(store_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_issued_at ON invoices(issued_at);

-- 2.10 PAYMENTS (Paiements)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
  payment_method VARCHAR(50),
  reference VARCHAR(255),
  status payment_status NOT NULL DEFAULT 'unpaid',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_store_id ON payments(store_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 2.11 AUDIT LOGS
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 2.12 ANALYTICS TABLES
CREATE TABLE click_events (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_city VARCHAR(100),
  customer_region VARCHAR(100),
  event_type VARCHAR(50),
  session_id VARCHAR(255),
  ip_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_click_events_product_id ON click_events(product_id);
CREATE INDEX idx_click_events_store_id ON click_events(store_id);
CREATE INDEX idx_click_events_created_at ON click_events(created_at);

CREATE TABLE trend_data (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  click_count INT NOT NULL DEFAULT 0,
  cart_add_count INT NOT NULL DEFAULT 0,
  order_count INT NOT NULL DEFAULT 0,
  top_city VARCHAR(100),
  price BIGINT,
  rank_in_category INT,
  rank_globally INT,
  trend_direction VARCHAR(20),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trend_data_snapshot_date ON trend_data(snapshot_date);
CREATE INDEX idx_trend_data_category ON trend_data(category);
CREATE INDEX idx_trend_data_rank ON trend_data(rank_globally);

CREATE TABLE product_analytics (
  id BIGSERIAL PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INT NOT NULL DEFAULT 0,
  cart_adds INT NOT NULL DEFAULT 0,
  purchases INT NOT NULL DEFAULT 0,
  revenue BIGINT NOT NULL DEFAULT 0,
  avg_session_duration INT,
  conversion_rate DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, product_id, date)
);

CREATE INDEX idx_product_analytics_store_id ON product_analytics(store_id);
CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_date ON product_analytics(date);

CREATE TABLE customer_locations (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Senegal',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  visit_count INT NOT NULL DEFAULT 1,
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_locations_customer_id ON customer_locations(customer_id);
CREATE INDEX idx_customer_locations_city ON customer_locations(city);

CREATE TABLE regional_stats (
  id BIGSERIAL PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  active_customers INT NOT NULL DEFAULT 0,
  total_orders INT NOT NULL DEFAULT 0,
  total_revenue BIGINT NOT NULL DEFAULT 0,
  avg_order_value BIGINT NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, city, date)
);

CREATE INDEX idx_regional_stats_store_id ON regional_stats(store_id);
CREATE INDEX idx_regional_stats_city ON regional_stats(city);

CREATE TABLE location_analytics (
  id BIGSERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  vendor_count INT NOT NULL DEFAULT 0,
  buyer_count INT NOT NULL DEFAULT 0,
  total_transactions INT NOT NULL DEFAULT 0,
  total_gmv BIGINT NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city, date)
);

CREATE INDEX idx_location_analytics_city ON location_analytics(city);
CREATE INDEX idx_location_analytics_date ON location_analytics(date);

-- ============================================================================
-- PARTIE 3: TRIGGERS (avec fixes)
-- ============================================================================

-- 3.1 FONCTION: Vérifier limite de produits par plan
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan subscription_plan;
  v_max_products INT;
  v_product_count INT;
BEGIN
  SELECT subscription_plan INTO v_plan FROM stores WHERE id = NEW.store_id;
  SELECT max_products INTO v_max_products FROM plans WHERE name = v_plan;
  IF v_max_products = -1 THEN
    RETURN NEW;
  END IF;
  SELECT COUNT(*) INTO v_product_count FROM products WHERE store_id = NEW.store_id AND is_active = true;
  IF v_product_count >= v_max_products THEN
    RAISE EXCEPTION 'Plan % permet maximum % produits. Limit reached.', v_plan, v_max_products;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_product_limit
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_limit();

-- 3.2 FONCTION: Vérifier limite de photos par plan
CREATE OR REPLACE FUNCTION check_photos_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan subscription_plan;
  v_max_photos INT;
  v_photo_count INT;
BEGIN
  SELECT subscription_plan INTO v_plan FROM stores WHERE id = NEW.store_id;
  SELECT max_photos_per_product INTO v_max_photos FROM plans WHERE name = v_plan;
  v_photo_count := ARRAY_LENGTH(NEW.images, 1);
  IF v_photo_count IS NULL THEN
    v_photo_count := 0;
  END IF;
  IF v_photo_count > v_max_photos THEN
    RAISE EXCEPTION 'Plan % permet maximum % photos par produit. You have %.', v_plan, v_max_photos, v_photo_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_photos_limit
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_photos_limit();

-- 3.3 FONCTION: Vérifier limite de stores par plan (FIX RLS RECURSION)
CREATE OR REPLACE FUNCTION check_multi_store_limit()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan subscription_plan;
  v_max_stores INT;
  v_store_count INT;
BEGIN
  v_plan := NEW.subscription_plan;
  SELECT max_stores INTO v_max_stores FROM plans WHERE name = v_plan;
  IF v_max_stores = -1 THEN
    RETURN NEW;
  END IF;
  SELECT COUNT(*) INTO v_store_count 
  FROM stores 
  WHERE owner_id = NEW.owner_id AND is_active = true;
  IF v_store_count >= v_max_stores THEN
    RAISE EXCEPTION 'Plan % allows maximum % stores. Limit reached.', v_plan, v_max_stores;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_multi_store_limit
BEFORE INSERT ON stores
FOR EACH ROW
WHEN (NEW.owner_id IS NOT NULL)
EXECUTE FUNCTION check_multi_store_limit();

-- 3.4 FONCTION: Mettre à jour total_orders et total_revenue du store
CREATE OR REPLACE FUNCTION update_store_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE stores 
    SET total_orders = total_orders + 1,
        total_revenue = total_revenue + NEW.total,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.store_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_store_metrics
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_store_metrics();

-- 3.5 FONCTION: Mettre à jour customer metrics
CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' THEN
    UPDATE customers 
    SET total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total,
        last_order_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_metrics
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.customer_id IS NOT NULL AND NEW.status = 'delivered')
EXECUTE FUNCTION update_customer_metrics();

-- 3.6 FONCTION: Créer automatiquement un profil dans public.users (FIX USER PROFILE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    phone,
    email,
    full_name,
    role_type,
    is_super_admin,
    is_active
  ) VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'owner',
    false,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3.7 FONCTION: Agrégation des clics pour Trend Radar
CREATE OR REPLACE FUNCTION aggregate_click_events_to_trend_data()
RETURNS void AS $$
BEGIN
  INSERT INTO trend_data (product_id, product_name, category, click_count, cart_add_count, order_count, top_city, price, snapshot_date)
  SELECT
    p.id,
    p.name,
    p.category,
    COALESCE(SUM(CASE WHEN ce.event_type = 'view' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN ce.event_type = 'cart_add' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN ce.event_type = 'purchase' THEN 1 ELSE 0 END), 0),
    MODE() WITHIN GROUP (ORDER BY ce.customer_city),
    p.price,
    CURRENT_DATE
  FROM products p
  LEFT JOIN click_events ce ON p.id = ce.product_id 
    AND ce.created_at >= CURRENT_DATE 
    AND ce.created_at < CURRENT_DATE + INTERVAL '1 day'
  WHERE p.is_active = true
  GROUP BY p.id, p.name, p.category, p.price
  ON CONFLICT (product_id, snapshot_date) DO UPDATE SET
    click_count = EXCLUDED.click_count,
    cart_add_count = EXCLUDED.cart_add_count,
    order_count = EXCLUDED.order_count,
    top_city = EXCLUDED.top_city;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTIE 4: FONCTIONS MULTI-BOUTIQUES ET ÉQUIPES
-- ============================================================================

-- 4.1 Fonction pour vérifier les limites du plan
CREATE OR REPLACE FUNCTION check_plan_limits(
  p_user_id UUID,
  p_check_type TEXT
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INT,
  max_allowed INT,
  plan_name subscription_plan
) AS $$
DECLARE
  v_plan subscription_plan;
  v_max_stores INT;
  v_max_team_members INT;
  v_current_stores INT;
  v_current_team_members INT;
BEGIN
  SELECT s.subscription_plan INTO v_plan
  FROM stores s
  WHERE s.owner_id = p_user_id AND s.is_active = true
  ORDER BY s.created_at ASC
  LIMIT 1;
  
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;
  
  SELECT 
    CASE WHEN p.max_stores = -1 THEN 999999 ELSE p.max_stores END,
    CASE WHEN p.max_team_members = -1 THEN 999999 ELSE p.max_team_members END
  INTO v_max_stores, v_max_team_members
  FROM plans p
  WHERE p.name = v_plan;
  
  SELECT COUNT(*) INTO v_current_stores
  FROM stores s
  WHERE s.owner_id = p_user_id AND s.is_active = true;
  
  SELECT COUNT(DISTINCT tm.user_id) INTO v_current_team_members
  FROM team_members tm
  INNER JOIN stores s ON s.id = tm.store_id
  WHERE s.owner_id = p_user_id AND tm.is_active = true;
  
  IF p_check_type = 'stores' THEN
    RETURN QUERY SELECT 
      (v_current_stores < v_max_stores) as allowed,
      v_current_stores as current_count,
      v_max_stores as max_allowed,
      v_plan as plan_name;
  ELSIF p_check_type = 'team_members' THEN
    RETURN QUERY SELECT 
      (v_current_team_members < v_max_team_members) as allowed,
      v_current_team_members as current_count,
      v_max_team_members as max_allowed,
      v_plan as plan_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 Fonction pour créer une boutique avec vérification des limites
CREATE OR REPLACE FUNCTION create_store_with_limits(
  p_owner_id UUID,
  p_store_name TEXT,
  p_store_slug TEXT,
  p_whatsapp_number TEXT,
  p_subscription_plan subscription_plan DEFAULT 'free'
)
RETURNS TABLE (
  success BOOLEAN,
  store_id UUID,
  message TEXT
) AS $$
DECLARE
  v_store_id UUID;
  v_can_create BOOLEAN;
  v_current_count INT;
  v_max_allowed INT;
  v_plan subscription_plan;
BEGIN
  SELECT allowed, current_count, max_allowed, plan_name
  INTO v_can_create, v_current_count, v_max_allowed, v_plan
  FROM check_plan_limits(p_owner_id, 'stores');
  
  IF NOT v_can_create THEN
    RETURN QUERY SELECT 
      false as success,
      NULL::UUID as store_id,
      format('Limite atteinte : %s/%s boutiques (Plan %s)', 
        v_current_count, v_max_allowed, v_plan) as message;
    RETURN;
  END IF;
  
  INSERT INTO stores (
    owner_id,
    name,
    slug,
    whatsapp_number,
    subscription_plan,
    is_active
  ) VALUES (
    p_owner_id,
    p_store_name,
    p_store_slug,
    p_whatsapp_number,
    p_subscription_plan,
    true
  )
  RETURNING id INTO v_store_id;
  
  RETURN QUERY SELECT 
    true as success,
    v_store_id as store_id,
    format('Boutique créée avec succès (%s/%s)', 
      v_current_count + 1, v_max_allowed) as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 Fonction pour ajouter un membre d'équipe
CREATE OR REPLACE FUNCTION add_team_member(
  p_store_id UUID,
  p_member_phone TEXT,
  p_member_name TEXT,
  p_role role_type DEFAULT 'agent',
  p_habilitations JSONB DEFAULT '{"orders": true, "products": true, "customers": true, "dashboard": true, "inventory": false, "crm": false}'::jsonb
)
RETURNS TABLE (
  success BOOLEAN,
  member_id UUID,
  message TEXT
) AS $$
DECLARE
  v_owner_id UUID;
  v_member_user_id UUID;
  v_member_id UUID;
  v_can_add BOOLEAN;
  v_current_count INT;
  v_max_allowed INT;
  v_plan subscription_plan;
BEGIN
  SELECT owner_id INTO v_owner_id
  FROM stores
  WHERE id = p_store_id;
  
  IF v_owner_id IS NULL THEN
    RETURN QUERY SELECT 
      false as success,
      NULL::UUID as member_id,
      'Boutique introuvable' as message;
    RETURN;
  END IF;
  
  SELECT s.subscription_plan INTO v_plan
  FROM stores s
  WHERE s.owner_id = v_owner_id
  LIMIT 1;
  
  IF v_plan != 'entreprise' THEN
    RETURN QUERY SELECT 
      false as success,
      NULL::UUID as member_id,
      'Seul le plan Entreprise peut ajouter des gestionnaires' as message;
    RETURN;
  END IF;
  
  SELECT allowed, current_count, max_allowed
  INTO v_can_add, v_current_count, v_max_allowed
  FROM check_plan_limits(v_owner_id, 'team_members');
  
  IF NOT v_can_add THEN
    RETURN QUERY SELECT 
      false as success,
      NULL::UUID as member_id,
      format('Limite atteinte : %s/%s gestionnaires', 
        v_current_count, v_max_allowed) as message;
    RETURN;
  END IF;
  
  INSERT INTO users (phone, full_name, role_type, is_active)
  VALUES (p_member_phone, p_member_name, p_role, true)
  ON CONFLICT (phone) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
  RETURNING id INTO v_member_user_id;
  
  INSERT INTO team_members (
    store_id,
    user_id,
    role,
    habilitations,
    is_active
  ) VALUES (
    p_store_id,
    v_member_user_id,
    p_role,
    p_habilitations,
    true
  )
  ON CONFLICT (store_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    habilitations = EXCLUDED.habilitations,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING id INTO v_member_id;
  
  RETURN QUERY SELECT 
    true as success,
    v_member_id as member_id,
    format('Gestionnaire ajouté (%s/%s)', 
      v_current_count + 1, v_max_allowed) as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.4 Fonction pour affecter un membre à plusieurs boutiques
CREATE OR REPLACE FUNCTION assign_member_to_stores(
  p_owner_id UUID,
  p_member_phone TEXT,
  p_store_ids UUID[],
  p_role role_type DEFAULT 'agent',
  p_habilitations JSONB DEFAULT '{"orders": true, "products": true, "customers": true}'::jsonb
)
RETURNS TABLE (
  success BOOLEAN,
  stores_assigned INT,
  message TEXT
) AS $$
DECLARE
  v_member_user_id UUID;
  v_store_id UUID;
  v_assigned_count INT := 0;
  v_plan subscription_plan;
BEGIN
  SELECT s.subscription_plan INTO v_plan
  FROM stores s
  WHERE s.owner_id = p_owner_id
  LIMIT 1;
  
  IF v_plan != 'entreprise' THEN
    RETURN QUERY SELECT 
      false as success,
      0 as stores_assigned,
      'Seul le plan Entreprise peut gérer plusieurs boutiques' as message;
    RETURN;
  END IF;
  
  INSERT INTO users (phone, role_type, is_active)
  VALUES (p_member_phone, p_role, true)
  ON CONFLICT (phone) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_member_user_id;
  
  FOREACH v_store_id IN ARRAY p_store_ids
  LOOP
    IF EXISTS (
      SELECT 1 FROM stores 
      WHERE id = v_store_id AND owner_id = p_owner_id
    ) THEN
      INSERT INTO team_members (
        store_id,
        user_id,
        role,
        habilitations,
        is_active
      ) VALUES (
        v_store_id,
        v_member_user_id,
        p_role,
        p_habilitations,
        true
      )
      ON CONFLICT (store_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        habilitations = EXCLUDED.habilitations,
        is_active = true,
        updated_at = NOW();
      
      v_assigned_count := v_assigned_count + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    true as success,
    v_assigned_count as stores_assigned,
    format('Membre affecté à %s boutique(s)', v_assigned_count) as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.5 Fonction pour créer user + store en une seule opération
CREATE OR REPLACE FUNCTION public.create_user_and_store(
  p_auth_user_id UUID,
  p_phone TEXT,
  p_full_name TEXT,
  p_store_name TEXT,
  p_store_slug TEXT,
  p_whatsapp_number TEXT
)
RETURNS TABLE (
  user_id UUID,
  store_id UUID
) AS $$
DECLARE
  v_user_id UUID;
  v_store_id UUID;
BEGIN
  INSERT INTO public.users (
    id,
    phone,
    full_name,
    role_type,
    is_super_admin,
    is_active
  ) VALUES (
    p_auth_user_id,
    p_phone,
    p_full_name,
    'owner',
    false,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.stores (
    owner_id,
    name,
    slug,
    whatsapp_number,
    subscription_plan,
    is_active
  ) VALUES (
    v_user_id,
    p_store_name,
    p_store_slug,
    p_whatsapp_number,
    'free',
    true
  )
  RETURNING id INTO v_store_id;
  
  RETURN QUERY SELECT v_user_id, v_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.6 Fonction pour récupérer les boutiques d'un propriétaire
CREATE OR REPLACE FUNCTION get_owner_stores(p_owner_id UUID)
RETURNS TABLE (
  store_id UUID,
  store_name TEXT,
  slug TEXT,
  whatsapp_number TEXT,
  subscription_plan subscription_plan,
  is_active BOOLEAN,
  team_members_count BIGINT,
  can_add_more_stores BOOLEAN,
  can_add_more_members BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_plan subscription_plan;
  v_max_stores INT;
  v_current_stores INT;
  v_max_members INT;
  v_current_members INT;
BEGIN
  SELECT 
    s.subscription_plan,
    CASE WHEN p.max_stores = -1 THEN 999999 ELSE p.max_stores END,
    CASE WHEN p.max_team_members = -1 THEN 999999 ELSE p.max_team_members END
  INTO v_plan, v_max_stores, v_max_members
  FROM stores s
  INNER JOIN plans p ON p.name = s.subscription_plan
  WHERE s.owner_id = p_owner_id AND s.is_active = true
  ORDER BY s.created_at ASC
  LIMIT 1;
  
  SELECT COUNT(*) INTO v_current_stores
  FROM stores s
  WHERE s.owner_id = p_owner_id AND s.is_active = true;
  
  SELECT COUNT(DISTINCT tm.user_id) INTO v_current_members
  FROM team_members tm
  INNER JOIN stores s ON s.id = tm.store_id
  WHERE s.owner_id = p_owner_id AND tm.is_active = true;
  
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.slug,
    s.whatsapp_number,
    s.subscription_plan,
    s.is_active,
    (SELECT COUNT(*) FROM team_members tm 
     WHERE tm.store_id = s.id AND tm.is_active = true),
    (v_current_stores < v_max_stores) as can_add_more_stores,
    (v_current_members < v_max_members) as can_add_more_members,
    s.created_at
  FROM stores s
  WHERE s.owner_id = p_owner_id
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTIE 5: RLS POLICIES
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES: Stores
DROP POLICY IF EXISTS stores_check_phone_exists ON public.stores;
CREATE POLICY "stores_check_phone_exists" ON public.stores
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS stores_select_own ON stores;
CREATE POLICY stores_select_own ON stores FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS stores_insert_own ON stores;
CREATE POLICY stores_insert_own ON stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS stores_update_own ON stores;
CREATE POLICY stores_update_own ON stores FOR UPDATE
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid() AND role IN ('owner', 'manager')))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid() AND role IN ('owner', 'manager')));

DROP POLICY IF EXISTS stores_delete_own ON stores;
CREATE POLICY stores_delete_own ON stores FOR DELETE
  USING (owner_id = auth.uid());

-- POLICIES: Products
DROP POLICY IF EXISTS products_select_own ON products;
CREATE POLICY products_select_own ON products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

DROP POLICY IF EXISTS products_insert_own ON products;
CREATE POLICY products_insert_own ON products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS products_update_own ON products;
CREATE POLICY products_update_own ON products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

-- POLICIES: Customers
DROP POLICY IF EXISTS customers_select_own ON customers;
CREATE POLICY customers_select_own ON customers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

DROP POLICY IF EXISTS customers_insert_own ON customers;
CREATE POLICY customers_insert_own ON customers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
  );

-- POLICIES: Orders
DROP POLICY IF EXISTS orders_select_own ON orders;
CREATE POLICY orders_select_own ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

DROP POLICY IF EXISTS orders_insert_own ON orders;
CREATE POLICY orders_insert_own ON orders FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
  );

-- POLICIES: Product Analytics, Regional Stats, Invoices, Payments
DROP POLICY IF EXISTS product_analytics_select_own ON product_analytics;
CREATE POLICY product_analytics_select_own ON product_analytics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

DROP POLICY IF EXISTS regional_stats_select_own ON regional_stats;
CREATE POLICY regional_stats_select_own ON regional_stats FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

DROP POLICY IF EXISTS invoices_select_own ON invoices;
CREATE POLICY invoices_select_own ON invoices FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

DROP POLICY IF EXISTS payments_select_own ON payments;
CREATE POLICY payments_select_own ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM team_members WHERE store_id = stores.id AND user_id = auth.uid())))
  );

-- POLICIES: Team Members
DROP POLICY IF EXISTS team_members_select_own ON team_members;
CREATE POLICY team_members_select_own ON team_members FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = team_members.store_id 
    AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS team_members_manage_owner ON team_members;
CREATE POLICY team_members_manage_owner ON team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = team_members.store_id 
    AND s.owner_id = auth.uid()
  )
);

-- POLICIES: Audit Logs
DROP POLICY IF EXISTS audit_logs_select_own ON audit_logs;
CREATE POLICY audit_logs_select_own ON audit_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_super_admin = true)
  );

-- ============================================================================
-- PARTIE 6: VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW v_active_stores_with_plans AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.owner_id,
  s.subscription_plan,
  s.subscription_expires_at,
  p.annual_price,
  s.total_orders,
  s.total_revenue,
  s.created_at
FROM stores s
LEFT JOIN plans p ON s.subscription_plan = p.name
WHERE s.is_active = true;

CREATE OR REPLACE VIEW v_trending_products AS
SELECT
  td.product_id,
  td.product_name,
  td.category,
  td.click_count,
  td.cart_add_count,
  td.order_count,
  td.top_city,
  td.rank_globally,
  td.snapshot_date
FROM trend_data td
WHERE td.snapshot_date = CURRENT_DATE
ORDER BY td.rank_globally ASC
LIMIT 100;

CREATE OR REPLACE VIEW v_city_heatmap AS
SELECT
  la.city,
  la.region,
  la.latitude,
  la.longitude,
  la.vendor_count,
  la.buyer_count,
  la.total_gmv,
  la.date
FROM location_analytics la
WHERE la.date = CURRENT_DATE
ORDER BY la.total_gmv DESC;

CREATE OR REPLACE VIEW v_stores_with_team AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  s.slug,
  s.owner_id,
  u_owner.full_name as owner_name,
  u_owner.phone as owner_phone,
  s.subscription_plan,
  s.whatsapp_number,
  s.is_active as store_active,
  (SELECT COUNT(*) FROM team_members tm 
   WHERE tm.store_id = s.id AND tm.is_active = true) as team_members_count,
  (SELECT json_agg(json_build_object(
    'member_id', tm.id,
    'user_id', tm.user_id,
    'member_name', u_member.full_name,
    'member_phone', u_member.phone,
    'role', tm.role,
    'habilitations', tm.habilitations,
    'is_active', tm.is_active,
    'joined_at', tm.joined_at
  ))
  FROM team_members tm
  INNER JOIN users u_member ON u_member.id = tm.user_id
  WHERE tm.store_id = s.id
  ) as team_members,
  s.created_at,
  s.updated_at
FROM stores s
INNER JOIN users u_owner ON u_owner.id = s.owner_id
ORDER BY s.created_at DESC;

-- ============================================================================
-- PARTIE 7: INDEXES ADDITIONNELS
-- ============================================================================

CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('french', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_customers_search ON customers USING GIN(to_tsvector('french', first_name || ' ' || COALESCE(last_name, '')));
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_products_store_active ON products(store_id, is_active);
CREATE INDEX idx_customers_store_segment ON customers(store_id, customer_segment);
CREATE INDEX idx_click_events_product_date ON click_events(product_id, created_at);
CREATE INDEX idx_orders_created_brin ON orders USING BRIN(created_at);
CREATE INDEX idx_click_events_created_brin ON click_events USING BRIN(created_at);

-- ============================================================================
-- PARTIE 8: PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION check_plan_limits TO authenticated;
GRANT EXECUTE ON FUNCTION create_store_with_limits TO authenticated;
GRANT EXECUTE ON FUNCTION add_team_member TO authenticated;
GRANT EXECUTE ON FUNCTION assign_member_to_stores TO authenticated;
GRANT EXECUTE ON FUNCTION get_owner_stores TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_and_store TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_and_store TO anon;

GRANT SELECT ON v_stores_with_team TO authenticated;

-- ============================================================================
-- PARTIE 9: MIGRATION DES USERS EXISTANTS (si nécessaire)
-- ============================================================================

INSERT INTO public.users (id, phone, email, full_name, role_type, is_super_admin, is_active)
SELECT 
  id,
  phone,
  email,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  'owner',
  false,
  true
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================

COMMIT;

