package utils

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims define los datos del payload del token JWT centralizado
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Rol      string `json:"rol"`
	Provider string `json:"provider"`
	jwt.RegisteredClaims
}

// getJWTSecret obtiene la clave secreta desde la variable de entorno o fallback para desarrollo
func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "supermercados_secret_key_desarrollo_2026_jwt"
	}
	return []byte(secret)
}

// GenerarToken emite un JWT firmado con HS256 conteniendo estrictamente user_id, rol, provider y expiración a 24 horas
func GenerarToken(usuarioID, rol, provider string) (string, error) {
	if usuarioID == "" {
		return "", errors.New("el usuarioID no puede estar vacío")
	}

	ahora := time.Now()
	claims := JWTClaims{
		UserID:   usuarioID,
		Rol:      rol,
		Provider: provider,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(ahora.Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(ahora),
			NotBefore: jwt.NewNumericDate(ahora),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getJWTSecret())
	if err != nil {
		return "", fmt.Errorf("error al firmar token JWT: %w", err)
	}

	return tokenString, nil
}

// ValidarToken parsea y verifica la firma criptográfica y expiración del JWT
func ValidarToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validar que el algoritmo de firma sea HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("algoritmo de firma no válido: %v", token.Header["alg"])
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return nil, fmt.Errorf("token inválido: %w", err)
	}

	return token, nil
}
