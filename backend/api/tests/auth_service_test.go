package tests

import (
	"context"
	"errors"
	"testing"

	"github.com/danirc2024/Taller_integracion_III/backend/api/infrastructure"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/danirc2024/Taller_integracion_III/backend/api/utils"
)

// mockUsuarioRepository implementa UsuarioRepository en memoria para pruebas unitarias
type mockUsuarioRepository struct {
	usuarios map[string]*infrastructure.Usuario
}

func newMockUsuarioRepository() *mockUsuarioRepository {
	return &mockUsuarioRepository{
		usuarios: make(map[string]*infrastructure.Usuario),
	}
}

func (m *mockUsuarioRepository) FindByEmail(ctx context.Context, email string) (*infrastructure.Usuario, error) {
	if u, ok := m.usuarios[email]; ok {
		return u, nil
	}
	return nil, nil
}

func (m *mockUsuarioRepository) Create(ctx context.Context, usuario *infrastructure.Usuario) error {
	m.usuarios[usuario.Correo] = usuario
	return nil
}

func TestAuthService_PasswordComplexity(t *testing.T) {
	repo := newMockUsuarioRepository()
	service := services.NewAuthService(repo)

	casos := []struct {
		nombre      string
		password    string
		esperaError bool
	}{
		{"Muy corta", "Ab1!", true},
		{"Sin mayuscula", "password123!", true},
		{"Sin numero", "PasswordSeguro!", true},
		{"Sin simbolo", "PasswordSeguro123", true},
		{"Valida", "PasswordSeguro123!", false},
	}

	for _, c := range casos {
		t.Run(c.nombre, func(t *testing.T) {
			_, err := service.Registrar(context.Background(), services.RegistroDTO{
				Correo:         "test@uct.cl",
				Password:       c.password,
				NombreCompleto: "Test User",
			})

			if c.esperaError && !errors.Is(err, services.ErrPasswordInvalido) {
				t.Fatalf("Esperaba ErrPasswordInvalido pero obtuve: %v", err)
			}
			if !c.esperaError && err != nil {
				t.Fatalf("No esperaba error pero obtuve: %v", err)
			}
		})
	}
}

func TestAuthService_RegistroExitoso(t *testing.T) {
	repo := newMockUsuarioRepository()
	service := services.NewAuthService(repo)

	out, err := service.Registrar(context.Background(), services.RegistroDTO{
		Correo:         "Vicente@Uct.CL ",
		Password:       "SuperClave2026#",
		NombreCompleto: "<script>Vicente Matu</script>",
	})

	if err != nil {
		t.Fatalf("Error inesperado en registro: %v", err)
	}

	if out.Correo != "vicente@uct.cl" {
		t.Errorf("Esperaba correo normalizado 'vicente@uct.cl', obtuve '%s'", out.Correo)
	}

	if out.EstaActivo != false {
		t.Errorf("Esperaba que EstaActivo fuera estrictamente false, pero fue true")
	}

	if out.TokenVerificacion.String() == "" {
		t.Errorf("El token de verificacion no debe estar vacio")
	}

	// Verificar persistencia en repo
	u := repo.usuarios["vicente@uct.cl"]
	if u == nil {
		t.Fatalf("Usuario no persistido en el repositorio")
	}

	if u.PasswordHash == nil || !utils.CheckPasswordHash("SuperClave2026#", *u.PasswordHash) {
		t.Errorf("El hash almacenado no coincide con la contraseña con bcrypt")
	}

	// Intento de registro duplicado
	_, errDuplicado := service.Registrar(context.Background(), services.RegistroDTO{
		Correo:         "vicente@uct.cl",
		Password:       "SuperClave2026#",
		NombreCompleto: "Vicente Duplicado",
	})

	if !errors.Is(errDuplicado, services.ErrCorreoDuplicado) {
		t.Errorf("Esperaba ErrCorreoDuplicado, obtuve: %v", errDuplicado)
	}
}

func TestAuthService_Login(t *testing.T) {
	repo := newMockUsuarioRepository()
	service := services.NewAuthService(repo)

	// Hashear password para usuario de prueba
	hashValido, _ := utils.HashPassword("PasswordSegura123!")
	googleID := "google-oauth-12345"

	// 1. Usuario activo normal
	repo.usuarios["activo@uct.cl"] = &infrastructure.Usuario{
		Correo:         "activo@uct.cl",
		PasswordHash:   &hashValido,
		NombreCompleto: "Usuario Activo",
		EstaActivo:     true,
		Rol:            "registrado",
	}

	// 2. Usuario registrado vía Google (sin password_hash)
	repo.usuarios["google@uct.cl"] = &infrastructure.Usuario{
		GoogleID:       &googleID,
		Correo:         "google@uct.cl",
		PasswordHash:   nil,
		NombreCompleto: "Usuario Google",
		EstaActivo:     true,
		Rol:            "registrado",
	}

	// 3. Usuario inactivo
	repo.usuarios["inactivo@uct.cl"] = &infrastructure.Usuario{
		Correo:         "inactivo@uct.cl",
		PasswordHash:   &hashValido,
		NombreCompleto: "Usuario Inactivo",
		EstaActivo:     false,
		Rol:            "registrado",
	}

	t.Run("Usuario inexistente", func(t *testing.T) {
		u, err := service.Login("noexiste@uct.cl", "CualquierClave123!")
		if u != nil || !errors.Is(err, services.ErrCredencialesInvalidas) {
			t.Fatalf("Esperaba ErrCredencialesInvalidas, obtuve: %v", err)
		}
	})

	t.Run("Usuario con PasswordHash nulo (sin panic)", func(t *testing.T) {
		u, err := service.Login("google@uct.cl", "PasswordSegura123!")
		if u != nil || !errors.Is(err, services.ErrCredencialesInvalidas) {
			t.Fatalf("Esperaba ErrCredencialesInvalidas para password_hash nulo, obtuve: %v", err)
		}
	})

	t.Run("Cuenta inactiva pendiente de confirmacion", func(t *testing.T) {
		u, err := service.Login("inactivo@uct.cl", "PasswordSegura123!")
		if u != nil || !errors.Is(err, services.ErrCuentaInactiva) {
			t.Fatalf("Esperaba ErrCuentaInactiva, obtuve: %v", err)
		}
		if err.Error() != "La cuenta requiere verificación de correo" {
			t.Errorf("Mensaje de error inesperado: %s", err.Error())
		}
	})

	t.Run("Contraseña incorrecta", func(t *testing.T) {
		u, err := service.Login("activo@uct.cl", "PasswordIncorrecta999!")
		if u != nil || !errors.Is(err, services.ErrCredencialesInvalidas) {
			t.Fatalf("Esperaba ErrCredencialesInvalidas, obtuve: %v", err)
		}
	})

	t.Run("Login exitoso", func(t *testing.T) {
		u, err := service.Login("ACTIVO@UCT.CL ", "PasswordSegura123!")
		if err != nil {
			t.Fatalf("Error inesperado en login: %v", err)
		}
		if u == nil || u.Correo != "activo@uct.cl" {
			t.Fatalf("Usuario devuelto inválido")
		}
	})
}
