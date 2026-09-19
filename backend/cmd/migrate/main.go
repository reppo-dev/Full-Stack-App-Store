package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load("../../.env")

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" { dbHost = "localhost" }
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" { dbPort = "5432" }
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" { dbUser = "postgres" }
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" { dbPass = "13802002" }
	dbName := os.Getenv("DB_NAME")
	if dbName == "" { dbName = "app_store" }
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" { sslMode = "disable" }

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPass, dbName, sslMode)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("connect failed: %v", err)
	}
	defer db.Close()

	sqlStmt := `
	CREATE TABLE IF NOT EXISTS banners (
		id BIGSERIAL PRIMARY KEY,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		title VARCHAR(255) NOT NULL,
		subtitle TEXT,
		badge VARCHAR(100),
		image_url TEXT NOT NULL,
		link_url TEXT NOT NULL DEFAULT '/products',
		cta_text VARCHAR(100) DEFAULT 'Shop Now',
		cta_link TEXT DEFAULT '/products',
		type VARCHAR(50) NOT NULL DEFAULT 'hero',
		position INT NOT NULL DEFAULT 0,
		is_active BOOLEAN NOT NULL DEFAULT TRUE
	);

	CREATE INDEX IF NOT EXISTS idx_banners_type_active_pos 
	ON banners (type, is_active, position);
	`

	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Fatalf("exec migration failed: %v", err)
	}

	fmt.Println("✓ Migration 00005_banners applied successfully via pgx")
}
