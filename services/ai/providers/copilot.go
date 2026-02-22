package providers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/zest-app/ai-service/models"
)

const copilotSystemPrompt = `You are an expert HTML/CSS developer.
Given a user's description, generate a complete, self-contained HTML page with embedded CSS.
Output ONLY the raw HTML — no explanations, no markdown, no code fences.
The HTML must include a <style> block inside <head> for all CSS.
Use semantic HTML5 elements, responsive design, and modern CSS.`

// CopilotProvider calls GitHub Copilot via the OpenAI-compatible Azure endpoint.
type CopilotProvider struct {
	apiKey  string
	baseURL string
	model   string
	client  *http.Client
}

// NewCopilotProvider creates a CopilotProvider. Returns nil if GITHUB_COPILOT_TOKEN is not set.
func NewCopilotProvider() *CopilotProvider {
	return &CopilotProvider{
		apiKey:  os.Getenv("GITHUB_COPILOT_TOKEN"),
		baseURL: "https://api.githubcopilot.com",
		model:   "gpt-4o",
		client:  &http.Client{},
	}
}

func (p *CopilotProvider) Name() string  { return "copilot" }
func (p *CopilotProvider) Enabled() bool { return p.apiKey != "" }

func (p *CopilotProvider) Generate(ctx context.Context, req models.GenerationRequest) (string, error) {
	payload := map[string]any{
		"model": p.model,
		"messages": []map[string]string{
			{"role": "system", "content": getSystemPrompt(req, copilotSystemPrompt)},
			{"role": "user", "content": buildUserPrompt(req)},
		},
		"temperature": 0.7,
		"max_tokens":  4096,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("copilot: marshal: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost,
		p.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("copilot: new request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)
	httpReq.Header.Set("Copilot-Integration-Id", "vscode-chat")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("copilot: do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("copilot: status %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	return extractOpenAIContent(resp.Body)
}
