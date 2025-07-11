/*
  # Schéma initial EduMarket

  1. Tables principales
    - `profiles` - Profils utilisateurs étendus (liés à auth.users)
    - `point_packs` - Packs de points disponibles à l'achat
    - `products` - Produits PDF vendus par les vendeurs
    - `purchases` - Achats effectués par les clients
    - `transactions` - Historique des transactions de points
    - `withdrawals` - Demandes de retrait des vendeurs

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès basées sur les rôles
    - Contraintes d'intégrité des données

  3. Fonctionnalités
    - Gestion des rôles utilisateur
    - Système de points et commissions
    - Workflow de retrait avec approbation admin
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE user_role AS ENUM ('CLIENT', 'SELLER', 'ADMIN');
CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'SALE', 'WITHDRAWAL', 'POINT_PACK_PURCHASE');
CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'CLIENT',
  balance_points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des packs de points
CREATE TABLE IF NOT EXISTS point_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_euro integer NOT NULL, -- Prix en centimes d'euro
  points integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price_points integer NOT NULL CHECK (price_points >= 1),
  file_url text,
  file_path text,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des achats
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  points_spent integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(buyer_id, product_id) -- Un utilisateur ne peut acheter le même produit qu'une fois
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  points integer NOT NULL,
  commission integer DEFAULT 0,
  type transaction_type NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table des demandes de retrait
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points_requested integer NOT NULL CHECK (points_requested > 0),
  euro_amount integer NOT NULL, -- Montant en centimes d'euro
  status withdrawal_status DEFAULT 'PENDING',
  admin_notes text,
  processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Utilisateur'), 'CLIENT');
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger pour créer automatiquement un profil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activation de RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Les admins peuvent voir tous les profils"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politiques RLS pour point_packs
CREATE POLICY "Tout le monde peut voir les packs de points actifs"
  ON point_packs FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Seuls les admins peuvent gérer les packs de points"
  ON point_packs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politiques RLS pour products
CREATE POLICY "Tout le monde peut voir les produits actifs"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Les vendeurs peuvent gérer leurs propres produits"
  ON products FOR ALL
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Les admins peuvent voir tous les produits"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politiques RLS pour purchases
CREATE POLICY "Les utilisateurs peuvent voir leurs propres achats"
  ON purchases FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Les vendeurs peuvent voir les achats de leurs produits"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Les admins peuvent voir tous les achats"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politiques RLS pour transactions
CREATE POLICY "Les utilisateurs peuvent voir leurs propres transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Les admins peuvent voir toutes les transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politiques RLS pour withdrawals
CREATE POLICY "Les vendeurs peuvent voir leurs propres demandes de retrait"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Les vendeurs peuvent créer des demandes de retrait"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Les admins peuvent gérer toutes les demandes de retrait"
  ON withdrawals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion des données initiales pour les packs de points
INSERT INTO point_packs (name, price_euro, points) VALUES
  ('Pack Starter', 1000, 100),    -- 10€ = 100 points
  ('Pack Populaire', 2500, 275),  -- 25€ = 275 points (10% bonus)
  ('Pack Pro', 5000, 600),        -- 50€ = 600 points (20% bonus)
  ('Pack Ultimate', 10000, 1300); -- 100€ = 1300 points (30% bonus)

-- Insertion de quelques produits de démonstration
DO $$
DECLARE
  demo_seller_id uuid;
BEGIN
  -- Créer un utilisateur vendeur de démonstration s'il n'existe pas
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
  VALUES (
    gen_random_uuid(),
    'seller@demo.com',
    crypt('demo123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"name": "Vendeur Démo"}'::jsonb
  ) ON CONFLICT (email) DO NOTHING;

  -- Récupérer l'ID du vendeur démo
  SELECT id INTO demo_seller_id FROM auth.users WHERE email = 'seller@demo.com';

  -- Mettre à jour le profil pour être un vendeur
  UPDATE profiles SET role = 'SELLER' WHERE id = demo_seller_id;

  -- Insérer des produits de démonstration
  INSERT INTO products (title, description, price_points, seller_id) VALUES
    ('Guide Complet React', 'Apprenez React de A à Z avec des exemples pratiques et des projets concrets.', 50, demo_seller_id),
    ('Maîtriser TypeScript', 'Guide complet pour maîtriser TypeScript dans vos projets JavaScript.', 75, demo_seller_id),
    ('Next.js en Pratique', 'Construisez des applications full-stack modernes avec Next.js.', 100, demo_seller_id);
END $$;