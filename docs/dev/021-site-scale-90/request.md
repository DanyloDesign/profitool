# 021 · Request

Jira: [KAN-121](https://deangeme.atlassian.net/browse/KAN-121) · branch `KAN-121-site-scale-90`

## Owner's words (2026-10-14, Ukrainian, verbatim)

> Мені подобається вигляд сайту коли я маштабюую його на 90%. зроби це як основним маштабом.
> При цьому не змінюючи структуру сайту. не чепай ніяких елементів сайту

## Restatement

The site should look by default the way it looks at 90% browser zoom. Same layout, same
components, same grid: only the scale changes.

## Context

018 (KAN-31) did a 75% scale plus grid and layout changes; it was reverted in 020 (KAN-115).
This task takes only the scale part, at 90%, with no layout changes. Branch is stacked on
`KAN-115-revert-to-kan-10` (PR #5 not merged yet).
