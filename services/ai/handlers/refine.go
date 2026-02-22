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
	"github.com/zest-app/ai-service/prompts"
	"github.com/zest-app/ai-service/providers"
)

// RefineHandler handles POST /refine.
// It builds a scoped refinement prompt so the LLM only modifies the
// targeted element/section (BR-021) instead of regenerating the full page.
type RefineHandler struct {
	router *providers.Router
	mod    *moderator.Moderator
}

// NewRefineHandler creates a RefineHandler.
func NewRefineHandler(router *providers.Router, mod *moderator.Moderator) *RefineHandler {
	return &RefineHandler{router: router, mod: mod}
}

func (h *RefineHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req models.GenerationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}

	if req.Prompt == "" {
		writeError(w, http.StatusBadRequest, "prompt is required")
		return
	}

	// BR-004: moderation before every LLM call, including refinements
	decision := h.mod.Check(req.Prompt)
	if !decision.Allowed {
		writeError(w, http.StatusUnprocessableEntity, decision.Reason)
		return
	}

	if req.RequestID == "" {
		req.RequestID = uuid.New().String()
	}
	if req.UserID == "" {
		req.UserID = "anonymous"
	}

	// Build scoped refinement prompt (BR-021).
	// The prompt field on the request carries only the user's instruction;
	// we replace it with the full contextual prompt before routing.
	req.Prompt = prompts.BuildRefinementPrompt(
		req.Context.PreviousHTML,
		req.Context.PreviousCSS,
		req.Prompt,
	)

	// Override the system prompt by routing through the refinement system prompt.
	// We store it in a custom field that providers check (see provider.go).
	req.Context.RefinementTarget = prompts.RefinementSystemPrompt

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
