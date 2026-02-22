package providers

import (
	"context"
	"fmt"

	"github.com/zest-app/ai-service/models"
)

const maxFallbackAttempts = 3 // BR-006

// Router selects and executes providers in order with fallback (BR-005).
// Order: GLM → Gemini → GitHub Copilot
type Router struct {
	providers []Provider
}

// NewRouter creates a Router with the ordered provider list.
// Providers are tried in order; disabled (no API key) providers are skipped.
func NewRouter(providers ...Provider) *Router {
	return &Router{providers: providers}
}

// Route tries each enabled provider in order, up to maxFallbackAttempts.
// Returns the raw LLM response string and the name of the provider used.
func (r *Router) Route(ctx context.Context, req models.GenerationRequest) (string, string, error) {
	var lastErr error
	attempts := 0

	for _, p := range r.providers {
		if !p.Enabled() {
			continue
		}
		if attempts >= maxFallbackAttempts {
			break
		}
		attempts++

		raw, err := p.Generate(ctx, req)
		if err != nil {
			lastErr = fmt.Errorf("provider %s: %w", p.Name(), err)
			continue
		}
		return raw, p.Name(), nil
	}

	if lastErr != nil {
		return "", "", fmt.Errorf("all providers failed (attempts=%d): %w", attempts, lastErr)
	}
	return "", "", fmt.Errorf("no providers enabled — configure at least one API key")
}
