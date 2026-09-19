package util

import (
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"
)

const fallbackSecret = "dev-insecure-secret-change-me"

func getJwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if os.Getenv("APP_ENV") == "production" {
		if secret == "" || secret == fallbackSecret {
			panic("JWT_SECRET must be securely configured in production")
		}
	}
	if secret == "" {
		secret = fallbackSecret
	}
	return []byte(secret)
}

func GenerateJwt(userId uint) (string, error) {
	claims := jwt.StandardClaims{
		Issuer:    strconv.Itoa(int(userId)),
		ExpiresAt: time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJwtSecret())
}

func ParseJwt(cookie string) (string, error) {
	token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(t *jwt.Token) (interface{}, error) {
		return getJwtSecret(), nil
	})

	if err != nil || !token.Valid {
		return "", err
	}

	claims := token.Claims.(*jwt.StandardClaims)

	return claims.Issuer, nil
}
