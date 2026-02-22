package providers

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/zest-app/ai-service/models"
)

// buildUserPrompt creates the user message from a GenerationRequest.
// For refinement requests the prompt already contains the full scoped context
// (built by prompts.BuildRefinementPrompt); style hints and format hints are
// skipped because they are already embedded.
func buildUserPrompt(req models.GenerationRequest) string {
	if req.Context.RefinementTarget != "" {
		// Refinement: prompt is already fully formed — return as-is
		return req.Prompt
	}

	var sb strings.Builder
	sb.WriteString(req.Prompt)
	if req.Preferences.StyleHints != "" {
		sb.WriteString("\n\nStyle hints: ")
		sb.WriteString(req.Preferences.StyleHints)
	}
	if req.Preferences.OutputFormat == "tailwind" {
		sb.WriteString("\n\nUse Tailwind CSS utility classes instead of a <style> block.")
	}
	return sb.String()
}

// getSystemPrompt returns the appropriate system prompt for a request.
// For refinement requests, RefinementTarget holds the scoped system prompt
// (prompts.RefinementSystemPrompt). For initial generation it returns "".
// Each provider falls back to its own default when this returns "".
func getSystemPrompt(req models.GenerationRequest, defaultPrompt string) string {
	if req.Context.RefinementTarget != "" {
		return req.Context.RefinementTarget
	}
	return defaultPrompt
}

// openAIChatResponse is the shape of an OpenAI-compatible chat completion response.
type openAIChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// extractOpenAIContent decodes an OpenAI-compatible response and returns the first choice text.
func extractOpenAIContent(r io.Reader) (string, error) {
	var result openAIChatResponse
	if err := json.NewDecoder(r).Decode(&result); err != nil {
		return "", fmt.Errorf("decode openai response: %w", err)
	}
	if len(result.Choices) == 0 {
		return "", fmt.Errorf("openai: empty choices in response")
	}
	return result.Choices[0].Message.Content, nil
}
