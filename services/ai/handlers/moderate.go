package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/zest-app/ai-service/models"
	"github.com/zest-app/ai-service/moderator"
)

// ModerateHandler handles POST /moderate.
// Allows the Next.js layer to pre-check a prompt before sending it through the
// full generation pipeline.
type ModerateHandler struct {
	mod *moderator.Moderator
}

// NewModerateHandler creates a ModerateHandler.
func NewModerateHandler(mod *moderator.Moderator) *ModerateHandler {
	return &ModerateHandler{mod: mod}
}

func (h *ModerateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req models.ModerationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}

	decision := h.mod.Check(req.Prompt)

	result := models.ModerationResult{
		Allowed: decision.Allowed,
		Reason:  decision.Reason,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// writeError writes a JSON error response.
func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(models.ErrorResponse{Error: message})
}
