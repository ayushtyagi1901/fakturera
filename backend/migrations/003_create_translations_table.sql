-- Create translations table to store UI translations
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code, key)
);

-- Create index on language_code and key for faster lookups
CREATE INDEX IF NOT EXISTS idx_translations_language_key ON translations(language_code, key);

-- English translations
INSERT INTO translations (language_code, key, value) VALUES
('en', 'nav.home', 'Home'),
('en', 'nav.order', 'Order'),
('en', 'nav.customers', 'Our Customers'),
('en', 'nav.about', 'About us'),
('en', 'nav.contact', 'Contact Us'),
('en', 'terms.close', 'Close and go back'),
('en', 'terms.title', 'Terms')
ON CONFLICT (language_code, key) DO NOTHING;

-- Swedish translations
INSERT INTO translations (language_code, key, value) VALUES
('sv', 'nav.home', 'Hem'),
('sv', 'nav.order', 'Beställ'),
('sv', 'nav.customers', 'Våra kunder'),
('sv', 'nav.about', 'Om oss'),
('sv', 'nav.contact', 'Kontakta oss'),
('sv', 'terms.close', 'Stäng och gå tillbaka'),
('sv', 'terms.title', 'Villkor')
ON CONFLICT (language_code, key) DO NOTHING;

