package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"unicode"

	"github.com/danirc2024/Taller_integracion_III/backend/api/infrastructure"
	"github.com/danirc2024/Taller_integracion_III/backend/api/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/utils"
	"github.com/google/uuid"
)

var (
	// ErrPasswordInvalido se emite cuando la contraseña no cumple las reglas de complejidad
	ErrPasswordInvalido = errors.New("la contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un símbolo especial")
	// ErrCorreoDuplicado se emite cuando ya existe un usuario con el mismo correo
	ErrCorreoDuplicado = errors.New("el correo electrónico ya se encuentra registrado")
)

// RegistroDTO contiene los parámetros requeridos para el registro de un usuario
type RegistroDTO struct {
	Correo         string
	Password       string
	NombreCompleto string
}

// UsuarioCreadoDTO representa el resultado de un registro exitoso sin datos sensibles
type UsuarioCreadoDTO struct {
	ID                uuid.UUID
	Correo            string
	NombreCompleto    string
	Rol               string
	EstaActivo        bool
	TokenVerificacion uuid.UUID
	Mensaje           string
}

// AuthService define los casos de uso para la autenticación e identidad de usuarios
type AuthService interface {
	Registrar(ctx context.Context, input RegistroDTO) (*UsuarioCreadoDTO, error)
}

type authService struct {
	usuarioRepo repositories.UsuarioRepository
}

// NewAuthService inicializa el servicio inyectando el repositorio de usuarios
func NewAuthService(usuarioRepo repositories.UsuarioRepository) AuthService {
	return &authService{
		usuarioRepo: usuarioRepo,
	}
}

// validarComplejidadPassword exige al menos 8 caracteres, una mayúscula, un número y un símbolo
func validarComplejidadPassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("%w: longitud mínima de 8 caracteres", ErrPasswordInvalido)
	}

	var tieneMayuscula, tieneNumero, tieneSimbolo bool
	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			tieneMayuscula = true
		case unicode.IsDigit(r):
			tieneNumero = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			tieneSimbolo = true
		}
	}

	if !tieneMayuscula {
		return fmt.Errorf("%w: debe incluir al menos una letra mayúscula", ErrPasswordInvalido)
	}
	if !tieneNumero {
		return fmt.Errorf("%w: debe incluir al menos un número", ErrPasswordInvalido)
	}
	if !tieneSimbolo {
		return fmt.Errorf("%w: debe incluir al menos un símbolo especial", ErrPasswordInvalido)
	}

	return nil
}

// Registrar ejecuta el caso de uso completo de registro con validaciones de seguridad
func (s *authService) Registrar(ctx context.Context, input RegistroDTO) (*UsuarioCreadoDTO, error) {
	// 1. Validar complejidad de contraseña antes de computar hash
	if err := validarComplejidadPassword(input.Password); err != nil {
		return nil, err
	}

	// 2. Normalizar y sanitizar entradas
	correoNormalizado := strings.ToLower(strings.TrimSpace(input.Correo))
	nombreSanitizado := utils.SanitizarInputBusqueda(input.NombreCompleto)

	// 3. Comprobar unicidad del correo electrónico
	existente, err := s.usuarioRepo.FindByEmail(ctx, correoNormalizado)
	if err != nil {
		return nil, fmt.Errorf("error consultando disponibilidad del correo: %w", err)
	}
	if existente != nil {
		return nil, ErrCorreoDuplicado
	}

	// 4. Generar hash bcrypt de la contraseña
	hash, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, fmt.Errorf("error al generar hash seguro de contraseña: %w", err)
	}

	// 5. Generar token de verificación UUID
	tokenVerificacion := uuid.New()

	// 6. Instanciar modelo de dominio con Estado Inactivo obligatorio
	nuevoUsuario := &infrastructure.Usuario{
		Correo:            correoNormalizado,
		PasswordHash:      &hash,
		NombreCompleto:    nombreSanitizado,
		Rol:               "registrado",
		CuotaTokensIA:     1000,
		EstaActivo:        false, // Estrictamente inactivo hasta confirmar correo
		TokenVerificacion: &tokenVerificacion,
	}

	// 7. Persistir en repositorio
	if err := s.usuarioRepo.Create(ctx, nuevoUsuario); err != nil {
		return nil, fmt.Errorf("error al persistir el nuevo usuario: %w", err)
	}

	// 8. Construir DTO de respuesta
	return &UsuarioCreadoDTO{
		ID:                nuevoUsuario.ID,
		Correo:            nuevoUsuario.Correo,
		NombreCompleto:    nuevoUsuario.NombreCompleto,
		Rol:               nuevoUsuario.Rol,
		EstaActivo:        nuevoUsuario.EstaActivo,
		TokenVerificacion: tokenVerificacion,
		Mensaje:           "Usuario registrado con éxito. Se requiere confirmar el correo electrónico antes de iniciar sesión.",
	}, nil
}
