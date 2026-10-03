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
	FindByID(ctx context.Context, id string) (*infrastructure.Usuario, error)
	Create(ctx context.Context, usuario *infrastructure.Usuario) error
	Actualizar(ctx context.Context, id string, datos map[string]interface{}) error
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

// FindByID consulta a un usuario por su clave primaria UUID
func (r *gormUsuarioRepository) FindByID(ctx context.Context, id string) (*infrastructure.Usuario, error) {
	var usuario infrastructure.Usuario
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&usuario).Error
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

// Actualizar aplica cambios parciales dinámicamente a la tabla api.usuarios usando GORM Updates
func (r *gormUsuarioRepository) Actualizar(ctx context.Context, id string, datos map[string]interface{}) error {
	res := r.db.WithContext(ctx).
		Model(&infrastructure.Usuario{}).
		Where("id = ?", id).
		Updates(datos)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
