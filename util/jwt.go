package util

import (
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"
)

const SecretKey = "secret"

func GenerateJwt(userId uint) (string, error) {
	claims := jwt.StandardClaims{
		Issuer: strconv.Itoa(int(userId)),
		ExpiresAt: time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodES256,claims)

	return token.SignedString([]byte(SecretKey))
}