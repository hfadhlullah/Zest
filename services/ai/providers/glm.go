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

const glmSystemPrompt = `You are an expert HTML/CSS developer. 
Given a user's description, generate a complete, self-contained HTML page with embedded CSS.
Output ONLY the raw HTML — no explanations, no markdown, no code fences.
The HTML must include a <style> block inside <head> for all CSS.
Use semantic HTML5 elements, responsive design, and modern CSS.`

// GLMProvider calls ZhipuAI GLM-4.5-Air via their OpenAI-compatible chat completions API.
type GLMProvider struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

// NewGLMProvider creates a GLMProvider. Returns nil if GLM_API_KEY is not set.
func NewGLMProvider() *GLMProvider {
	return &GLMProvider{
		apiKey:  os.Getenv("GLM_API_KEY"),
		baseURL: "https://api.z.ai/api/paas/v4",
		client:  &http.Client{},
	}
}

func (p *GLMProvider) Name() string    { return "glm" }
func (p *GLMProvider) Enabled() bool   { return p.apiKey != "" }

func (p *GLMProvider) Models() []ModelInfo {
	return []ModelInfo{
		{ID: "glm-4.5-air", DisplayName: "GLM-4.5 Air", Provider: "glm"},
		{ID: "glm-4.5", DisplayName: "GLM-4.5", Provider: "glm"},
	}
}

func (p *GLMProvider) Generate(ctx context.Context, req models.GenerationRequest) (string, error) {
	model := "glm-4.5-air"
	if req.PreferredModel != "" && req.PreferredProvider == p.Name() {
		model = req.PreferredModel
	}
	payload := map[string]any{
		"model": model,
		"messages": []map[string]string{
			{"role": "system", "content": getSystemPrompt(req, glmSystemPrompt)},
			{"role": "user", "content": buildUserPrompt(req)},
		},
		"temperature": 0.7,
		"max_tokens":  8192,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("glm: marshal: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost,
		p.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("glm: new request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("glm: do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("glm: status %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	return extractOpenAIContent(resp.Body)
}
