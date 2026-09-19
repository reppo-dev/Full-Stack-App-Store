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
	Colors       []string
	Attributes   map[string]string
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
				"https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Natural Titanium", "Desert Titanium", "White Titanium", "Black Titanium"},
			Attributes: map[string]string{
				"Display":      "6.9-inch Super Retina XDR OLED, 120Hz ProMotion",
				"Processor":    "Apple A18 Pro (3nm architecture)",
				"Storage":      "256GB NVMe High-Speed Storage",
				"RAM":          "8GB Unified Memory",
				"Camera":       "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto",
				"Battery":      "Up to 33 hours video playback",
				"Connectivity": "5G, Wi-Fi 7, Bluetooth 5.3, USB-C 3.2 (10Gbps)",
				"Warranty":     "1 Year Official Apple Warranty",
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
				"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Titanium Gray", "Titanium Black", "Titanium Violet", "Titanium Yellow"},
			Attributes: map[string]string{
				"Display":      "6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz",
				"Processor":    "Qualcomm Snapdragon 8 Gen 3 for Galaxy",
				"Storage":      "512GB UFS 4.0 Storage",
				"RAM":          "12GB LPDDR5X",
				"Camera":       "200MP Main + 50MP Periscope 5x + 10MP 3x + 12MP Ultra Wide",
				"Stylus":       "Integrated S Pen with Bluetooth LE",
				"Battery":      "5000 mAh with 45W Fast Charging",
				"Warranty":     "18 Months Official Samsung Warranty",
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
				"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Space Black", "Silver"},
			Attributes: map[string]string{
				"Display":     "13-inch Tandem OLED Ultra Retina XDR",
				"Processor":   "Apple M4 Chip (9-core CPU, 10-core GPU)",
				"Storage":     "256GB High-Speed SSD",
				"Thickness":   "5.1mm (Thinnest Apple device ever)",
				"Accessories": "Apple Pencil Pro & Magic Keyboard compatible",
				"Warranty":    "1 Year Official Apple Warranty",
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
				"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Space Black", "Silver"},
			Attributes: map[string]string{
				"Display":   "16.2-inch Liquid Retina XDR, 1600 nits peak",
				"Processor": "Apple M3 Max (16-core CPU, 40-core GPU)",
				"Memory":    "36GB Unified Memory",
				"Storage":   "1TB PCIe Gen4 SSD",
				"Battery":   "Up to 22 hours Apple TV app movie playback",
				"Ports":     "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3",
				"Warranty":  "1 Year Official Apple Warranty",
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
				"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Platinum Silver with Black Carbon Fiber"},
			Attributes: map[string]string{
				"Display":   "15.6-inch 3.5K (3456x2160) OLED Touch Display",
				"Processor": "Intel Core i9-13900H (14 cores, up to 5.4GHz)",
				"Graphics":  "NVIDIA GeForce RTX 4070 8GB GDDR6",
				"Memory":    "32GB DDR5 4800MHz",
				"Storage":   "1TB M.2 PCIe NVMe SSD",
				"Warranty":  "2 Years Dell ProSupport",
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
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Black", "Silver", "Midnight Blue"},
			Attributes: map[string]string{
				"Driver Unit":        "30mm precision-engineered Carbon Fiber",
				"Noise Cancellation": "Auto NC Optimizer with 8 microphones",
				"Battery Life":       "30 hours with ANC on (3-min charge gives 3 hours)",
				"Codec Support":      "LDAC, AAC, SBC, Hi-Res Audio Wireless",
				"Weight":             "250g Ultra-lightweight",
				"Warranty":           "1 Year Official Sony Warranty",
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
				"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Black", "White Smoke", "Moonstone Blue"},
			Attributes: map[string]string{
				"Audio":              "Bose Immersive Audio (Spatial Sound)",
				"Noise Cancellation": "CustomTune World-Class ANC",
				"Battery":            "Up to 6 hours (24 hours total with case)",
				"Water Resistance":   "IPX4 sweat & weather resistant",
				"Warranty":           "1 Year Official Bose Warranty",
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
				"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Natural Titanium (Ocean Band)", "Natural Titanium (Alpine Loop)"},
			Attributes: map[string]string{
				"Case Size":        "49mm Aerospace-grade Titanium",
				"Display":          "Always-On Retina display, up to 3000 nits",
				"Chip":             "S9 SiP with 4-core Neural Engine",
				"Sensors":          "Dual-frequency GPS, Depth gauge, ECG, Blood Oxygen",
				"Water Resistance": "100m water resistant, EN13319 dive certified",
				"Battery Life":     "Up to 36 hours (72 hours Low Power Mode)",
				"Warranty":         "1 Year Official Apple Warranty",
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
				"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Signature Matte White & Black"},
			Attributes: map[string]string{
				"GPU":          "Advanced AMD RDNA ray tracing architecture",
				"AI Upscaling": "PlayStation Spectral Super Resolution (PSSR)",
				"Storage":      "2TB Ultra-High Speed NVMe SSD",
				"Resolution":   "Native 4K at 60Hz and 120Hz with VRR",
				"Controller":   "DualSense Wireless Controller with Haptic Feedback",
				"Warranty":     "1 Year Sony PlayStation Warranty",
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
				"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Carbon Black", "Shell White", "Silver Grey"},
			Attributes: map[string]string{
				"Layout":       "75% ANSI layout with programmable knob",
				"Connectivity": "Bluetooth 5.1 & Type-C wired (1000Hz polling)",
				"Switches":     "Hot-swappable Keychron K Pro Banana / Red",
				"Case":         "Full CNC-machined 6063 Aluminum",
				"Firmware":     "QMK/VIA Open Source Programmable",
				"Battery":      "4000 mAh rechargeable Li-polymer",
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
				"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80",
				"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
			},
			Colors: []string{"Graphite", "Pale Grey"},
			Attributes: map[string]string{
				"Sensor":       "Darkfield 8000 DPI track-on-glass",
				"Scroll Wheel": "MagSpeed Electromagnetic (1000 lines/sec)",
				"Clicks":       "Quiet Clicks (90% noise reduction)",
				"Multi-Device": "Easy-Switch up to 3 devices across Mac/Windows",
				"Battery":      "Up to 70 days on full charge (USB-C quick charge)",
			},
		},
	}

	var seededProductIDs []int64

	for _, p := range products {
		catID := catMap[p.CategorySlug]
		imagesJSON, _ := json.Marshal(p.Images)
		colorsJSON, _ := json.Marshal(p.Colors)
		attributesJSON, _ := json.Marshal(p.Attributes)

		var prodID int64
		err := db.QueryRowContext(ctx, `
			INSERT INTO products (title, slug, description, price, stock, rating, images, colors, attributes, category_id, sku, is_active, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, true, NOW(), NOW())
			ON CONFLICT (slug) DO UPDATE SET 
				title = $1,
				description = $3,
				price = $4,
				stock = $5,
				rating = $6,
				images = $7::jsonb,
				colors = $8::jsonb,
				attributes = $9::jsonb,
				category_id = $10,
				sku = $11,
				is_active = true,
				updated_at = NOW()
			RETURNING id
		`, p.Title, p.Slug, p.Description, p.Price, p.Stock, p.Rating, string(imagesJSON), string(colorsJSON), string(attributesJSON), catID, p.SKU).Scan(&prodID)

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

	// 7. Seed Dynamic Banners (Hero & Promo)
	fmt.Println("🎨 Seeding promotional and hero storefront banners...")
	bannersSQL := `
		INSERT INTO banners (title, subtitle, badge, image_url, link_url, cta_text, cta_link, type, position, is_active, created_at, updated_at)
		VALUES
			(
				'Apple iPhone 16 Pro Max',
				'Titanium design with A18 Pro chip, 48MP Fusion camera, and 5x Telephoto zoom.',
				'Latest Flagship',
				'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
				'/products/apple-iphone-16-pro-max-256gb',
				'Shop iPhone 16 Pro',
				'/products/apple-iphone-16-pro-max-256gb',
				'hero',
				0,
				true,
				NOW(),
				NOW()
			),
			(
				'MacBook Pro 16-inch M3 Max',
				'Extreme computing performance with Liquid Retina XDR display and 22-hour battery life.',
				'Pro Performance',
				'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
				'/products/macbook-pro-16-inch-m3-max',
				'Explore MacBook',
				'/products/macbook-pro-16-inch-m3-max',
				'hero',
				1,
				true,
				NOW(),
				NOW()
			),
			(
				'Premium Hi-Fi Audio Festival',
				'Silence the world with Sony WH-1000XM5 and Bose QuietComfort Ultra noise-canceling headphones.',
				'Up to 20% Off',
				'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
				'/products?category_id=3',
				'Discover Audio',
				'/products?category_id=3',
				'hero',
				2,
				true,
				NOW(),
				NOW()
			),
			(
				'PlayStation 5 Pro & Elite Gaming',
				'Next-gen ray tracing, PSSR AI upscaling, and 2TB high-speed NVMe storage.',
				'Gamer Choice',
				'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80',
				'/products/sony-playstation-5-pro-console',
				'Order PS5 Pro',
				'/products/sony-playstation-5-pro-console',
				'hero',
				3,
				true,
				NOW(),
				NOW()
			),
			(
				'Apple Ecosystem',
				'iPhone 16 Pro, MacBook Pro M3, and Apple Watch Ultra 2.',
				'Special Bundle Deal',
				'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
				'/products?category_id=1',
				'Explore Apple',
				'/products?category_id=1',
				'promo',
				0,
				true,
				NOW(),
				NOW()
			),
			(
				'Galaxy AI Era',
				'Samsung Galaxy S24 Ultra with titanium armor and built-in S Pen.',
				'Free Express Shipping',
				'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
				'/products/samsung-galaxy-s24-ultra-512gb',
				'Shop Galaxy AI',
				'/products/samsung-galaxy-s24-ultra-512gb',
				'promo',
				1,
				true,
				NOW(),
				NOW()
			),
			(
				'Pro Gaming Battlestation',
				'PS5 Pro, Keychron mechanical keyboards, and Dell XPS laptops.',
				'Official Warranty',
				'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
				'/products?category_id=5',
				'Game On',
				'/products?category_id=5',
				'promo',
				2,
				true,
				NOW(),
				NOW()
			),
			(
				'Studio Sound Experience',
				'Immerse in pure acoustic fidelity with Bose & Sony headphones.',
				'100% Genuine',
				'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
				'/products?category_id=3',
				'Listen Now',
				'/products?category_id=3',
				'promo',
				3,
				true,
				NOW(),
				NOW()
			);
	`
	_, err = db.ExecContext(ctx, bannersSQL)
	if err != nil {
		log.Printf("Banners seeding notice: %v", err)
	} else {
		fmt.Println("✓ Default hero and promo banners seeded successfully")
	}

	fmt.Println("🎉 Database seeding completed successfully!")
}
