# 08 — Increase max shot speed

**What to build:** Even at full power pull-back, the cue ball's top speed feels too slow. Increase the maximum shot speed by roughly 40% from its current value.

**Status:** ready-for-agent

- [ ] Identify the power→initial-velocity mapping used when a shot is released
- [ ] Increase the maximum velocity (full power pull-back) by roughly 40% from its current value
- [ ] Confirm physics (collision resolution, cushion bounce, friction) stays stable at the new higher top speed — no tunneling through balls or rails
- [ ] Re-run existing physics/rules unit tests to confirm nothing depends on the old max-speed value
