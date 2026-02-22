// Package providers implements LLM provider clients.
// Each provider satisfies the Provider interface.
package providers

import (
	"context"

	"github.com/zest-app/ai-service/models"
)

// Provider is the interface all LLM clients must satisfy.
type Provider interface {
	// Name returns the canonical provider name (e.g. "glm", "gemini", "copilot").
	Name() string
	// Enabled returns true when the provider is configured (API key present).
	Enabled() bool
	// Generate sends a generation request and returns a raw LLM response string.
	Generate(ctx context.Context, req models.GenerationRequest) (string, error)
}
