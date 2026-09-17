# Domain Docs

How engineering skills consume this repository's domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repository root, or
- `CONTEXT-MAP.md` at the repository root when it exists; read each linked context relevant to the task.
- `docs/adr/`; read decisions touching the area you are about to work in.

If any of these files do not exist, proceed silently. Do not flag their absence or suggest creating them upfront; they are created lazily when terms or decisions are resolved.

## File structure

A single-context repository keeps `CONTEXT.md` and `docs/adr/` at the root. A multi-context repository declares `CONTEXT-MAP.md`, keeps system-wide decisions in root `docs/adr/`, and places each bounded context's glossary and decisions beneath that context.

## Use the glossary's vocabulary

When output names a domain concept in an issue, proposal, hypothesis, or test, use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If a needed concept is absent, either the language is not part of the project or there is a real gap to resolve before recording it.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
