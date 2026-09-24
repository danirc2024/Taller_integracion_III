package repositories

import (
	"context"
	"errors"

	"github.com/danirc2024/Taller_integracion_III/backend/api/infrastructure"
	"gorm.io/gorm"
)

// UsuarioRepository define el contrato para operaciones sobre la tabla api.usuarios
type UsuarioRepository interface {
	FindByEmail(ctx context.Context, email string) (*infrastructure.Usuario, error)
	Create(ctx context.Context, usuario *infrastructure.Usuario) error
}

type gormUsuarioRepository struct {
	db *gorm.DB
}

// NewUsuarioRepository inicializa un repositorio de usuarios con conexión GORM
func NewUsuarioRepository(db *gorm.DB) UsuarioRepository {
	return &gormUsuarioRepository{db: db}
}

// FindByEmail consulta si existe un usuario por su dirección de correo electrónico
func (r *gormUsuarioRepository) FindByEmail(ctx context.Context, email string) (*infrastructure.Usuario, error) {
	var usuario infrastructure.Usuario
	err := r.db.WithContext(ctx).Where("correo = ?", email).First(&usuario).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &usuario, nil
}

// Create inserta un nuevo registro de usuario en la base de datos
func (r *gormUsuarioRepository) Create(ctx context.Context, usuario *infrastructure.Usuario) error {
	return r.db.WithContext(ctx).Create(usuario).Error
}
