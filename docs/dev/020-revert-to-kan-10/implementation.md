# Implementation

- Local changes stashed as `before KAN-115 revert`. The file `tools/shots/nul` (Windows reserved name) could not be stashed or removed and stays untracked.
- Merges `2ce752e` (KAN-32) and `2d2c2f3` (KAN-31) reverted in one commit. Docs 018/019 kept.
- Verification: `git diff 7671983 -- . ':!docs/dev/018-site-scale' ':!docs/dev/019-header-account' ':!docs/dev/020-revert-to-kan-10'` is empty.
