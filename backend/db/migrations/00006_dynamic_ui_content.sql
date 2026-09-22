-- +goose Up
-- ==============================================================================
-- 1. Alter Categories Table
-- ==============================================================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing categories (if any) with placeholder images
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80' WHERE id = 1;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' WHERE id = 2;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' WHERE id = 3;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' WHERE id = 4;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80' WHERE id = 5;

-- ==============================================================================
-- 2. Brands Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(120),
    href VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO brands (name, category, href) VALUES
('Apple', 'iOS & Mac', '/products?search=Apple'),
('Samsung', 'Galaxy & AI', '/products?search=Samsung'),
('Sony', 'Audio & PS5', '/products?search=Sony'),
('Bose', 'Acoustics', '/products?search=Bose'),
('Dell', 'XPS Laptops', '/products?search=Dell'),
('Logitech', 'Peripherals', '/products?search=Logitech'),
('Keychron', 'Keyboards', '/products?search=Keychron'),
('Nintendo', 'Consoles', '/products?search=Nintendo')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 3. Stories Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS stories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    badge VARCHAR(50),
    category VARCHAR(100),
    image_url TEXT NOT NULL,
    link_url VARCHAR(255),
    button_text VARCHAR(100),
    gradient_class VARCHAR(100),
    icon_name VARCHAR(50),
    featured_price VARCHAR(100),
    is_active BOOLEAN DEFAULT true
);

INSERT INTO stories (title, subtitle, badge, category, image_url, link_url, button_text, gradient_class, icon_name, featured_price) VALUES
('Superfast Same-Day Delivery', 'Order before 2:00 PM and receive your favorite electronics at your doorstep today with priority dispatch.', 'EXPRESS', 'Express Shipping', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80', '/products', 'Shop Same-Day Items', 'from-amber-400 to-orange-500', 'Zap', 'Free on $50+'),
('Today''s Incredible Offers', 'Huge price drops on flagship smartphones, ultrabooks, and studio wireless headphones.', 'FLASH DEAL', 'Incredible Deals', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80', '#incredible-offers', 'See Flash Deals', 'from-rose-500 to-red-600', 'Tag', 'Up to 45% OFF'),
('Next-Gen Mobile Flagships', 'Explore iPhone 16 Pro Max, Samsung Galaxy S24 Ultra, and iPad Pro M4 with cutting-edge AI.', 'NEW ARRIVALS', 'Smartphones', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80', '/products?category_id=1', 'Explore Phones', 'from-blue-500 to-indigo-600', 'Smartphone', 'From $799'),
('Ultra-Performance Laptops', 'Power through intense workloads with M3 Max MacBook Pros and RTX 40-series gaming laptops.', 'PROFESSIONAL', 'Computing', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80', '/products?category_id=2', 'Shop Laptops', 'from-slate-700 to-zinc-900', 'Laptop', 'Save up to $200'),
('High-Fidelity Audio', 'Immersive spatial audio and industry-leading noise cancellation from Sony, Bose, and Apple.', 'PREMIUM SOUND', 'Audio & Music', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', '/products?category_id=3', 'Discover Audio', 'from-emerald-400 to-teal-600', 'Headphones', 'Top Rated'),
('Wearables & Fitness', 'Track your health, ECG, and workouts with the new Apple Watch Ultra 2 and Galaxy Watch 6.', 'LIFESTYLE', 'Smart Watches', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', '/products?category_id=4', 'Shop Watches', 'from-fuchsia-500 to-purple-600', 'Watch', 'New Styles'),
('Console & PC Gaming', 'Dominate the lobby with PS5 Pro, Xbox Series X, and hyper-fast mechanical keyboards.', 'GAMER ZONE', 'Gaming', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80', '/products?category_id=5', 'Enter the Zone', 'from-violet-600 to-purple-800', 'Gamepad2', 'Console Bundles'),
('Perfect Tech Gifts', 'Curated electronics bundles and digital gift cards for every budget and occasion.', 'GIFTING', 'Gift Cards', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80', '/products', 'Find Gifts', 'from-pink-500 to-rose-500', 'Gift', 'From $25')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 4. Banners Data (If empty)
-- ==============================================================================
INSERT INTO banners (title, subtitle, badge, cta_text, link_url, cta_link, image_url, type, position, is_active) VALUES
('Apple iPhone 16 Pro Max', 'Aerospace-grade titanium, breakthrough A18 Pro chip, and pro camera system with 5x optical telephoto.', 'Flagship Launch', 'Shop iPhone 16 Pro', '/products/apple-iphone-16-pro-max-256gb', '/products/apple-iphone-16-pro-max-256gb', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', 'hero', 0, true),
('MacBook Pro 16-inch M3 Max', 'Astronomical performance for 3D rendering and machine learning with Liquid Retina XDR and up to 22h battery.', 'Pro Choice', 'Explore MacBook', '/products/macbook-pro-16-inch-m3-max', '/products/macbook-pro-16-inch-m3-max', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', 'hero', 1, true),
('Premium Hi-Fi Audio Festival', 'Immersive acoustic perfection with Sony WH-1000XM5 and Bose QuietComfort Ultra noise-canceling headphones.', 'Up to 25% OFF', 'Discover Audio', '/products?category_id=3', '/products?category_id=3', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', 'hero', 2, true),
('PlayStation 5 Pro & Elite Gaming', 'Ultra-high-definition 4K 120Hz gaming, PlayStation Spectral Super Resolution (PSSR), and lightning-fast 2TB SSD.', 'Next-Gen Gaming', 'Order PS5 Pro', '/products/sony-playstation-5-pro-console', '/products/sony-playstation-5-pro-console', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80', 'hero', 3, true),
('Apple Ecosystem', 'iPhone 16 Pro, MacBook Pro M3 & Ultra 2', 'Special Cashback', 'Explore Apple', '/products?category_id=1', '/products?category_id=1', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80', 'promo', 0, true),
('Galaxy AI Era', 'Galaxy S24 Ultra with intelligent S Pen', 'Free Express', 'Shop Galaxy AI', '/products?category_id=1', '/products?category_id=1', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80', 'promo', 1, true),
('Pro Gaming Battlestation', 'PlayStation 5 Pro & Keychron Wireless', 'Gold Warranty', 'Game On', '/products?category_id=5', '/products?category_id=5', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80', 'promo', 2, true),
('Studio Sound Experience', 'Sony & Bose active noise cancellation', 'Original Hi-Fi', 'Listen Now', '/products?category_id=3', '/products?category_id=3', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', 'promo', 3, true)
ON CONFLICT DO NOTHING;

-- +goose Down
DROP TABLE IF EXISTS stories;
DROP TABLE IF EXISTS brands;
ALTER TABLE categories DROP COLUMN IF EXISTS image_url;
