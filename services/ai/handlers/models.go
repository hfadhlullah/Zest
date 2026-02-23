package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/zest-app/ai-service/providers"
)

// ModelsHandler serves GET /models — returns all registered providers and
// their available models, indicating which are currently enabled.
type ModelsHandler struct {
	router *providers.Router
}

func NewModelsHandler(router *providers.Router) *ModelsHandler {
	return &ModelsHandler{router: router}
}

type modelsResponse struct {
	Providers []providers.ProviderInfo `json:"providers"`
}

func (h *ModelsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(modelsResponse{
		Providers: h.router.AvailableProviders(),
	})
}
