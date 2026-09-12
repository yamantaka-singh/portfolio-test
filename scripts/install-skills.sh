#!/usr/bin/env bash
# Pins every skill this plan uses into .agents/skills/ (Antigravity project scope).
# Skips skills that already exist, so approved task-observer updates (ADR-0008) are never overwritten.
# Need something not listed? Propose it as a task-observer observation (AGENTS.md section 3);
# add its line here only after the user approves it at a gate.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=.agents/skills
mkdir -p "$DEST"

add() {
  local src=$1; shift
  local args=()
  for s in "$@"; do [ -d "$DEST/$s" ] || args+=(--skill "$s"); done
  [ ${#args[@]} -eq 0 ] && return 0
  npx -y skills@1.5.26 add "$src" "${args[@]}" -a antigravity -y --copy
}

add rebelytics/one-skill-to-rule-them-all task-observer

add obra/superpowers executing-plans subagent-driven-development dispatching-parallel-agents \
  using-git-worktrees test-driven-development verification-before-completion requesting-code-review
add D4Vinci/Scrapling scrapling-official
add nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max
add anthropics/skills frontend-design webapp-testing
add vercel-labs/agent-skills web-design-guidelines deploy-to-vercel
add DietrichGebert/ponytail ponytail ponytail-review
add leonxlnx/taste-skill design-taste-frontend high-end-visual-design full-output-enforcement
add mattpocock/skills grilling writing-for-agents diagnosing-bugs
add ConardLi/garden-skills web-design-engineer gpt-image-2

copy_local() {
  local from=$1 name=$2
  [ -d "$DEST/$name" ] && return 0
  if [ ! -d "$from" ]; then echo "MISSING local skill $from — try: npx -y skills@1.5.26 find $name"; return 0; fi
  cp -R "$from" "$DEST/$name"
  # web3d skills ship as <name>-skill.md; Antigravity expects SKILL.md
  [ -f "$DEST/$name/SKILL.md" ] || mv "$DEST/$name"/*.md "$DEST/$name/SKILL.md"
}

WEB3D=${WEB3D_SKILLS:-$HOME/projects/3d-design/web3d-skills}
for s in web3d-art-direction web3d-motion-choreography web3d-interaction-ux web3d-performance-budget web3d-ship-deploy; do
  copy_local "$WEB3D/$s" "$s"
done

AG=${ANTIGRAVITY_SKILLS:-$HOME/.gemini/config/skills}
for s in astro scroll-experience premium-web-design design-system modern-web-guidance seo schema-markup \
  core-web-vitals accessibility-auditor copywriting humanizer architecture-decision-records \
  zod-validation-expert javascript-testing-patterns python-testing-patterns \
  web-performance-optimization debug-optimize-lcp clean-code a11y-debugging seo-fundamentals; do
  copy_local "$AG/$s" "$s"
done

echo "Installed: $(ls "$DEST" | wc -l | tr -d ' ') skills"
