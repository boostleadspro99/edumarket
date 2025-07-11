-- Fonction pour incrémenter le solde de points d'un utilisateur de manière atomique
CREATE OR REPLACE FUNCTION increment_balance(user_id uuid, points integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET balance_points = balance_points + points,
      updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé: %', user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;