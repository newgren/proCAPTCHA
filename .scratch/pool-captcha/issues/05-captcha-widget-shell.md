# 05 — CAPTCHA Verification Widget shell

**What to build:** Wrap the already-working 1v1 game (ticket 04) in the actual CAPTCHA framing. On page load, show a checkbox card styled like a familiar "I'm not a robot" widget, using original iconography (not Google's actual reCAPTCHA logo/wordmark — see ADR-0002). Clicking the checkbox shows a brief loading spinner, then the card expands into a connected card below it (small linking arrow) containing the live Challenge. On a Legal Win, the widget shows a clear verified/checkmark success state. On any loss, it shows a failure state with a "Try Again" button that racks a fresh game (fresh `game.js` state, player breaks again) in place, with no page reload. This is the finished demo.

**Blocked by:** 04 — Computer Opponent

**Status:** ready-for-agent

- [ ] Page loads showing only the checkbox card (idle state) — the Challenge is not visible yet
- [ ] Clicking/tapping the checkbox shows a brief loading spinner before anything else happens
- [ ] After the spinner, the checkbox card's card expands into a connected card below it (visually linked, e.g. a small arrow) containing the live Challenge from ticket 04
- [ ] The widget's icon and wordmark are original assets, not Google's actual reCAPTCHA logo or wordmark
- [ ] On a Legal Win, the widget shows a distinct verified/success state (e.g. a checkmark) and the Challenge stops being interactive
- [ ] On any loss (wrong pocket, foul on the eight, Early Pot, or being beaten by the Computer Opponent), the widget shows a distinct failure state with a visible "Try Again" button
- [ ] Clicking "Try Again" racks a brand-new game in place (fresh table, player breaks again) without reloading the page, and returns the widget to a playable Challenge state
- [ ] Manual verification only — play a full game through to both a win and a loss via the running page (e.g. using the `/run` skill); no automated rendering/end-to-end tests are required for this ticket
