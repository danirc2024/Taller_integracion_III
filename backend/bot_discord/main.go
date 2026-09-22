package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	token := os.Getenv("DISCORD_BOT_TOKEN")
	if token == "" {
		log.Fatal("DISCORD_BOT_TOKEN no configurado en entorno")
	}

	channelID := os.Getenv("DISCORD_CHANNEL_ID")
	if channelID == "" {
		log.Fatal("DISCORD_CHANNEL_ID no configurado en entorno")
	}

	// Inicializar Discord
	dg, err := discordgo.New("Bot " + token)
	if err != nil {
		log.Fatalf("Error creando sesión Discord: %v", err)
	}

	dg.AddHandler(messageCreate)
	dg.Identify.Intents = discordgo.IntentsGuildMessages

	err = dg.Open()
	if err != nil {
		log.Fatalf("Error abriendo conexión Discord: %v", err)
	}
	defer dg.Close()

	log.Println("Bot conectado a Discord!")

	// Inicializar Gin
	r := gin.Default()

	r.POST("/webhooks/github", func(c *gin.Context) {
		event := c.GetHeader("X-GitHub-Event")

		var payload map[string]interface{}
		if err := c.BindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido"})
			return
		}

		switch event {
		case "ping":
			c.JSON(http.StatusOK, gin.H{"status": "Ping recibido"})
			return
		case "push":
			handlePush(dg, channelID, payload)
		case "pull_request":
			handlePullRequest(dg, channelID, payload)
		default:
			log.Printf("Evento de GitHub ignorado: %s", event)
		}

		c.JSON(http.StatusOK, gin.H{"status": "Procesado"})
	})

	// Ejecutar servidor web en Goroutine
	go func() {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		log.Printf("Servidor Webhook escuchando en el puerto %s", port)
		if err := r.Run(":" + port); err != nil {
			log.Fatalf("Error en servidor web: %v", err)
		}
	}()

	// Esperar señal de interrupción para cerrar limpio
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc
}

// messageCreate responde a comandos de texto simples
func messageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	if m.Author.ID == s.State.User.ID {
		return
	}

	if m.Content == "!ping" {
		s.ChannelMessageSend(m.ChannelID, "Pong! El bot está vivo y respirando.")
	}
}

// handlePush notifica sobre nuevos commits
func handlePush(s *discordgo.Session, channelID string, payload map[string]interface{}) {
	pusherMap, ok := payload["pusher"].(map[string]interface{})
	if !ok {
		return
	}
	pusherName := pusherMap["name"].(string)

	ref, _ := payload["ref"].(string)
	branch := strings.Replace(ref, "refs/heads/", "", 1)

	msg := fmt.Sprintf("🚀 **Nuevo Push** de `%s` en la rama `%s`.", pusherName, branch)
	s.ChannelMessageSend(channelID, msg)
}

// handlePullRequest notifica creación de PR y extrae reviewers/assignees
func handlePullRequest(s *discordgo.Session, channelID string, payload map[string]interface{}) {
	action, _ := payload["action"].(string)

	// Solo nos interesan PRs abiertos o cuando se solicita review/asigna (opcional)
	if action != "opened" && action != "reopened" {
		return
	}

	prMap, ok := payload["pull_request"].(map[string]interface{})
	if !ok {
		return
	}

	title, _ := prMap["title"].(string)
	url, _ := prMap["html_url"].(string)
	userMap, _ := prMap["user"].(map[string]interface{})
	author, _ := userMap["login"].(string)

	// Extraer Assignees
	var assigneesList []string
	if assignees, ok := prMap["assignees"].([]interface{}); ok {
		for _, a := range assignees {
			assigneeMap := a.(map[string]interface{})
			login := assigneeMap["login"].(string)
			assigneesList = append(assigneesList, mapGitHubToDiscord(login))
		}
	}

	// Extraer Requested Reviewers
	var reviewersList []string
	if reviewers, ok := prMap["requested_reviewers"].([]interface{}); ok {
		for _, r := range reviewers {
			reviewerMap := r.(map[string]interface{})
			login := reviewerMap["login"].(string)
			reviewersList = append(reviewersList, mapGitHubToDiscord(login))
		}
	}

	// Extraer Labels
	var labelsList []string
	if labels, ok := prMap["labels"].([]interface{}); ok {
		for _, l := range labels {
			labelMap := l.(map[string]interface{})
			name := labelMap["name"].(string)
			labelsList = append(labelsList, "`"+name+"`")
		}
	}

	msg := fmt.Sprintf("🛠️ **Nuevo Pull Request** por `%s`\n**Título**: %s\n**Link**: %s", author, title, url)

	if len(labelsList) > 0 {
		msg += fmt.Sprintf("\n**Etiquetas**: %s", strings.Join(labelsList, ", "))
	}

	if len(assigneesList) > 0 {
		msg += fmt.Sprintf("\n**Asignados**: %s", strings.Join(assigneesList, " "))
	}

	if len(reviewersList) > 0 {
		msg += fmt.Sprintf("\n**Reviewers Solicitados**: %s", strings.Join(reviewersList, " "))
	}

	s.ChannelMessageSend(channelID, msg)
}

// mapGitHubToDiscord traduce usuarios de Github a IDs de Discord o nombres
func mapGitHubToDiscord(githubUser string) string {
	// Diccionario estático de miembros del equipo
	// TODO: En el futuro esto puede venir de un JSON o BD.
	users := map[string]string{
		"VicenteMatus": "<@!537347874875506698>", // Reemplazar con ID reales ej: <@!123456789>
		"danirc2024":   "<@!1221186570455879702>",
		"RCarrascoO":   "<@!410177503592972288>",
		"MarceloMat":   "<@!467880145877991432>",
		"FabianS":      "<@!DISCORD_ID_FABIAN>",
		"EsbanV":       "<@!265591689211674624>",
	}

	if discordPing, exists := users[githubUser]; exists {
		return discordPing
	}

	// Si no está mapeado, retornar solo el nombre de Github resaltado
	return "`@" + githubUser + "`"
}
