# 017 · Project audit and Jira backlog

Jira: [KAN-10](https://deangeme.atlassian.net/browse/KAN-10)

## Owner's words (verbatim, 2026-09-27)

> Братанчик проаналізуй мені наш проєкт і зроби мені таски в jira

## Restatement

Audit the current state of the Profitool storefront (code, docs, CI, deploy) and turn every open
defect, deferred item and piece of technical debt into a ticket on the Profitool Team board (`KAN`),
grouped under the existing epics Design, Frontend, Backend, Marketing, Analytics.

## Success criteria

- Every "known defect" and "left for later" note in `docs/dev/001-016` is either a ticket or
  consciously dropped with a reason.
- Every ticket has an estimate, a parent epic, acceptance criteria and a source citation.
- The audit itself is recorded here so the next session does not redo it.

## Constraints

- Ticket rules from `~/.claude/CLAUDE.md`: estimate, tech design link, key in branch and commit.
- No duplicates of the owner's own tickets (KAN-4..KAN-9).
