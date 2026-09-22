-- +goose Up
-- ==============================================================================
-- Seed default Banners (Hero and Promo)
-- ==============================================================================

INSERT INTO banners (title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active) VALUES
('Apple iPhone 16 Pro Max', 'Aerospace-grade titanium, breakthrough A18 Pro chip, and pro camera system with 5x optical telephoto.', 'Flagship Launch', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', '/products/apple-iphone-16-pro-max-256gb', 'Shop iPhone 16 Pro', '/products/apple-iphone-16-pro-max-256gb', 'hero', 0, true),
('MacBook Pro 16-inch M3 Max', 'Astronomical performance for 3D rendering and machine learning with Liquid Retina XDR and up to 22h battery.', 'Pro Choice', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', '/products/macbook-pro-16-inch-m3-max', 'Explore MacBook', '/products/macbook-pro-16-inch-m3-max', 'hero', 1, true),
('Premium Hi-Fi Audio Festival', 'Immersive acoustic perfection with Sony WH-1000XM5 and Bose QuietComfort Ultra noise-canceling headphones.', 'Up to 25% OFF', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', '/products?category_id=3', 'Discover Audio', '/products?category_id=3', 'hero', 2, true),
('PlayStation 5 Pro & Elite Gaming', 'Ultra-high-definition 4K 120Hz gaming, PlayStation Spectral Super Resolution (PSSR), and lightning-fast 2TB SSD.', 'Next-Gen Gaming', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80', '/products/sony-playstation-5-pro-console', 'Order PS5 Pro', '/products/sony-playstation-5-pro-console', 'hero', 3, true);

INSERT INTO banners (title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active) VALUES
('Apple Ecosystem', 'iPhone 16 Pro, MacBook Pro M3 & Ultra 2', 'Special Cashback', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80', '/products?category_id=1', 'Explore Apple', '/products?category_id=1', 'promo', 0, true),
('Galaxy AI Era', 'Galaxy S24 Ultra with intelligent S Pen', 'Free Express', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80', '/products?category_id=1', 'Shop Galaxy AI', '/products?category_id=1', 'promo', 1, true),
('Pro Gaming Battlestation', 'PlayStation 5 Pro & Keychron Wireless', 'Gold Warranty', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80', '/products?category_id=5', 'Game On', '/products?category_id=5', 'promo', 2, true),
('Studio Sound Experience', 'Sony & Bose active noise cancellation', 'Original Hi-Fi', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', '/products?category_id=3', 'Listen Now', '/products?category_id=3', 'promo', 3, true);

-- +goose Down
-- ==============================================================================
-- Revert seeded banners
-- ==============================================================================

DELETE FROM banners WHERE type IN ('hero', 'promo');
