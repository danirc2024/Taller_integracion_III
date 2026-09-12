package main

import (
	"log"
	"net/http"
	"os"

	_ "github.com/danirc2024/Taller_integracion_III/backend/api/docs"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func initDB() {
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		log.Println("No se encontró DB_URL en las variables de entorno, usando valor por defecto para desarrollo local")
		dsn = "host=localhost user=postgres password=postgres dbname=supermercados_db port=5432 sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error conectando a la base de datos: %v", err)
	}

	log.Println("Conexión a la base de datos establecida exitosamente.")
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	// Configuración básica de CORS para desarrollo
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/", RootHandler)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}

// RootHandler godoc
// @Summary      Muestra mensaje de bienvenida
// @Description  Endpoint raíz para comprobar el estado de la API
// @Tags         root
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       / [get]
func RootHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Bienvenido a la API Gateway de Supermercados.",
		"docs":    "Visita /swagger/index.html para ver el autocompletado Swagger UI.",
	})
}

// @title           API Gateway de Supermercados
// @version         1.0
// @description     API Gateway construida en Go con Gin
// @host            localhost:8080
// @BasePath        /
func main() {
	initDB()

	r := setupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Iniciando servidor en el puerto %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}
