package config

import (
	"testing"
	"time"
)

func TestLoad(t *testing.T) {
	for _, name := range []string{"DB_URL", "JWT_SECRET", "PORT", "DB_MAX_OPEN_CONNS", "DB_MAX_IDLE_CONNS", "DB_CONN_MAX_LIFETIME"} {
		t.Setenv(name, "")
	}
	if _, err := Load(); err == nil {
		t.Fatal("se aceptó la configuración sin PostgreSQL")
	}
	t.Setenv("DB_URL", "postgres://test-only")
	if _, err := Load(); err == nil {
		t.Fatal("se aceptó una clave JWT implícita")
	}
	t.Setenv("JWT_SECRET", "test-only")
	cfg, err := Load()
	if err != nil || cfg.ListenAddr != ":8080" || cfg.MaxOpenConns != 10 || cfg.MaxIdleConns != 5 || cfg.ConnMaxLifetime != 30*time.Minute {
		t.Fatalf("configuración predeterminada incorrecta: %v", err)
	}
	for _, tc := range []struct{ name, value string }{
		{"PORT", "0"}, {"PORT", "70000"}, {"PORT", "not-a-port"},
		{"DB_MAX_OPEN_CONNS", "0"}, {"DB_MAX_IDLE_CONNS", "11"},
		{"DB_CONN_MAX_LIFETIME", "-1m"},
	} {
		t.Run(tc.name+"_"+tc.value, func(t *testing.T) {
			t.Setenv(tc.name, tc.value)
			if _, err := Load(); err == nil {
				t.Fatal("se aceptó una configuración inválida")
			}
		})
	}
}
