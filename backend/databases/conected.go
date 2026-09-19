package databases

import (
	"fmt"
	"os"

	"github.com/reppo/go-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func Conect() {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "postgres")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", host, port, user, password, dbname, sslmode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("we can not conect in your db")
	}

	DB = db

	// TRANSITIONAL ARCHITECTURE NOTE (Constitution Principle I & XXXV):
	// GORM AutoMigrate is maintained for local development backward-compatibility.
	// Goose (backend/db/migrations/) is the single source of truth for versioned SQL schema evolution.
	// Do NOT extend AutoMigrate to new models; codify all future schema changes in Goose SQL migrations.
	db.AutoMigrate(&models.User{}, &models.Category{}, &models.Tag{}, &models.Role{}, &models.Product{}, &models.Permission{}, &models.Order{}, &models.OrderItem{}, &models.Color{}, &models.Favorite{}, &models.Label{}, &models.Message{})
}

// CloseDB safely closes the underlying database connection pool during graceful process shutdown.
func CloseDB() error {
	if DB == nil {
		return nil
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
