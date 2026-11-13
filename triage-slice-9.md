# Slice 9: editor and teams

## Approved design and implementation plan

Goal: triage the six assigned frontend findings, apply the four approved project
decisions, and leave a reviewable open PR against this fork's main branch.

The existing Vue/TipTap frontend and Spring/JPA backend remain the architecture.
Prefer local behavior fixes over casts, non-null assertions, or blanket suppressions.
For D1, narrow exclusions to intentional framework reference sharing and enforce
defensive collection boundaries elsewhere. D2, D3, and D4 remain enabled.

Alternatives considered: copying every entity association would disrupt the existing
managed object graph; disabling all four rules would discard useful checks. The
approved approach keeps framework sharing intentional and fixes actionable sites.

- [ ] Add Vitest/component regression coverage; observe and commit the failing tests.
- [ ] Fix TipTap's emitUpdate option and the missing-artifact guard; remove dead drag
      handlers and unused Cypress callback parameters; run frontend checks.
- [ ] D1: classify all 219 findings; exclude framework sharing precisely, fix other
      collection boundaries, and explain any required site exception.
- [ ] D2: document necessary constructors and remove only truly redundant constructors.
- [ ] D3/D4: add all missing braces and guard the four flagged log calls.
- [ ] Delete resolved baseline entries without adding any; compare before/after counts.
- [ ] Run verification, review the diff, create the issue/PR, and inspect CI.

Review focus: server loads must not emit editor updates; user edits must still emit;
invalid artifact indexes must leave the dialog closed; valid edits must copy the
selected artifact; collection changes must preserve nulls, ordering, and framework
association identity where those are part of the current contract.

## Evidence and progress

- Initial frontend gate: 18 vue-tsc errors; 130 ESLint problems (128 errors, 2 warnings).
- npm ci required CYPRESS_INSTALL_BINARY=0 here because the Cypress desktop download
  was not a valid ZIP. This skips the desktop binary, not npm dependencies.
- Initial Maven verification was blocked by dependency access; Docker is unavailable.
- GitHub connector issue creation returned 403 (Resource not accessible by integration).

The PR contains the final per-finding verdicts, commit links, and verification results.
