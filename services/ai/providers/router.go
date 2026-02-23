package providers

import (
	"context"
	"fmt"
	"strings"

	"github.com/zest-app/ai-service/models"
)

const maxFallbackAttempts = 3 // BR-006

// Router selects and executes providers in order with fallback (BR-005).
type Router struct {
	providers []Provider
}

// NewRouter creates a Router with the ordered provider list.
// Providers are tried in order; disabled (no API key) providers are skipped.
func NewRouter(providers ...Provider) *Router {
	return &Router{providers: providers}
}

// AvailableProviders returns ProviderInfo for all registered providers.
func (r *Router) AvailableProviders() []ProviderInfo {
	out := make([]ProviderInfo, 0, len(r.providers))
	for _, p := range r.providers {
		out = append(out, ProviderInfo{
			Name:    p.Name(),
			Enabled: p.Enabled(),
			Models:  p.Models(),
		})
	}
	return out
}

// Route tries each enabled provider in order, up to maxFallbackAttempts.
// If req.PreferredProvider is set, that provider is tried first (if enabled),
// then falls back to the normal order for remaining attempts.
// Returns the raw LLM response string and the name of the provider used.
func (r *Router) Route(ctx context.Context, req models.GenerationRequest) (string, string, error) {
	var errs []string
	attempts := 0

	// Build an ordered list: preferred provider first, then the rest.
	ordered := r.orderedProviders(req.PreferredProvider)

	for _, p := range ordered {
		if !p.Enabled() {
			continue
		}
		if attempts >= maxFallbackAttempts {
			break
		}
		attempts++

		raw, err := p.Generate(ctx, req)
		if err != nil {
			errs = append(errs, fmt.Sprintf("%s: %v", p.Name(), err))
			continue
		}
		return raw, p.Name(), nil
	}

	if len(errs) > 0 {
		return "", "", fmt.Errorf("all providers failed (attempts=%d): %s", attempts, strings.Join(errs, "; "))
	}
	return "", "", fmt.Errorf("no providers enabled — configure at least one API key")
}

// orderedProviders returns the provider list with the preferred one moved first.
func (r *Router) orderedProviders(preferredName string) []Provider {
	if preferredName == "" {
		return r.providers
	}
	result := make([]Provider, 0, len(r.providers))
	var rest []Provider
	for _, p := range r.providers {
		if p.Name() == preferredName {
			result = append(result, p)
		} else {
			rest = append(rest, p)
		}
	}
	return append(result, rest...)
}
