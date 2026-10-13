# Proposal

Both PRs are already on `origin/master`, so the rollback goes forward, not backward:
one revert commit on branch `KAN-115-revert-to-kan-10`, merged through a PR.

- No `reset --hard`, no force-push. History stays, the work can come back with `git revert` of this commit.
- Source code and `tools/` end up identical to `7671983`.
- `docs/dev/018-site-scale` and `docs/dev/019-header-account` stay as the record of the reverted work.

Rejected: `reset --hard` + force-push (rewrites shared history), checkout of the old commit (does not change the site).
