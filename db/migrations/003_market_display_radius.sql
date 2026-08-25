ALTER TABLE demo_pockets
  ADD COLUMN IF NOT EXISTS display_radius_miles numeric NOT NULL DEFAULT 5
  CHECK (display_radius_miles > 0 AND display_radius_miles <= 25);
