package security

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/reppo/go-backend/internal/domain"
)

// UserClaims encapsulates payload information embedded inside signed JWT tokens.
type UserClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// TokenManager defines the contract for issuing and validating authentication tokens.
type TokenManager interface {
	GenerateToken(userID int64, email, role string) (string, error)
	ValidateToken(tokenStr string) (*UserClaims, error)
}

// JWTTokenManager implements TokenManager using HMAC-SHA256 and golang-jwt/jwt/v5.
type JWTTokenManager struct {
	secret []byte
	ttl    time.Duration
}

// NewJWTTokenManager creates a new JWTTokenManager instance.
func NewJWTTokenManager(secret string, ttl time.Duration) *JWTTokenManager {
	if ttl == 0 {
		ttl = 24 * time.Hour
	}
	return &JWTTokenManager{
		secret: []byte(secret),
		ttl:    ttl,
	}
}

// GenerateToken signs a new token with UserClaims.
func (m *JWTTokenManager) GenerateToken(userID int64, email, role string) (string, error) {
	now := time.Now()
	claims := UserClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strconv.FormatInt(userID, 10),
			Issuer:    strconv.FormatInt(userID, 10), // Backward compatibility with legacy parser
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.ttl)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

// ValidateToken parses and validates a signed token string.
func (m *JWTTokenManager) ValidateToken(tokenStr string) (*UserClaims, error) {
	if tokenStr == "" {
		return nil, domain.ErrInvalidToken
	}

	token, err := jwt.ParseWithClaims(tokenStr, &UserClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.secret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, domain.ErrInvalidToken
		}

		// Attempt fallback parsing for legacy tokens that only have RegisteredClaims / StandardClaims
		var mapClaims jwt.MapClaims
		fallbackToken, fallbackErr := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return m.secret, nil
		})
		if fallbackErr == nil && fallbackToken.Valid {
			if claims, ok := fallbackToken.Claims.(jwt.MapClaims); ok {
				mapClaims = claims
				var userID int64
				if iss, ok := mapClaims["iss"].(string); ok {
					id, _ := strconv.ParseInt(iss, 10, 64)
					userID = id
				} else if sub, ok := mapClaims["sub"].(string); ok {
					id, _ := strconv.ParseInt(sub, 10, 64)
					userID = id
				}
				if userID > 0 {
					return &UserClaims{
						UserID: userID,
						Role:   "customer",
					}, nil
				}
			}
		}
		return nil, errors.Join(domain.ErrInvalidToken, err)
	}

	claims, ok := token.Claims.(*UserClaims)
	if !ok || !token.Valid {
		return nil, domain.ErrInvalidToken
	}

	// If UserID is 0, attempt to read from Subject or Issuer
	if claims.UserID == 0 {
		if claims.Subject != "" {
			if id, err := strconv.ParseInt(claims.Subject, 10, 64); err == nil {
				claims.UserID = id
			}
		} else if claims.Issuer != "" {
			if id, err := strconv.ParseInt(claims.Issuer, 10, 64); err == nil {
				claims.UserID = id
			}
		}
	}

	return claims, nil
}
