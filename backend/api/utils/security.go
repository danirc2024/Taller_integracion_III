package utils

import (
	"regexp"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// SanitizarInputBusqueda limpia la entrada del usuario para prevenir Inyecciones SQL y XSS,
// limitando la longitud y permitiendo solo caracteres seguros.
// Basado en las directrices de seguridad del proyecto.
func SanitizarInputBusqueda(input string) string {
	// 1. Quitar espacios en blanco al inicio y final
	limpio := strings.TrimSpace(input)

	// 2. Limitar la longitud máxima a 100 caracteres para evitar desbordamientos o consultas pesadas
	if len(limpio) > 100 {
		limpio = limpio[:100]
	}

	// 3. Filtrar estrictamente caracteres: Permitir solo alfanuméricos, espacios, guiones y letras con tilde
	// Todo carácter especial extraño (como ;, ', ", --, etc.) será eliminado automáticamente
	reg := regexp.MustCompile(`[^a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ\-]`)
	limpio = reg.ReplaceAllString(limpio, "")

	return limpio
}

// HashPassword genera un hash seguro a partir de una contraseña en texto plano utilizando bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compara una contraseña en texto plano contra un hash bcrypt almacenado
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
