-- Seed Migration Script for Initial Sarees and Suits
-- Version: 20260820000002

INSERT INTO products (id, name, category, selling_price, cost_price, original_price, discount_percent, status) VALUES
('SAR-00001', 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece', 'Saree', 1299.00, 750.00, 3899.00, 67.00, 'ACTIVE'),
('SAR-00002', 'Black Woven Design Banarsi Silk Blend Saree', 'Saree', 1349.00, 800.00, 4249.00, 68.00, 'ACTIVE'),
('SAR-00003', 'Mustard Printed Silk Blend Saree With Zari Border', 'Saree', 999.00, 550.00, 3449.00, 71.00, 'ACTIVE'),
('SAR-00004', 'Burgundy Solid Satin Saree With Embellished Border', 'Saree', 979.00, 500.00, 2949.00, 67.00, 'ACTIVE'),
('SUIT-00001', 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta', 'Suit', 1899.00, 1100.00, 4999.00, 62.00, 'ACTIVE'),
('SUIT-00002', 'Emerald Green Anarkali Cotton Suit Set', 'Suit', 1699.00, 950.00, 3999.00, 57.00, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
  selling_price = EXCLUDED.selling_price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent;

INSERT INTO product_attributes (product_id, color, fabric, style, pattern, occasion, size, blouse_details) VALUES
('SAR-00001', 'Pink', 'Chiffon', 'Traditional', 'Pochampally Ikkat', 'Festive', 'ONESIZE', 'Unstitched'),
('SAR-00002', 'Black', 'Banarsi Silk Blend', 'Classic', 'Woven Design', 'Wedding / Party', 'ONESIZE', 'Unstitched'),
('SAR-00003', 'Mustard', 'Silk Blend', 'Ethnic', 'Printed', 'Casual / Festive', 'ONESIZE', 'Unstitched'),
('SAR-00004', 'Burgundy', 'Satin', 'Modern Ethnic', 'Solid', 'Evening Party', 'ONESIZE', 'Embellished'),
('SUIT-00001', 'Blue', 'Chanderi Silk', 'Straight', 'Embroidery', 'Festive', 'M', 'Full Dupatta Included'),
('SUIT-00002', 'Green', 'Cotton', 'Anarkali', 'Printed', 'Casual', 'L', 'Matching Dupatta Included')
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
('SAR-00001', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('SAR-00001', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', FALSE, 2),
('SAR-00002', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('SAR-00003', 'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('SAR-00004', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('SUIT-00001', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', TRUE, 1),
('SUIT-00002', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', TRUE, 1)
ON CONFLICT DO NOTHING;

INSERT INTO inventory (product_id, quantity, min_alert_threshold) VALUES
('SAR-00001', 12, 3),
('SAR-00002', 8, 2),
('SAR-00003', 15, 4),
('SAR-00004', 5, 2),
('SUIT-00001', 10, 3),
('SUIT-00002', 14, 3)
ON CONFLICT (product_id) DO NOTHING;
