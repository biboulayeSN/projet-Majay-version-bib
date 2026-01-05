-- ============================================================================
-- Script SQL pour créer l'utilisateur admin
-- ============================================================================
-- Numéro: 780181144
-- Mot de passe: 123456
-- Hash SHA-256 de "123456": 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
-- ============================================================================

-- Créer l'utilisateur admin
INSERT INTO users (
  id,
  phone,
  email,
  password_hash,
  full_name,
  role_type,
  is_super_admin,
  is_active,
  created_at
)
VALUES (
  gen_random_uuid(),
  '+221780181144',
  'admin@majay.sn',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', -- Hash de "123456"
  'Super Administrateur',
  'owner',
  true,
  true,
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  password_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  is_super_admin = true,
  is_active = true,
  updated_at = NOW();

-- Vérifier que l'utilisateur a été créé
SELECT id, phone, full_name, is_super_admin, created_at 
FROM users 
WHERE phone = '+221780181144';

