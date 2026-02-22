// Package moderator implements content moderation for prompt safety (BR-004).
package moderator

import (
	"strings"
)

// badWords is the test bad-word list used for content moderation.
// In production this would be replaced with an ML-based classifier.
var badWords = []string{
	"exploit", "hack", "malware", "phishing", "ransomware",
	"ddos", "rootkit", "spyware", "trojan", "keylogger",
	"porn", "xxx", "nude", "nsfw",
}

// Decision represents the outcome of a moderation check.
type Decision struct {
	Allowed bool
	Reason  string // populated when Allowed = false
}

// Moderator checks prompt content against policy rules.
type Moderator struct{}

// New returns a new Moderator instance.
func New() *Moderator {
	return &Moderator{}
}

// Check evaluates a prompt and returns a moderation Decision.
// It enforces BR-004: content moderation MUST run before any LLM call.
func (m *Moderator) Check(prompt string) Decision {
	if strings.TrimSpace(prompt) == "" {
		return Decision{Allowed: false, Reason: "prompt must not be empty"}
	}
	if len(prompt) < 10 {
		return Decision{Allowed: false, Reason: "prompt too short — minimum 10 characters"}
	}
	if len(prompt) > 4000 {
		return Decision{Allowed: false, Reason: "prompt too long — maximum 4000 characters"}
	}

	lower := strings.ToLower(prompt)
	for _, word := range badWords {
		if strings.Contains(lower, word) {
			return Decision{
				Allowed: false,
				Reason:  "prompt contains disallowed content",
			}
		}
	}

	return Decision{Allowed: true}
}
