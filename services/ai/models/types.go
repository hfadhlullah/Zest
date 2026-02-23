// Package models defines shared request/response types for the AI service.
package models

// GenerationRequest is the payload received from the Next.js API layer.
type GenerationRequest struct {
	RequestID   string     `json:"request_id"`
	UserID      string     `json:"user_id"` // "anonymous" when unauthenticated
	Prompt      string     `json:"prompt"`
	Context     GenContext `json:"context"`
	Preferences GenPrefs   `json:"preferences"`
	// PreferredProvider and PreferredModel allow the caller to pin a specific
	// provider/model. The router will try this provider first; if it fails it
	// falls back to the normal order.
	PreferredProvider string `json:"preferred_provider,omitempty"` // e.g. "gemini"
	PreferredModel    string `json:"preferred_model,omitempty"`    // e.g. "gemini-2.5-pro"
}

// GenContext carries refinement targeting metadata.
type GenContext struct {
	PreviousGenerationID string `json:"previous_generation_id,omitempty"`
	RefinementTarget     string `json:"refinement_target,omitempty"`
	// PreviousHTML and PreviousCSS carry the current page content so the
	// refinement handler can build a scoped prompt (BR-021).
	PreviousHTML string `json:"previous_html,omitempty"`
	PreviousCSS  string `json:"previous_css,omitempty"`
}

// GenPrefs holds output format and style hints.
type GenPrefs struct {
	OutputFormat string `json:"output_format"` // "html_css" | "tailwind"
	StyleHints   string `json:"style_hints,omitempty"`
}

// GenerationResult is the normalized response returned to Next.js.
type GenerationResult struct {
	GenerationID string `json:"generation_id"`
	Status       string `json:"status"` // "success" | "error"
	HTML         string `json:"html"`
	CSS          string `json:"css"`
	ProviderUsed string `json:"provider_used"`
	DurationMs   int64  `json:"duration_ms"`
	TokenCount   int    `json:"token_count"`
	Error        string `json:"error,omitempty"`
}

// ModerationRequest is the payload for the /moderate endpoint.
type ModerationRequest struct {
	RequestID string `json:"request_id"`
	UserID    string `json:"user_id"`
	Prompt    string `json:"prompt"`
}

// ModerationResult is the response from the /moderate endpoint.
type ModerationResult struct {
	Allowed bool   `json:"allowed"`
	Reason  string `json:"reason,omitempty"`
}

// ErrorResponse is a standardized error payload.
type ErrorResponse struct {
	Error string `json:"error"`
}
