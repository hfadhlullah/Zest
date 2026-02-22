// Package handlers implements HTTP handlers for the AI service endpoints.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/zest-app/ai-service/models"
	"github.com/zest-app/ai-service/moderator"
	"github.com/zest-app/ai-service/normalizer"
	"github.com/zest-app/ai-service/providers"
)

const generationTimeout = 60 * time.Second // BR-003

// GenerateHandler handles POST /generate.
// Flow: validate → moderate → route provider → normalize → respond
type GenerateHandler struct {
	router *providers.Router
	mod    *moderator.Moderator
}

// NewGenerateHandler creates a GenerateHandler.
func NewGenerateHandler(router *providers.Router, mod *moderator.Moderator) *GenerateHandler {
	return &GenerateHandler{router: router, mod: mod}
}

func (h *GenerateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req models.GenerationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}

	if req.Prompt == "" {
		writeError(w, http.StatusBadRequest, "prompt is required")
		return
	}

	// BR-004: Moderation MUST run before LLM call
	decision := h.mod.Check(req.Prompt)
	if !decision.Allowed {
		writeError(w, http.StatusUnprocessableEntity, decision.Reason)
		return
	}

	// Assign a request ID if caller didn't provide one
	if req.RequestID == "" {
		req.RequestID = uuid.New().String()
	}
	if req.UserID == "" {
		req.UserID = "anonymous"
	}

	// BR-003: 60-second timeout
	ctx, cancel := context.WithTimeout(r.Context(), generationTimeout)
	defer cancel()

	start := time.Now()
	raw, providerUsed, err := h.router.Route(ctx, req)
	durationMs := time.Since(start).Milliseconds()

	if err != nil {
		result := models.GenerationResult{
			GenerationID: uuid.New().String(),
			Status:       "error",
			ProviderUsed: providerUsed,
			DurationMs:   durationMs,
			Error:        err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		json.NewEncoder(w).Encode(result)
		return
	}

	// Normalize raw LLM response into HTML + CSS
	format := req.Preferences.OutputFormat
	if format == "" {
		format = "html_css"
	}
	parsed := normalizer.Parse(raw, format)

	result := models.GenerationResult{
		GenerationID: uuid.New().String(),
		Status:       "success",
		HTML:         parsed.HTML,
		CSS:          parsed.CSS,
		ProviderUsed: providerUsed,
		DurationMs:   durationMs,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
