// Package providers implements LLM provider clients.
// Each provider satisfies the Provider interface.
package providers

import (
	"context"

	"github.com/zest-app/ai-service/models"
)

// ModelInfo describes a single model exposed by a provider.
type ModelInfo struct {
	ID          string `json:"id"`           // e.g. "gemini-2.5-flash"
	DisplayName string `json:"display_name"` // e.g. "Gemini 2.5 Flash"
	Provider    string `json:"provider"`     // canonical provider name
}

// ProviderInfo is returned by the /models endpoint for one provider.
type ProviderInfo struct {
	Name    string      `json:"name"`
	Enabled bool        `json:"enabled"`
	Models  []ModelInfo `json:"models"`
}

// Provider is the interface all LLM clients must satisfy.
type Provider interface {
	// Name returns the canonical provider name (e.g. "glm", "gemini", "copilot").
	Name() string
	// Enabled returns true when the provider is configured (API key present).
	Enabled() bool
	// Models returns the list of models this provider exposes.
	Models() []ModelInfo
	// Generate sends a generation request and returns a raw LLM response string.
	Generate(ctx context.Context, req models.GenerationRequest) (string, error)
}
