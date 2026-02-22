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

const geminiSystemPrompt = `You are an expert HTML/CSS developer.
Given a user's description, generate a complete, self-contained HTML page with embedded CSS.
Output ONLY the raw HTML — no explanations, no markdown, no code fences.
The HTML must include a <style> block inside <head> for all CSS.
Use semantic HTML5 elements, responsive design, and modern CSS.`

// GeminiProvider calls Google Gemini via the generativelanguage REST API.
type GeminiProvider struct {
	apiKey string
	model  string
	client *http.Client
}

// NewGeminiProvider creates a GeminiProvider. Returns nil if GEMINI_API_KEY is not set.
func NewGeminiProvider() *GeminiProvider {
	return &GeminiProvider{
		apiKey: os.Getenv("GEMINI_API_KEY"),
		model:  "gemini-1.5-flash",
		client: &http.Client{},
	}
}

func (p *GeminiProvider) Name() string  { return "gemini" }
func (p *GeminiProvider) Enabled() bool { return p.apiKey != "" }

func (p *GeminiProvider) Generate(ctx context.Context, req models.GenerationRequest) (string, error) {
	url := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
		p.model, p.apiKey,
	)

	payload := map[string]any{
		"system_instruction": map[string]any{
			"parts": []map[string]string{{"text": getSystemPrompt(req, geminiSystemPrompt)}},
		},
		"contents": []map[string]any{
			{
				"role": "user",
				"parts": []map[string]string{
					{"text": buildUserPrompt(req)},
				},
			},
		},
		"generationConfig": map[string]any{
			"temperature":     0.7,
			"maxOutputTokens": 4096,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("gemini: marshal: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("gemini: new request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("gemini: do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("gemini: status %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	return extractGeminiContent(resp.Body)
}

// extractGeminiContent parses the Gemini response format.
func extractGeminiContent(r io.Reader) (string, error) {
	var result struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.NewDecoder(r).Decode(&result); err != nil {
		return "", fmt.Errorf("gemini: decode response: %w", err)
	}
	if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("gemini: empty candidates in response")
	}
	return result.Candidates[0].Content.Parts[0].Text, nil
}
