package config

import (
	"os"
	"testing"
)

func TestLoadConfig_Defaults(t *testing.T) {
	// Clean environment variables before test
	os.Unsetenv("PORT")
	os.Unsetenv("ENV")
	os.Unsetenv("JWT_SECRET")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("expected LoadConfig to succeed with defaults, got: %v", err)
	}

	if cfg.Port != "8000" {
		t.Errorf("expected default Port 8000, got: %s", cfg.Port)
	}
	if cfg.Env != "development" {
		t.Errorf("expected default Env development, got: %s", cfg.Env)
	}
	if cfg.IsProduction() {
		t.Errorf("expected IsProduction to be false for development")
	}
}

func TestLoadConfig_InvalidPort(t *testing.T) {
	os.Setenv("PORT", "invalid-port")
	defer os.Unsetenv("PORT")

	_, err := LoadConfig()
	if err == nil {
		t.Fatal("expected error on invalid PORT, got nil")
	}
}

func TestLoadConfig_ProductionValidation(t *testing.T) {
	os.Setenv("ENV", "production")
	os.Setenv("JWT_SECRET", "short")
	defer func() {
		os.Unsetenv("ENV")
		os.Unsetenv("JWT_SECRET")
	}()

	_, err := LoadConfig()
	if err == nil {
		t.Fatal("expected error on insecure JWT_SECRET in production, got nil")
	}

	// Valid production secret
	os.Setenv("JWT_SECRET", "this-is-a-very-long-production-jwt-secret-key-32chars")
	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("expected valid production config to pass, got: %v", err)
	}
	if !cfg.IsProduction() {
		t.Errorf("expected IsProduction to be true")
	}
}

func TestConfig_GetDSN(t *testing.T) {
	cfg := &Config{
		DBHost:     "dbhost",
		DBPort:     "5432",
		DBUser:     "user",
		DBPassword: "secretpassword",
		DBName:     "dashstack",
		DBSSLMode:  "require",
	}

	expected := "host=dbhost port=5432 user=user password=secretpassword dbname=dashstack sslmode=require"
	if cfg.GetDSN() != expected {
		t.Errorf("expected DSN %q, got %q", expected, cfg.GetDSN())
	}

	cfg.DatabaseURL = "postgres://user:secret@dbhost:5432/dashstack?sslmode=require"
	if cfg.GetDSN() != cfg.DatabaseURL {
		t.Errorf("expected DSN to equal DatabaseURL when set, got %q", cfg.GetDSN())
	}
}
