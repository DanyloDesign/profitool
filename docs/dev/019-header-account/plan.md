# 019 · Plan

Jira: [KAN-32](https://deangeme.atlassian.net/browse/KAN-32) · branch `KAN-32-header-account`

Size S. One file, the orchestrator does it (rule: trivial edit).

| # | Step | File | Check |
|---|---|---|---|
| 1 | `AccountPill` after `CartButton`, `lg:inline-flex`, guest and signed-in states | `src/components/layout/header.tsx` | shots 1024/1280/1512, both themes, focus ring |
| 2 | Verify | `tools/shots` | smoke 30/30, no overflow at 1024, eslint, tsc |
| 3 | PR, merge, Pages deploy, live check | | live shot |
