package domain

import "context"

// UsuarioRepository define el contrato para operaciones sobre la tabla api.usuarios
type UsuarioRepository interface {
	FindByEmail(ctx context.Context, email string) (*Usuario, error)
	FindByID(ctx context.Context, id string) (*Usuario, error)
	Create(ctx context.Context, usuario *Usuario) error
	Actualizar(ctx context.Context, id string, datos map[string]interface{}) error
}
