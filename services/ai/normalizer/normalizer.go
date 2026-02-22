// Package normalizer extracts structured HTML/CSS from raw LLM text responses.
package normalizer

import (
	"regexp"
	"strings"
)

var (
	// Match fenced code blocks: ```html ... ``` or ```css ... ```
	reHTMLFenced = regexp.MustCompile("(?si)```(?:html)?(.*?)```")
	reCSSFenced  = regexp.MustCompile("(?si)```css(.*?)```")

	// Match bare <html>...</html> and <style>...</style> tags
	reHTMLTag  = regexp.MustCompile(`(?si)<html[^>]*>(.*?)</html>`)
	reBodyTag  = regexp.MustCompile(`(?si)<body[^>]*>(.*?)</body>`)
	reStyleTag = regexp.MustCompile(`(?si)<style[^>]*>(.*?)</style>`)
)

// Result holds the extracted and normalized HTML and CSS.
type Result struct {
	HTML string
	CSS  string
}

// Parse extracts HTML and CSS from a raw LLM response string.
// It handles:
//   - Fenced code blocks (```html ... ```, ```css ... ```)
//   - Bare <html>...</html> and <style>...</style> tags
//
// The format parameter is "html_css" or "tailwind" — in tailwind mode
// there is no separate CSS block; Tailwind classes are embedded in HTML.
func Parse(raw, format string) Result {
	raw = strings.TrimSpace(raw)

	css := extractCSS(raw)
	html := extractHTML(raw, css)

	return Result{
		HTML: strings.TrimSpace(html),
		CSS:  strings.TrimSpace(css),
	}
}

// extractCSS pulls the CSS content out of a raw LLM response.
func extractCSS(raw string) string {
	// 1. Prefer fenced ```css block
	if m := reCSSFenced.FindStringSubmatch(raw); len(m) > 1 {
		return strings.TrimSpace(m[1])
	}
	// 2. Fall back to <style> tag contents
	if m := reStyleTag.FindStringSubmatch(raw); len(m) > 1 {
		return strings.TrimSpace(m[1])
	}
	return ""
}

// extractHTML pulls the HTML content out of a raw LLM response.
func extractHTML(raw, css string) string {
	// 1. If there's a full <html>...</html> block, use that.
	if m := reHTMLTag.FindStringSubmatch(raw); len(m) > 1 {
		return strings.TrimSpace(m[0])
	}

	// 2. Try a fenced HTML block (```html ... ```)
	if m := reHTMLFenced.FindStringSubmatch(raw); len(m) > 1 {
		candidate := strings.TrimSpace(m[1])
		// Only use if it looks like HTML (starts with < or <!DOCTYPE)
		if strings.HasPrefix(candidate, "<") {
			return candidate
		}
	}

	// 3. Try bare <body>...</body>
	if m := reBodyTag.FindStringSubmatch(raw); len(m) > 1 {
		inner := strings.TrimSpace(m[1])
		if css != "" {
			return "<style>" + css + "</style>\n" + inner
		}
		return inner
	}

	// 4. If raw starts with a tag, return it as-is
	if strings.HasPrefix(raw, "<") {
		return raw
	}

	// 5. Fallback: wrap raw text in a paragraph inside a minimal HTML shell
	return "<html><body><p>" + raw + "</p></body></html>"
}
