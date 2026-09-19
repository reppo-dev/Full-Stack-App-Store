package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
)

type CategorySeed struct {
	Name string
	Slug string
}

type ProductSeed struct {
	Title        string
	Slug         string
	Description  string
	Price        float64
	Stock        int
	Rating       float64
	CategorySlug string
	SKU          string
	Images       []string
}

func main() {
	_ = godotenv.Load("../../.env")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = "13802002"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "app_store"
	}
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "disable"
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPass, dbName, sslMode)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to postgres: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}

	ctx := context.Background()
	fmt.Println("🚀 Seeding DashStack database...")

	// 1. Seed Roles
	_, _ = db.ExecContext(ctx, `
		INSERT INTO roles (id, name, created_at, updated_at)
		VALUES 
			(1, 'customer', NOW(), NOW()),
			(2, 'admin', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING;
	`)

	// 2. Seed Default Admin and Customer Users
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	var adminID, customerID int64

	err = db.QueryRowContext(ctx, `
		INSERT INTO users (first_name, last_name, user_name, email, password, role_id, created_at, updated_at)
		VALUES ('System', 'Administrator', 'admin', 'admin@appstore.com', $1, 2, NOW(), NOW())
		ON CONFLICT (email) DO UPDATE SET password = $1, role_id = 2
		RETURNING id
	`, string(hashedPassword)).Scan(&adminID)
	if err != nil {
		log.Printf("Admin insert warning: %v", err)
	}

	err = db.QueryRowContext(ctx, `
		INSERT INTO users (first_name, last_name, user_name, email, password, role_id, created_at, updated_at)
		VALUES ('John', 'Doe', 'johndoe', 'customer@appstore.com', $1, 1, NOW(), NOW())
		ON CONFLICT (email) DO UPDATE SET password = $1, role_id = 1
		RETURNING id
	`, string(hashedPassword)).Scan(&customerID)
	if err != nil {
		log.Printf("Customer insert warning: %v", err)
	}

	fmt.Printf("✓ Users ready (Admin ID: %d, Customer ID: %d)\n", adminID, customerID)

	// 3. Seed Categories
	categories := []CategorySeed{
		{Name: "Smartphones & Tablets", Slug: "smartphones-tablets"},
		{Name: "Laptops & Computers", Slug: "laptops-computers"},
		{Name: "Audio & Headphones", Slug: "audio-headphones"},
		{Name: "Wearable Tech", Slug: "wearable-tech"},
		{Name: "Gaming & Accessories", Slug: "gaming-accessories"},
	}

	catMap := make(map[string]int64)
	for _, c := range categories {
		var catID int64
		err := db.QueryRowContext(ctx, `
			INSERT INTO categories (name, slug, created_at, updated_at)
			VALUES ($1, $2, NOW(), NOW())
			ON CONFLICT (slug) DO UPDATE SET name = $1, updated_at = NOW()
			RETURNING id
		`, c.Name, c.Slug).Scan(&catID)
		if err != nil {
			log.Fatalf("Failed to seed category %s: %v", c.Name, err)
		}
		catMap[c.Slug] = catID
		fmt.Printf("✓ Category ready: %s (ID: %d)\n", c.Name, catID)
	}

	// 4. Seed Products
	products := []ProductSeed{
		{
			Title:        "Apple iPhone 16 Pro Max (256GB)",
			Slug:         "apple-iphone-16-pro-max-256gb",
			Description:  "Featuring an aerospace-grade titanium design, Super Retina XDR display with ProMotion, and the groundbreaking A18 Pro chip. Includes 48MP Fusion camera with 5x Telephoto zoom and Camera Control button.",
			Price:        1199.00,
			Stock:        45,
			Rating:       4.9,
			CategorySlug: "smartphones-tablets",
			SKU:          "IPH16PM-256-TI",
			Images: []string{
				"https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
				"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Samsung Galaxy S24 Ultra (512GB)",
			Slug:         "samsung-galaxy-s24-ultra-512gb",
			Description:  "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Powered by Galaxy AI, 200MP quad telephoto camera, and integrated S Pen.",
			Price:        1299.99,
			Stock:        30,
			Rating:       4.8,
			CategorySlug: "smartphones-tablets",
			SKU:          "SGS24U-512-GRY",
			Images: []string{
				"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Apple iPad Pro 13-inch M4",
			Slug:         "apple-ipad-pro-13-inch-m4",
			Description:  "The impossibly thin design features the groundbreaking Ultra Retina XDR display, outrageous performance from the Apple M4 chip, and superfast wireless connectivity.",
			Price:        1299.00,
			Stock:        25,
			Rating:       4.9,
			CategorySlug: "smartphones-tablets",
			SKU:          "IPADP13-M4-256",
			Images: []string{
				"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "MacBook Pro 16-inch M3 Max",
			Slug:         "macbook-pro-16-inch-m3-max",
			Description:  "Mind-blowing performance. Up to 22 hours of battery life. Liquid Retina XDR display with up to 1600 nits peak brightness. Includes 36GB unified memory and 1TB ultra-fast SSD storage.",
			Price:        3499.00,
			Stock:        18,
			Rating:       5.0,
			CategorySlug: "laptops-computers",
			SKU:          "MBP16-M3MAX-BLK",
			Images: []string{
				"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
				"https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Dell XPS 15 OLED Gaming Laptop",
			Slug:         "dell-xps-15-oled-laptop",
			Description:  "Precision crafted with machined aluminum and carbon fiber. Packed with 13th Gen Intel Core i9, NVIDIA GeForce RTX 4070 graphics, and a stunning 3.5K OLED InfinityEdge touch screen.",
			Price:        2299.00,
			Stock:        14,
			Rating:       4.7,
			CategorySlug: "laptops-computers",
			SKU:          "DXPS15-I9-4070",
			Images: []string{
				"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Sony WH-1000XM5 Wireless Headphones",
			Slug:         "sony-wh-1000xm5-wireless-headphones",
			Description:  "Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes noise canceling based on wearing conditions and environment. 30-hour battery.",
			Price:        399.99,
			Stock:        60,
			Rating:       4.8,
			CategorySlug: "audio-headphones",
			SKU:          "SONY-WHXM5-SLV",
			Images: []string{
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Bose QuietComfort Ultra Earbuds",
			Slug:         "bose-quietcomfort-ultra-earbuds",
			Description:  "Breakthrough spatialized audio for more immersive listening that makes your music feel realer than ever. World-class active noise cancellation with CustomTune technology.",
			Price:        299.00,
			Stock:        40,
			Rating:       4.6,
			CategorySlug: "audio-headphones",
			SKU:          "BOSE-QCU-BLK",
			Images: []string{
				"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Apple Watch Ultra 2 (49mm Titanium)",
			Slug:         "apple-watch-ultra-2-titanium",
			Description:  "The most rugged and capable Apple Watch. Designed for outdoor endurance, exploration, and water sports. Features a lightweight titanium case, up to 72 hours in Low Power Mode, and 3000 nits display.",
			Price:        799.00,
			Stock:        35,
			Rating:       4.9,
			CategorySlug: "wearable-tech",
			SKU:          "AW-ULTRA2-OCEAN",
			Images: []string{
				"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Sony PlayStation 5 Pro Console",
			Slug:         "sony-playstation-5-pro-console",
			Description:  "PlayStation Spectral Super Resolution (PSSR) AI-enhanced upscaling, advanced ray tracing with extraordinary clarity on 4K TVs, and 2TB high-speed NVMe SSD storage built-in.",
			Price:        699.99,
			Stock:        20,
			Rating:       4.9,
			CategorySlug: "gaming-accessories",
			SKU:          "PS5-PRO-2TB",
			Images: []string{
				"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Keychron Q1 Pro Wireless Mechanical Keyboard",
			Slug:         "keychron-q1-pro-wireless-keyboard",
			Description:  "Full metal custom wireless mechanical keyboard with double-gasket design, screw-in stabs, hot-swappable Keychron K Pro Banana Switches, RGB backlighting, and programmable rotary knob.",
			Price:        199.00,
			Stock:        50,
			Rating:       4.7,
			CategorySlug: "gaming-accessories",
			SKU:          "KEY-Q1PRO-WHT",
			Images: []string{
				"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
			},
		},
		{
			Title:        "Logitech MX Master 3S Wireless Mouse",
			Slug:         "logitech-mx-master-3s-mouse",
			Description:  "An icon remastered with Quiet Clicks and 8,000 DPI track-on-glass sensor for exquisite feel, precision, and performance. MagSpeed Electromagnetic scrolling scrolls 1,000 lines per second.",
			Price:        99.99,
			Stock:        75,
			Rating:       4.8,
			CategorySlug: "gaming-accessories",
			SKU:          "LOGI-MXM3S-PLT",
			Images: []string{
				"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80",
			},
		},
	}

	var seededProductIDs []int64

	for _, p := range products {
		catID := catMap[p.CategorySlug]
		imagesJSON, _ := json.Marshal(p.Images)

		var prodID int64
		err := db.QueryRowContext(ctx, `
			INSERT INTO products (title, slug, description, price, stock, rating, images, category_id, sku, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, true, NOW(), NOW())
			ON CONFLICT (slug) DO UPDATE SET 
				title = $1,
				description = $3,
				price = $4,
				stock = $5,
				rating = $6,
				images = $7::jsonb,
				category_id = $8,
				is_active = true,
				updated_at = NOW()
			RETURNING id
		`, p.Title, p.Slug, p.Description, p.Price, p.Stock, p.Rating, string(imagesJSON), catID, p.SKU).Scan(&prodID)

		if err != nil {
			log.Fatalf("Failed to seed product %s: %v", p.Title, err)
		}
		seededProductIDs = append(seededProductIDs, prodID)
		fmt.Printf("✓ Product ready: %s ($%.2f, Stock: %d, ID: %d)\n", p.Title, p.Price, p.Stock, prodID)
	}

	// 5. Seed Sample Orders so Dashboard Metrics immediately look alive
	if customerID > 0 && len(seededProductIDs) >= 3 {
		fmt.Println("🛒 Seeding sample orders for executive analytics...")

		// Sample Order 1: Delivered
		var order1ID int64
		err = db.QueryRowContext(ctx, `
			INSERT INTO orders (user_id, first_name, last_name, email, total, status, address, phone_number, created_at, updated_at)
			VALUES ($1, 'John', 'Doe', 'customer@appstore.com', 1598.99, 'delivered', '742 Evergreen Terrace, Springfield', '+15550199', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days')
			RETURNING id
		`, customerID).Scan(&order1ID)
		if err == nil {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO order_items (order_id, product_id, product_title, price, quantity)
				VALUES 
					($1, $2, 'Apple iPhone 16 Pro Max (256GB)', 1199.00, 1),
					($1, $3, 'Sony WH-1000XM5 Wireless Headphones', 399.99, 1)
			`, order1ID, seededProductIDs[0], seededProductIDs[5])
		}

		// Sample Order 2: Delivered
		var order2ID int64
		err = db.QueryRowContext(ctx, `
			INSERT INTO orders (user_id, first_name, last_name, email, total, status, address, phone_number, created_at, updated_at)
			VALUES ($1, 'Alice', 'Smith', 'alice.smith@example.com', 3499.00, 'delivered', '120 Market St, San Francisco, CA', '+15550244', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
			RETURNING id
		`, customerID).Scan(&order2ID)
		if err == nil {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO order_items (order_id, product_id, product_title, price, quantity)
				VALUES ($1, $2, 'MacBook Pro 16-inch M3 Max', 3499.00, 1)
			`, order2ID, seededProductIDs[3])
		}

		// Sample Order 3: Pending
		var order3ID int64
		err = db.QueryRowContext(ctx, `
			INSERT INTO orders (user_id, first_name, last_name, email, total, status, address, phone_number, created_at, updated_at)
			VALUES ($1, 'Michael', 'Scott', 'michael.scott@dunder.com', 898.99, 'pending', '1725 Slough Ave, Scranton, PA', '+15550388', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours')
			RETURNING id
		`, customerID).Scan(&order3ID)
		if err == nil {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO order_items (order_id, product_id, product_title, price, quantity)
				VALUES 
					($1, $2, 'Apple Watch Ultra 2 (49mm Titanium)', 799.00, 1),
					($1, $3, 'Logitech MX Master 3S Wireless Mouse', 99.99, 1)
			`, order3ID, seededProductIDs[7], seededProductIDs[10])
		}

		fmt.Println("✓ Sample orders & order items created successfully")
	}

	// 6. Seed Sample Support Tickets
	if customerID > 0 {
		fmt.Println("💬 Seeding sample support tickets...")

		var ticket1ID int64
		err = db.QueryRowContext(ctx, `
			INSERT INTO tickets (user_id, subject, status, priority, category, created_at, updated_at)
			VALUES ($1, 'Inquiry regarding Apple Care warranty coverage', 'open', 'medium', 'General Support', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours')
			RETURNING id
		`, customerID).Scan(&ticket1ID)
		if err == nil {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal, created_at)
				VALUES 
					($1, $2, 'Hi, does the iPhone 16 Pro Max come with standard 1-year Apple warranty or do I need to register it separately?', false, NOW() - INTERVAL '6 hours'),
					($1, $3, 'Verified customer order. We can provide AppleCare registration link upon request.', true, NOW() - INTERVAL '5 hours')
			`, ticket1ID, customerID, adminID)
		}

		var ticket2ID int64
		err = db.QueryRowContext(ctx, `
			INSERT INTO tickets (user_id, subject, status, priority, category, created_at, updated_at)
			VALUES ($1, 'Tracking number update for MacBook Pro order', 'in_progress', 'high', 'Order Issues', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours')
			RETURNING id
		`, customerID).Scan(&ticket2ID)
		if err == nil {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal, created_at)
				VALUES 
					($1, $2, 'Hello support team! Could you please provide the FedEx tracking number for my order?', false, NOW() - INTERVAL '1 day'),
					($1, $3, 'Hello John! Your package has been dispatched via FedEx Express tracking #449210984.', false, NOW() - INTERVAL '2 hours')
			`, ticket2ID, customerID, adminID)
		}

		fmt.Println("✓ Sample tickets and conversation threads created successfully")
	}

	fmt.Println("🎉 Database seeding completed successfully!")
}
