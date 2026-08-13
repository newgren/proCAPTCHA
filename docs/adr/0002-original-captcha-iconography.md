# Use original iconography for the Verification Widget, not Google's

The visual reference for the Verification Widget is a real reCAPTCHA screenshot, and the structural reference (checkbox → spinner → expanding card) is wesbos/Kitboga-captcha, which itself uses only original assets — no Google logo, no "reCAPTCHA" wordmark. We're following that precedent: same layout and interaction pattern, but an original pinwheel-style icon and a made-up wordmark instead of Google's trademarked logo/name.

This was a deliberate call, not an oversight: reproducing Google's actual logo would read as impersonating their product rather than joking about the concept, regardless of the demo's non-commercial intent.

## Consequences

Don't swap in Google's real logo/wordmark later to make the widget "look more convincing" — that's the specific thing this ADR exists to prevent.
