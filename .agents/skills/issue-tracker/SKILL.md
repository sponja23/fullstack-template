---
name: issue-tracker
description: This repo's GitHub issue conventions. Read before any issue or pull-request operation, including creating, reading, listing, triaging, commenting, labeling, closing, or implementing an issue. Covers parent/sub-issue and blocker relationships, PR closing references, and stacked PRs.
---

# Issue tracker: GitHub

Issues live on `sponja23/acme`. Use the `gh` CLI; inside a clone it infers the repository from the remote.

## Operations

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --json number,title,state,stateReason,author,assignees,body,labels,milestone,comments,parent,blockedBy,blocking,subIssues,url`
- List: `gh issue list --state open --json number,title,body,labels,comments,parent,blockedBy,blocking,subIssues`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

For the triage vocabulary, see `docs/agents/triage-labels.md`.

## Parents

Model parent/child relationships as native GitHub sub-issues, never as a prose section in the issue body.

- Create a child: `gh issue create --title "..." --body "..." --parent <parent-number>`
- Re-point a child: `gh issue edit <number> --parent <parent-number>`
- Attach or detach children from the parent with `--add-sub-issue` and `--remove-sub-issue`.
- Detach a child with `gh issue edit <number> --remove-parent`.

Whenever an issue has a parent, read the immediate parent too. Use `.parent.number` from the canonical read.

## Blockers

Model dependencies with GitHub's native `--blocked-by` and `--blocking` flags. These are inverse views of one edge, so verify the direction before editing.

- Add or remove a blocker with `--add-blocked-by` / `--remove-blocked-by`.
- Add or remove something this issue blocks with `--add-blocking` / `--remove-blocking`.

Whenever an issue is blocked, read each blocker automatically using `.blockedBy.nodes[].number` from the canonical read.

## Pull requests

A PR that fully resolves an issue includes `Closes #XXX` on its own line. Use one line per resolved issue. Use `Refs #XXX` when the PR relates to an issue without resolving it.

Use `gh stack` when one logical change forms a natural chain too large for one reviewable PR. Use separate PRs for unrelated work and native issue dependencies for ordering.
