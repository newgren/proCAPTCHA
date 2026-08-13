# 10 — Versus framing / named opponent

**What to build:** Give the player more feedback that they're playing against another player, not just taking turns against a vague "computer." Show a "you vs. &lt;opponent name&gt;" framing somewhere in the widget, and add an intro moment before the Challenge starts stating the player must beat that named opponent. The name is randomized per Challenge, drawn from a small pool of joke names (e.g. "Neckbeard", "xXPocketMasterXx", "Big_Chungus69", "sweatypalms", "DadBod", "Kevin_from_IT").

**Status:** ready-for-agent

- [ ] Add a visible "you vs. &lt;opponent name&gt;" framing in the widget so turn-taking reads as two players, not "your turn / computer's turn"
- [ ] Pick a random name from a small joke-name pool each time a Challenge racks (new game on load or "Try Again"), and show it in that framing
- [ ] Add an intro moment before the Challenge starts stating the player must beat the named opponent
- [ ] Same random name persists for the duration of that one Challenge (doesn't change mid-game)
