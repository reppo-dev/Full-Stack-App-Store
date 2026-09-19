package security_test

import (
	"testing"
	"time"

	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/infrastructure/security"
)

func TestJWTTokenManager(t *testing.T) {
	secret := "test-super-secret-key-that-is-at-least-32-chars-long"
	tm := security.NewJWTTokenManager(secret, 1*time.Hour)

	t.Run("GenerateAndValidateToken_Success", func(t *testing.T) {
		tokenStr, err := tm.GenerateToken(42, "user@example.com", "admin")
		if err != nil {
			t.Fatalf("unexpected error generating token: %v", err)
		}
		if tokenStr == "" {
			t.Fatal("expected non-empty token")
		}

		claims, err := tm.ValidateToken(tokenStr)
		if err != nil {
			t.Fatalf("unexpected error validating token: %v", err)
		}
		if claims.UserID != 42 {
			t.Errorf("expected UserID 42, got %d", claims.UserID)
		}
		if claims.Email != "user@example.com" {
			t.Errorf("expected Email user@example.com, got %s", claims.Email)
		}
		if claims.Role != "admin" {
			t.Errorf("expected Role admin, got %s", claims.Role)
		}
	})

	t.Run("ValidateToken_InvalidSignature", func(t *testing.T) {
		otherTM := security.NewJWTTokenManager("different-secret-key-different-hash-32chars", 1*time.Hour)
		tokenStr, err := otherTM.GenerateToken(10, "other@example.com", "customer")
		if err != nil {
			t.Fatalf("unexpected error generating token: %v", err)
		}

		_, err = tm.ValidateToken(tokenStr)
		if err == nil {
			t.Fatal("expected error validating token with wrong secret, got nil")
		}
	})

	t.Run("ValidateToken_Expired", func(t *testing.T) {
		shortTM := security.NewJWTTokenManager(secret, -1*time.Hour)
		tokenStr, err := shortTM.GenerateToken(10, "exp@example.com", "customer")
		if err != nil {
			t.Fatalf("unexpected error generating token: %v", err)
		}

		_, err = tm.ValidateToken(tokenStr)
		if err == nil {
			t.Fatal("expected error on expired token, got nil")
		}
	})

	t.Run("ValidateToken_EmptyString", func(t *testing.T) {
		_, err := tm.ValidateToken("")
		if err == nil || err != domain.ErrInvalidToken {
			t.Fatalf("expected ErrInvalidToken on empty string, got %v", err)
		}
	})
}
