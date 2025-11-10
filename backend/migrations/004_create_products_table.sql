-- Create products table to store dashboard items
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  article_no VARCHAR(50) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_sv VARCHAR(255) NOT NULL,
  in_price DECIMAL(10, 2),
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  in_stock INTEGER DEFAULT 0,
  description_en TEXT,
  description_sv TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_no)
);

-- Create index on article_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_article_no ON products(article_no);

-- Insert sample products (at least 30 items)
INSERT INTO products (article_no, name_en, name_sv, in_price, price, unit, in_stock, description_en, description_sv) VALUES
('ART-001', 'Office Chair', 'Kontorsstol', 450.00, 599.00, 'pcs', 25, 'Ergonomic office chair with lumbar support', 'Ergonomisk kontorsstol med ländryggsstöd'),
('ART-002', 'Desk Lamp', 'Skrivbordslampa', 120.00, 199.00, 'pcs', 50, 'LED desk lamp with adjustable brightness', 'LED-skrivbordslampa med justerbar ljusstyrka'),
('ART-003', 'Notebook', 'Anteckningsbok', 15.00, 29.00, 'pcs', 200, 'A4 size notebook with lined pages', 'A4-anteckningsbok med linjerade sidor'),
('ART-004', 'Pen Set', 'Pennset', 25.00, 49.00, 'set', 150, 'Set of 5 ballpoint pens in various colors', 'Set med 5 kulspetspennor i olika färger'),
('ART-005', 'Stapler', 'Häftapparat', 45.00, 79.00, 'pcs', 80, 'Heavy-duty stapler for office use', 'Tung häftapparat för kontorsbruk'),
('ART-006', 'Paper Clips', 'Gem', 8.00, 15.00, 'box', 300, 'Box of 100 metal paper clips', 'Låda med 100 metallgem'),
('ART-007', 'File Folder', 'Mapp', 12.00, 24.00, 'pcs', 180, 'A4 file folder with label tab', 'A4-mapp med etikettflik'),
('ART-008', 'Binder', 'Ringpärm', 35.00, 59.00, 'pcs', 120, 'A4 binder with 2-inch rings', 'A4-ringpärm med 5 cm ringar'),
('ART-009', 'Sticky Notes', 'Klisterlappar', 18.00, 35.00, 'pack', 250, 'Pack of 5 pads in assorted colors', 'Förpackning med 5 block i blandade färger'),
('ART-010', 'Calculator', 'Miniräknare', 85.00, 149.00, 'pcs', 60, 'Scientific calculator with LCD display', 'Vetenskaplig miniräknare med LCD-display'),
('ART-011', 'Keyboard', 'Tangentbord', 180.00, 299.00, 'pcs', 40, 'Mechanical keyboard with RGB lighting', 'Mekaniskt tangentbord med RGB-belysning'),
('ART-012', 'Mouse', 'Mus', 45.00, 79.00, 'pcs', 90, 'Wireless optical mouse', 'Trådlös optisk mus'),
('ART-013', 'Monitor Stand', 'Skärmstativ', 95.00, 159.00, 'pcs', 35, 'Adjustable monitor stand with cable management', 'Justerbart skärmstativ med kabelhantering'),
('ART-014', 'USB Cable', 'USB-kabel', 12.00, 24.00, 'pcs', 200, 'USB-A to USB-C cable, 1 meter', 'USB-A till USB-C-kabel, 1 meter'),
('ART-015', 'HDMI Cable', 'HDMI-kabel', 25.00, 49.00, 'pcs', 150, 'HDMI 2.0 cable, 2 meters', 'HDMI 2.0-kabel, 2 meter'),
('ART-016', 'Webcam', 'Webbkamera', 220.00, 349.00, 'pcs', 30, '1080p webcam with built-in microphone', '1080p webbkamera med inbyggd mikrofon'),
('ART-017', 'Headset', 'Hörlurar', 150.00, 249.00, 'pcs', 55, 'Noise-cancelling wireless headset', 'Brusreducerande trådlösa hörlurar'),
('ART-018', 'Desk Organizer', 'Skrivbordsorganisatör', 35.00, 59.00, 'pcs', 100, 'Multi-compartment desk organizer', 'Skrivbordsorganisatör med flera fack'),
('ART-019', 'Cable Management', 'Kabelhantering', 20.00, 39.00, 'pack', 180, 'Cable management clips and ties set', 'Kabelhanteringsklämmor och bindningar'),
('ART-020', 'Whiteboard', 'Whiteboard', 180.00, 299.00, 'pcs', 20, 'Magnetic whiteboard 120x90 cm', 'Magnetiskt whiteboard 120x90 cm'),
('ART-021', 'Whiteboard Markers', 'Whiteboardpennor', 15.00, 29.00, 'pack', 150, 'Set of 4 dry-erase markers', 'Set med 4 whiteboardpennor'),
('ART-022', 'Printer Paper', 'Skrivarpapper', 45.00, 79.00, 'ream', 120, 'A4 printer paper, 500 sheets', 'A4-skrivarpapper, 500 ark'),
('ART-023', 'Ink Cartridge', 'Bläckpatron', 120.00, 199.00, 'pcs', 80, 'Black ink cartridge for HP printers', 'Svart bläckpatron för HP-skrivare'),
('ART-024', 'Toner Cartridge', 'Tonerpatron', 280.00, 449.00, 'pcs', 45, 'Black toner cartridge for laser printers', 'Svart tonerpatron för laserskrivare'),
('ART-025', 'Envelope', 'Kuvert', 8.00, 15.00, 'pack', 500, 'Pack of 50 A4 envelopes', 'Förpackning med 50 A4-kuvert'),
('ART-026', 'Shipping Box', 'Fraktlåda', 25.00, 49.00, 'pcs', 200, 'Cardboard shipping box, medium size', 'Kartongfraktslåda, medelstor'),
('ART-027', 'Bubble Wrap', 'Bubblplast', 30.00, 59.00, 'roll', 80, 'Protective bubble wrap roll', 'Skyddsbubblplastrulle'),
('ART-028', 'Packing Tape', 'Förpackningstejp', 12.00, 24.00, 'roll', 300, 'Clear packing tape, 48mm width', 'Genomskinlig förpackningstejp, 48 mm bredd'),
('ART-029', 'Label Printer', 'Etikettskrivare', 450.00, 699.00, 'pcs', 15, 'Thermal label printer for shipping labels', 'Termisk etikettskrivare för fraktetiketter'),
('ART-030', 'Label Paper', 'Etikettpapper', 35.00, 59.00, 'roll', 100, 'Thermal label paper roll, 100 labels', 'Termisk etikettpappersrulle, 100 etiketter'),
('ART-031', 'Storage Box', 'Förvaringslåda', 40.00, 69.00, 'pcs', 150, 'Plastic storage box with lid, 30L', 'Plastförvaringslåda med lock, 30 liter'),
('ART-032', 'Archive Box', 'Arkivlåda', 55.00, 89.00, 'pcs', 90, 'Cardboard archive box for documents', 'Kartongarkivlåda för dokument'),
('ART-033', 'Shredder', 'Saxmaskin', 320.00, 499.00, 'pcs', 25, 'Cross-cut paper shredder', 'Korsklippande saxmaskin'),
('ART-034', 'Laminator', 'Lamineringsmaskin', 180.00, 299.00, 'pcs', 30, 'A4 laminator with pouches', 'A4-lamineringsmaskin med fickor'),
('ART-035', 'Laminating Pouches', 'Lamineringsfickor', 25.00, 49.00, 'pack', 200, 'Pack of 100 A4 laminating pouches', 'Förpackning med 100 A4-lamineringsfickor')
ON CONFLICT (article_no) DO NOTHING;

