package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config encapsulates strongly-typed runtime configuration for the backend service.
type Config struct {
	Port        string
	Env         string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string
	ClientURL   string
}

// LoadConfig parses environment variables, applies sensible defaults, and validates required parameters.
func LoadConfig() (*Config, error) {
	cfg := &Config{
		Port:        getEnv("PORT", "8000"),
		Env:         getEnv("ENV", "development"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  os.Getenv("DB_PASSWORD"),
		DBName:      getEnv("DB_NAME", "dashstack"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		RedisURL:    getEnv("REDIS_URL", "localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "dev-jwt-secret-key-change-in-production"),
		ClientURL:   getEnv("CLIENT_URL", "http://localhost:3000"),
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// Validate verifies that required variables meet operational rules.
func (c *Config) Validate() error {
	// Port validation
	portNum, err := strconv.Atoi(c.Port)
	if err != nil || portNum < 1 || portNum > 65535 {
		return fmt.Errorf("invalid PORT: %s (must be an integer between 1 and 65535)", c.Port)
	}

	// Environment validation
	validEnvs := map[string]bool{
		"development": true,
		"production":  true,
		"test":        true,
		"staging":     true,
	}
	if !validEnvs[strings.ToLower(c.Env)] {
		return fmt.Errorf("invalid ENV: %s (allowed: development, production, test, staging)", c.Env)
	}

	// Production fail-fast safety checks
	if c.IsProduction() {
		if c.JWTSecret == "" || c.JWTSecret == "dev-jwt-secret-key-change-in-production" {
			return errors.New("JWT_SECRET must be explicitly set and cannot use the development default in production")
		}
		if len(c.JWTSecret) < 32 {
			return errors.New("JWT_SECRET must be at least 32 characters in production for cryptographic security")
		}
		if c.DatabaseURL == "" && (c.DBHost == "" || c.DBUser == "" || c.DBName == "") {
			return errors.New("database connection parameters (DATABASE_URL or DB_HOST/DB_USER/DB_NAME) must be provided in production")
		}
	}

	return nil
}

// IsProduction returns true if ENV is set to production.
func (c *Config) IsProduction() bool {
	return strings.EqualFold(c.Env, "production")
}

// GetDSN returns the formatted PostgreSQL connection string.
func (c *Config) GetDSN() string {
	if c.DatabaseURL != "" {
		return c.DatabaseURL
	}
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode)
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
