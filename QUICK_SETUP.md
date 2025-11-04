# Quick Setup Guide - Branch Protection

## 🚀 5-Minute Setup to Block Merging Failed PRs

### Step 1: Go to Repository Settings

Navigate to: `https://github.com/bill-luu/clio-pets/settings/branches`

Or manually:

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in left sidebar

### Step 2: Add Branch Protection Rule

Click the **Add branch protection rule** button

### Step 3: Configure Protection

Fill in these fields:

```
Branch name pattern: main

☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging

   Search for status checks:
   ☑️ build_and_test

☑️ Require a pull request before merging
   Required approvals: 1

☑️ Do not allow bypassing the above settings

☑️ Include administrators (recommended)
```

### Step 4: Save

Click **Create** at the bottom

## ✅ Done!

Now PRs with failed linting or build checks **cannot be merged**.

---

## 🧪 Test It

1. **Create a test PR with a linting error:**

```bash
git checkout -b test-protection
echo "import React, { useState, useCallback } from 'react'; export default function Test() { return <div>Test</div>; }" > src/test.jsx
git add .
git commit -m "Test: intentional linting error"
git push origin test-protection
```

2. **Open PR on GitHub** - You'll see:

   - ❌ Checks failed
   - 🔴 Merge button disabled
   - "Merging is blocked"

3. **Fix and push again:**

```bash
echo "import React from 'react'; export default function Test() { return <div>Test</div>; }" > src/test.jsx
git add .
git commit -m "Fix: remove unused import"
git push
```

4. **Check PR again:**
   - ✅ Checks passed
   - 🟢 Merge button enabled
   - Can now merge!

---

## 📋 Quick Reference

| Setting                | Purpose                        |
| ---------------------- | ------------------------------ |
| Require status checks  | Blocks merge if CI fails       |
| Require PR             | Prevents direct pushes to main |
| Require approvals      | Enforces code review           |
| Include administrators | Rules apply to everyone        |

---

## 🆘 Troubleshooting

**Don't see `build_and_test` in the status checks list?**

The check must run at least once first:

1. Create any PR (can be a draft)
2. Wait for GitHub Actions to run
3. Go back to branch protection settings
4. Search again - it should now appear

**Still having issues?**

See the full guide: [GITHUB_BRANCH_PROTECTION.md](./GITHUB_BRANCH_PROTECTION.md)

---

## 🎯 What This Achieves

```
Before:
PR with errors → 🟢 Can merge → 💥 Broken main branch

After:
PR with errors → 🔴 Cannot merge → ✅ Main branch protected
PR passes checks → 🟢 Can merge → ✅ Clean deployment
```
