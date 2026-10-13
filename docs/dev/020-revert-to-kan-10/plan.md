# Plan

1. Stash local uncommitted files (016 shots, `teamwork/`).
2. Branch `KAN-115-revert-to-kan-10` from `master`.
3. `git revert -m 1` the merges `2ce752e` and `2d2c2f3`, keep docs 018/019.
4. Verify: `git diff 7671983` is empty outside docs; `tsc --noEmit` passes.
5. Commit, push, open PR with KAN-115 in the title.
