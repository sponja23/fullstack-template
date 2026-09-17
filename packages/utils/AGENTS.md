# @repo/utils

A last-resort home for tiny, dependency-free, general-purpose helpers with no better owner.

This package is the leaf of the dependency graph: it has zero dependencies and every export is a pure, environment-agnostic function. The moment a helper needs a dependency, reaches for a runtime API, or encodes a domain concept, it belongs elsewhere.

## Adding to this package requires explicit user sign-off

This is a reluctant home, and the discipline is the point: consult the user explicitly before extending it with an export, dependency, changed signature, or widened contract. Do not add to it as a by-the-way step of another task.

Before proposing an addition, exhaust the alternatives:

- One consumer → co-locate it there.
- A few related consumers → use a named domain package.
- Genuinely general, needed by unrelated consumers, and with no natural owner → propose it here only after the user agrees.

## Contents

- `errMessage(unknown): string` earns its place because it recurs across unrelated packages: it returns an `Error`'s message or the value's string representation. It does not log; logging a caught value goes directly to `@repo/logger`.
