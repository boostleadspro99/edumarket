/*
  # Correction de l'erreur ON CONFLICT pour les utilisateurs de démonstration

  1. Problème résolu
    - Suppression de la logique ON CONFLICT qui ne fonctionne pas avec auth.users
    - Utilisation d'une approche plus sûre pour créer les utilisateurs de démonstration

  2. Changements
    - Vérification de l'existence avant insertion
    - Création conditionnelle des utilisateurs de démonstration
    - Mise à jour des profils de manière sécurisée
*/

-- Fonction pour créer un utilisateur de démonstration de manière sécurisée
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email text,
  user_password text,
  user_name text,
  user_role user_role DEFAULT 'CLIENT'
)
RETURNS uuid AS $$
DECLARE
  user_id uuid;
  existing_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- L'utilisateur existe déjà, retourner son ID
    RETURN existing_user_id;
  END IF;
  
  -- Générer un nouvel ID
  user_id := gen_random_uuid();
  
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at, 
    raw_user_meta_data
  ) VALUES (
    user_id,
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('name', user_name)
  );
  
  -- Créer ou mettre à jour le profil
  INSERT INTO profiles (id, name, role, balance_points)
  VALUES (user_id, user_name, user_role, 1000) -- Donner 1000 points de démo
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    balance_points = GREATEST(profiles.balance_points, 1000);
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les utilisateurs de démonstration
DO $$
DECLARE
  demo_seller_id uuid;
  demo_client_id uuid;
  demo_admin_id uuid;
BEGIN
  -- Créer un vendeur de démonstration
  demo_seller_id := create_demo_user(
    'seller@demo.com',
    'demo123',
    'Vendeur Démo',
    'SELLER'
  );
  
  -- Créer un client de démonstration
  demo_client_id := create_demo_user(
    'client@demo.com',
    'demo123',
    'Client Démo',
    'CLIENT'
  );
  
  -- Créer un admin de démonstration
  demo_admin_id := create_demo_user(
    'admin@demo.com',
    'demo123',
    'Admin Démo',
    'ADMIN'
  );
  
  -- Supprimer les anciens produits de démonstration s'ils existent
  DELETE FROM products WHERE seller_id = demo_seller_id;
  
  -- Insérer des produits de démonstration
  INSERT INTO products (title, description, price_points, seller_id) VALUES
    ('Guide Complet React', 'Apprenez React de A à Z avec des exemples pratiques et des projets concrets. Ce guide couvre tous les concepts fondamentaux et avancés.', 50, demo_seller_id),
    ('Maîtriser TypeScript', 'Guide complet pour maîtriser TypeScript dans vos projets JavaScript. Découvrez les types, interfaces, génériques et plus encore.', 75, demo_seller_id),
    ('Next.js en Pratique', 'Construisez des applications full-stack modernes avec Next.js. App Router, Server Components, API Routes et déploiement.', 100, demo_seller_id),
    ('CSS Grid et Flexbox', 'Maîtrisez les layouts modernes avec CSS Grid et Flexbox. Créez des designs responsives et professionnels.', 40, demo_seller_id),
    ('JavaScript ES6+', 'Découvrez les fonctionnalités modernes de JavaScript : arrow functions, destructuring, modules, async/await et plus.', 60, demo_seller_id),
    ('Node.js Backend', 'Développez des APIs robustes avec Node.js, Express et MongoDB. Authentification, sécurité et bonnes pratiques.', 90, demo_seller_id);
  
  RAISE NOTICE 'Utilisateurs de démonstration créés avec succès';
  RAISE NOTICE 'Vendeur ID: %', demo_seller_id;
  RAISE NOTICE 'Client ID: %', demo_client_id;
  RAISE NOTICE 'Admin ID: %', demo_admin_id;
END $$;

-- Nettoyer la fonction temporaire
DROP FUNCTION create_demo_user(text, text, text, user_role);