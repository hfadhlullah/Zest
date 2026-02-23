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
	"sync"
	"time"

	"github.com/zest-app/ai-service/models"
)

const copilotSystemPrompt = `You are an expert HTML/CSS developer.
Given a user's description, generate a complete, self-contained HTML page with embedded CSS.
Output ONLY the raw HTML — no explanations, no markdown, no code fences.
The HTML must include a <style> block inside <head> for all CSS.
Use semantic HTML5 elements, responsive design, and modern CSS.`

// copilotSessionToken holds a short-lived Copilot API token and its expiry.
type copilotSessionToken struct {
	token     string
	expiresAt time.Time
}

func (t *copilotSessionToken) valid() bool {
	return t != nil && t.token != "" && time.Now().Before(t.expiresAt.Add(-30*time.Second))
}

// CopilotProvider calls GitHub Copilot via the OpenAI-compatible API.
// It accepts a GitHub OAuth token (gho_...) and exchanges it automatically
// for a short-lived Copilot session token before each request.
type CopilotProvider struct {
	oauthToken   string
	baseURL      string
	model        string
	client       *http.Client
	sessionMu    sync.Mutex
	sessionToken *copilotSessionToken
}

// NewCopilotProvider creates a CopilotProvider. Returns an instance regardless;
// Enabled() returns false when GITHUB_COPILOT_TOKEN is not set.
func NewCopilotProvider() *CopilotProvider {
	return &CopilotProvider{
		oauthToken: os.Getenv("GITHUB_COPILOT_TOKEN"),
		baseURL:    "https://api.githubcopilot.com",
		model:      "gpt-4o",
		client:     &http.Client{Timeout: 30 * time.Second},
	}
}

func (p *CopilotProvider) Name() string  { return "copilot" }
func (p *CopilotProvider) Enabled() bool { return p.oauthToken != "" }

func (p *CopilotProvider) Models() []ModelInfo {
	return []ModelInfo{
		{ID: "gpt-4o", DisplayName: "GPT-4o", Provider: "copilot"},
		{ID: "gpt-4o-mini", DisplayName: "GPT-4o Mini", Provider: "copilot"},
		{ID: "claude-3.5-sonnet", DisplayName: "Claude 3.5 Sonnet", Provider: "copilot"},
	}
}

// getSessionToken returns a valid Copilot session token, refreshing it if expired.
func (p *CopilotProvider) getSessionToken(ctx context.Context) (string, error) {
	p.sessionMu.Lock()
	defer p.sessionMu.Unlock()

	if p.sessionToken.valid() {
		return p.sessionToken.token, nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		"https://api.github.com/copilot_internal/v2/token", nil)
	if err != nil {
		return "", fmt.Errorf("copilot: build token request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+p.oauthToken)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Editor-Version", "vscode/1.85.0")
	req.Header.Set("Editor-Plugin-Version", "copilot-chat/0.12.0")
	req.Header.Set("User-Agent", "GithubCopilot/1.155.0")

	resp, err := p.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("copilot: token request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("copilot: token exchange status %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	var result struct {
		Token     string `json:"token"`
		ExpiresAt int64  `json:"expires_at"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("copilot: decode token response: %w", err)
	}
	if result.Token == "" {
		return "", fmt.Errorf("copilot: empty token in response")
	}

	p.sessionToken = &copilotSessionToken{
		token:     result.Token,
		expiresAt: time.Unix(result.ExpiresAt, 0),
	}
	return p.sessionToken.token, nil
}

func (p *CopilotProvider) Generate(ctx context.Context, req models.GenerationRequest) (string, error) {
	sessionToken, err := p.getSessionToken(ctx)
	if err != nil {
		return "", err
	}

	model := p.model
	if req.PreferredModel != "" && req.PreferredProvider == p.Name() {
		model = req.PreferredModel
	}

	payload := map[string]any{
		"model": model,
		"messages": []map[string]string{
			{"role": "system", "content": getSystemPrompt(req, copilotSystemPrompt)},
			{"role": "user", "content": buildUserPrompt(req)},
		},
		"temperature": 0.7,
		"max_tokens":  8192,
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
	httpReq.Header.Set("Authorization", "Bearer "+sessionToken)
	httpReq.Header.Set("Copilot-Integration-Id", "vscode-chat")
	httpReq.Header.Set("Editor-Version", "vscode/1.85.0")
	httpReq.Header.Set("Editor-Plugin-Version", "copilot-chat/0.12.0")
	httpReq.Header.Set("User-Agent", "GithubCopilot/1.155.0")

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
