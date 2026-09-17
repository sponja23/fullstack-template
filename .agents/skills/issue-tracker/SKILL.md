---
name: issue-tracker
description: This repo's GitHub issue conventions. Read before any issue or pull-request operation, including creating, reading, listing, triaging, commenting, labeling, closing, or implementing an issue. Covers parent/sub-issue and blocker relationships, PR closing references, and stacked PRs.
---

# Issue tracker: GitHub

Issues live on `sponja23/acme`. Use the `gh` CLI; inside a clone it infers the repository from the remote.

## Conventions

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --json number,title,state,stateReason,author,assignees,body,labels,milestone,comments,parent,blockedBy,blocking,subIssues,url`. In non-TTY output, `--comments` emits only comments and is empty when none exist, so use the JSON form.
- List: `gh issue list --state open --json number,title,body,labels,comments,parent,blockedBy,blocking,subIssues --jq '[.[] | {number, title, body, labels: [.labels[].name], parent: .parent.number, blockedBy: [.blockedBy.nodes[].number], blocking: [.blocking.nodes[].number], subIssues: [.subIssues.nodes[].number], comments: [.comments[].body]}]'`, adding label and state filters as needed.
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

For the triage vocabulary, see `docs/agents/triage-labels.md`.

## Parents (sub-issues)

Model parent/child relationships as native GitHub sub-issues, never as a prose section in the issue body.

- Create a child: `gh issue create --title "..." --body "..." --parent <parent-number>`
- Re-point a child: `gh issue edit <number> --parent <parent-number>`
- Attach or detach children from the parent with `--add-sub-issue` and `--remove-sub-issue`.
- Detach a child with `gh issue edit <number> --remove-parent`.

### Reading a child also reads its parent

Whenever an issue has a parent, read the immediate parent too. Use `.parent.number` from the canonical read. Read only the immediate parent unless it points at further context the task needs.

## Blockers (dependencies)

Model dependencies with GitHub's native `--blocked-by` and `--blocking` flags, never prose in the body. These are inverse views of one edge, so verify the direction before editing; reversing the flag silently records the dependency backwards.

- Add or remove a blocker with `--add-blocked-by` / `--remove-blocked-by`.
- Add or remove something this issue blocks with `--add-blocking` / `--remove-blocking`.

### Reading an issue also reads its blockers

Whenever an issue is blocked, read each blocker automatically using `.blockedBy.nodes[].number` from the canonical read.

## Pull requests that resolve an issue

A PR that fully resolves an issue includes `Closes #XXX` on its own line. Use one line per resolved issue. Use `Refs #XXX` when the PR relates to an issue without resolving it.

## Stacked PRs (`gh stack`)

Use `gh stack` when one logical change forms a natural chain too large for one reviewable PR. Its commands manage a PR chain, not issue hierarchy or issue dependencies. Use separate PRs for unrelated work and native issue dependencies for ordering.

## When a skill says "publish to the issue tracker"

Create a GitHub issue. If it belongs under a parent, pass `--parent`.

### Ticket breakdowns (`to-tickets`)

Publish an approved breakdown as GitHub issues, never a local ticket file. Use one common parent unless the user explicitly requests standalone issues. Create each child with `--parent`, apply the ready-for-agent label, publish in dependency order, and record blocking edges with native dependency flags rather than body sections.

## When a skill says "fetch the relevant ticket"

Use the canonical read command, then apply the automatic parent and blocker reads using the relationship identifiers from that response.
