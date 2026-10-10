package config

import (
	"errors"
	"os"
	"strconv"
	"time"
)

type Config struct {
	ListenAddr      string
	DatabaseURL     string
	JWTSecret       string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

func Load() (Config, error) {
	c := Config{
		DatabaseURL: os.Getenv("DB_URL"), JWTSecret: os.Getenv("JWT_SECRET"),
		MaxOpenConns: 10, MaxIdleConns: 5, ConnMaxLifetime: 30 * time.Minute,
	}
	if c.DatabaseURL == "" {
		return Config{}, errors.New("DB_URL es obligatorio")
	}
	if c.JWTSecret == "" {
		return Config{}, errors.New("JWT_SECRET es obligatorio para verificar permisos administrativos")
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	value, err := strconv.Atoi(port)
	if err != nil || value < 1 || value > 65535 {
		return Config{}, errors.New("PORT debe ser un número entre 1 y 65535")
	}
	c.ListenAddr = ":" + strconv.Itoa(value)
	for name, target := range map[string]*int{
		"DB_MAX_OPEN_CONNS": &c.MaxOpenConns,
		"DB_MAX_IDLE_CONNS": &c.MaxIdleConns,
	} {
		if raw := os.Getenv(name); raw != "" {
			value, err := strconv.Atoi(raw)
			if err != nil || value < 1 {
				return Config{}, errors.New(name + " debe ser un entero positivo")
			}
			*target = value
		}
	}
	if c.MaxIdleConns > c.MaxOpenConns {
		return Config{}, errors.New("DB_MAX_IDLE_CONNS no puede superar DB_MAX_OPEN_CONNS")
	}
	if raw := os.Getenv("DB_CONN_MAX_LIFETIME"); raw != "" {
		value, err := time.ParseDuration(raw)
		if err != nil || value <= 0 {
			return Config{}, errors.New("DB_CONN_MAX_LIFETIME debe ser una duración positiva")
		}
		c.ConnMaxLifetime = value
	}
	return c, nil
}
