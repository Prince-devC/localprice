-- Recommended indexes for Supabase/Postgres

-- prices table: frequent filters and joins
CREATE INDEX IF NOT EXISTS idx_prices_product_locality_date ON prices (product_id, locality_id, date);
CREATE INDEX IF NOT EXISTS idx_prices_status ON prices (status);
CREATE INDEX IF NOT EXISTS idx_prices_created_at ON prices (created_at);
CREATE INDEX IF NOT EXISTS idx_prices_submitted_by ON prices (submitted_by);

-- price_source_languages linkage
CREATE INDEX IF NOT EXISTS idx_price_source_languages_price ON price_source_languages (price_id);
CREATE INDEX IF NOT EXISTS idx_price_source_languages_lang ON price_source_languages (language_id);

-- product_prices (if used)
CREATE INDEX IF NOT EXISTS idx_product_prices_prod_store ON product_prices (product_id, store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_availability ON product_prices (is_available);
CREATE INDEX IF NOT EXISTS idx_product_prices_date ON product_prices (date);

-- supplier_prices (if used)
CREATE INDEX IF NOT EXISTS idx_supplier_prices_prod_supplier ON supplier_prices (product_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_price_id ON supplier_prices (price_id);

-- contribution_requests
CREATE INDEX IF NOT EXISTS idx_contribution_requests_user_status ON contribution_requests (user_id, status);
CREATE INDEX IF NOT EXISTS idx_contribution_requests_reviewed_created ON contribution_requests (reviewed_at, created_at);

-- localities and regions
CREATE INDEX IF NOT EXISTS idx_localities_region ON localities (region_id);

-- units
CREATE INDEX IF NOT EXISTS idx_units_name ON units (name);