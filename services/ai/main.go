package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/zest-app/ai-service/handlers"
	"github.com/zest-app/ai-service/moderator"
	"github.com/zest-app/ai-service/providers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Wire up dependencies
	mod := moderator.New()

	router := providers.NewRouter(
		providers.NewGeminiProvider(),  // Primary
		providers.NewGLMProvider(),     // Secondary
		providers.NewCopilotProvider(), // Tertiary
	)

	generateHandler := handlers.NewGenerateHandler(router, mod)
	refineHandler := handlers.NewRefineHandler(router, mod)
	moderateHandler := handlers.NewModerateHandler(mod)
	modelsHandler := handlers.NewModelsHandler(router)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	// Health check — used by Docker and load balancer
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	r.Get("/models", modelsHandler.ServeHTTP)
	r.Post("/generate", generateHandler.ServeHTTP)
	r.Post("/refine", refineHandler.ServeHTTP)
	r.Post("/moderate", moderateHandler.ServeHTTP)

	log.Printf("[ai-service] listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("[ai-service] fatal: %v", err)
	}
}
