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

- [x] Add Vitest/component regression coverage; observe and commit the failing tests.
- [x] Fix TipTap's emitUpdate option and the missing-artifact guard; remove dead drag
      handlers and unused Cypress callback parameters; run frontend checks.
- [x] D1: classify all 219 findings; exclude framework sharing precisely, fix other
      collection boundaries, and explain any required site exception.
- [x] D2: document necessary constructors and remove only truly redundant constructors.
- [x] D3/D4: add all missing braces and guard the four flagged log calls.
- [x] Delete resolved baseline entries without adding any; compare before/after counts.
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

## Verified results

- Frontend test commit `f0efdc3`: two regression failures and one passing control.
  Fix commit `c32ef3c`: all three pass. Tests use the real Vue component and TipTap;
  API/session boundaries are mocked. The existing duplicate Link/Underline extension
  warning remains outside this slice.
- Collection test commit `2675bae`: five failures before the boundary fixes.
  Policy fix commit `4ca128f`: five collection tests and the 16 evaluation service tests pass.
- SpotBugs baseline: 237 to 18 Match entries. D1 accounts for 144 JPA findings,
  27 injected-dependency findings, 46 collection-boundary findings, and two principal
  identity exceptions with method-level reasons. No other SpotBugs rules are excluded.
- PMD baseline: 130 to 56 represented findings; stored class/rule pairs: 101 to 44.
  The file groups repeated findings and is not one line per finding. D2 removes 40,
  D3 removes 30, and D4 removes four. No rules or baseline entries were added.
- Backend analyzer gate (`verify -DskipTests`) passes. A JRE-only environment lacks
  ct.sym, so local Maven uses source/target 21 instead of --release 21. A temporary
  Maven proxy configuration enables dependency downloads; neither workaround changes
  repository build configuration.
- 130 non-Docker backend tests pass. Mockito required an explicit mockito-core
  javaagent in this environment. A broader run encountered Docker initialization
  errors, including WebConfigSpaForwardingTest (which is not tagged integration).
  Docker-based integration tests and the SPA forwarding test remain unverified.
- Frontend type errors: 18 to 14; ESLint problems: 130 to 128. All six assigned
  findings are gone. Prettier reports six files both before and after.
- Independent review found no actionable Critical/Important/substantive Minor issues.
  Reviewer independently ran the three frontend tests and checked the 14 remaining
  type errors.
- Publishing is blocked here: GitHub connector writes return 403, command-line Git
  has no credentials, and the browser is signed out. The issue and PR are prepared
  for publication through the owner's GitHub CLI; no CI run is claimed.

## Rejected or rewritten agent alternatives

- Do not copy every entity association: existing helpers mutate managed collections
  and maintain bidirectional links. D1 is narrowed instead.
- Do not use List.copyOf/Set.copyOf here: they reject null elements, and set copying
  can change iteration order. Snapshots retain nulls and LinkedHashSet order; they
  isolate collection membership, not mutable element objects.
- Do not add a dummy drag ref or TypeScript non-null assertion merely to silence a
  finding. Remove unused handlers and guard the actual array lookup instead.
- Do not replace privateComments=null with an empty list to satisfy PMD; the student
  summary deliberately clears private comments. Nullable snapshot getters preserve
  that contract without adding a suppression.
- Do not leave EvaluationService adding to a getter's defensive copy: collect the
  report rows and assign them through the setter. Existing report tests cover this.
