package security_test

import (
	"testing"

	"github.com/reppo/go-backend/internal/infrastructure/security"
	"golang.org/x/crypto/bcrypt"
)

func TestBcryptHasher(t *testing.T) {
	hasher := security.NewBcryptHasher(bcrypt.MinCost) // use MinCost for fast unit tests

	password := "SecretPassw0rd!123"
	hash, err := hasher.HashPassword(password)
	if err != nil {
		t.Fatalf("unexpected error hashing password: %v", err)
	}

	if err := hasher.ComparePassword(hash, password); err != nil {
		t.Errorf("expected correct password to match, got error: %v", err)
	}

	if err := hasher.ComparePassword(hash, "WrongPassword"); err == nil {
		t.Error("expected wrong password to fail comparison, but got nil")
	}
}
