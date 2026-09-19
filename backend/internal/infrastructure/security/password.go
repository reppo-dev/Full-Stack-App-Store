package security

import (
	"golang.org/x/crypto/bcrypt"
)

const (
	// BcryptCost12 is the calibrated cryptographic cost balancing security and CPU load.
	BcryptCost12 = 12
)

// PasswordHasher provides methods for hashing and verifying passwords.
type PasswordHasher interface {
	HashPassword(password string) (string, error)
	ComparePassword(hashedPassword, plainPassword string) error
}

// BcryptHasher implements PasswordHasher using golang.org/x/crypto/bcrypt with cost 12.
type BcryptHasher struct {
	cost int
}

// NewBcryptHasher creates a new BcryptHasher instance.
func NewBcryptHasher(cost ...int) *BcryptHasher {
	c := BcryptCost12
	if len(cost) > 0 && cost[0] >= bcrypt.MinCost && cost[0] <= bcrypt.MaxCost {
		c = cost[0]
	}
	return &BcryptHasher{cost: c}
}

// HashPassword hashes a plain text password.
func (h *BcryptHasher) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// ComparePassword verifies that a plain text password matches a hashed password.
func (h *BcryptHasher) ComparePassword(hashedPassword, plainPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
}
