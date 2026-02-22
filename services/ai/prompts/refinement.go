// Package prompts provides LLM prompt construction utilities.
package prompts

import (
	"fmt"
	"strings"
)

// RefinementSystemPrompt instructs the LLM to make only targeted changes
// rather than regenerating the entire document (BR-021).
const RefinementSystemPrompt = `You are an expert HTML/CSS developer performing a targeted edit.

You will be given:
1. An existing HTML page (with embedded CSS in a <style> block)
2. A user's refinement instruction

Your task:
- Apply ONLY the change described by the instruction.
- Preserve all other elements, styles, and structure exactly as they are.
- Do not rename, remove, or restructure unrelated elements.
- Return the COMPLETE updated HTML document (full page, including unchanged parts).
- Output ONLY the raw HTML — no explanations, no markdown, no code fences.`

// BuildRefinementPrompt constructs the user message for a scoped refinement
// request. It injects the previous HTML/CSS as context alongside the
// refinement instruction so the LLM has full page context.
//
// previousCSS may be empty when the format is "tailwind" (CSS is inline).
func BuildRefinementPrompt(previousHTML, previousCSS, refinementMessage string) string {
	var sb strings.Builder

	sb.WriteString("EXISTING PAGE:\n")
	sb.WriteString("```html\n")
	sb.WriteString(strings.TrimSpace(previousHTML))
	sb.WriteString("\n```\n")

	if strings.TrimSpace(previousCSS) != "" {
		sb.WriteString("\nEXISTING STYLESHEET:\n")
		sb.WriteString("```css\n")
		sb.WriteString(strings.TrimSpace(previousCSS))
		sb.WriteString("\n```\n")
	}

	sb.WriteString(fmt.Sprintf("\nREFINEMENT INSTRUCTION:\n%s", strings.TrimSpace(refinementMessage)))

	return sb.String()
}
