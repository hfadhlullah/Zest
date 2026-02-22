package prompts_test

import (
	"strings"
	"testing"

	"github.com/zest-app/ai-service/prompts"
)

func TestBuildRefinementPrompt_ContainsPreviousHTML(t *testing.T) {
	html := "<html><body><h1>Hello</h1></body></html>"
	css := "h1 { color: blue; }"
	instruction := "make the heading red"

	result := prompts.BuildRefinementPrompt(html, css, instruction)

	if !strings.Contains(result, html) {
		t.Errorf("expected prompt to contain previous HTML, got:\n%s", result)
	}
}

func TestBuildRefinementPrompt_ContainsPreviousCSS(t *testing.T) {
	html := "<html><body><p>Text</p></body></html>"
	css := "p { font-size: 16px; }"
	instruction := "change font size to 24px"

	result := prompts.BuildRefinementPrompt(html, css, instruction)

	if !strings.Contains(result, css) {
		t.Errorf("expected prompt to contain previous CSS, got:\n%s", result)
	}
}

func TestBuildRefinementPrompt_ContainsInstruction(t *testing.T) {
	html := "<html><body><button>Click</button></body></html>"
	css := ""
	instruction := "make the button background red"

	result := prompts.BuildRefinementPrompt(html, css, instruction)

	if !strings.Contains(result, instruction) {
		t.Errorf("expected prompt to contain refinement instruction, got:\n%s", result)
	}
}

func TestBuildRefinementPrompt_EmptyCSS_NoStyleBlock(t *testing.T) {
	html := "<html><body><div>Hi</div></body></html>"
	css := ""
	instruction := "add a border to the div"

	result := prompts.BuildRefinementPrompt(html, css, instruction)

	// When CSS is empty, the EXISTING STYLESHEET section should be absent
	if strings.Contains(result, "EXISTING STYLESHEET") {
		t.Errorf("expected no stylesheet section when CSS is empty, got:\n%s", result)
	}
}

func TestBuildRefinementPrompt_WhitespaceCSSIsIgnored(t *testing.T) {
	html := "<html><body></body></html>"
	css := "   \n   "
	instruction := "add a heading"

	result := prompts.BuildRefinementPrompt(html, css, instruction)

	if strings.Contains(result, "EXISTING STYLESHEET") {
		t.Errorf("expected whitespace-only CSS to be ignored, got:\n%s", result)
	}
}

func TestBuildRefinementPrompt_InstructionAppearsLast(t *testing.T) {
	html := "<html><body></body></html>"
	css := "body {}"
	instruction := "unique-refinement-instruction-marker"

	result := prompts.BuildRefinementPrompt(html, css, instruction)

	htmlIdx := strings.Index(result, html)
	cssIdx := strings.Index(result, css)
	instrIdx := strings.Index(result, instruction)

	if htmlIdx < 0 || cssIdx < 0 || instrIdx < 0 {
		t.Fatalf("one or more parts missing from prompt")
	}
	if instrIdx < htmlIdx || instrIdx < cssIdx {
		t.Errorf("expected instruction to appear after HTML and CSS")
	}
}

func TestRefinementSystemPrompt_NotEmpty(t *testing.T) {
	if strings.TrimSpace(prompts.RefinementSystemPrompt) == "" {
		t.Error("RefinementSystemPrompt must not be empty")
	}
}
