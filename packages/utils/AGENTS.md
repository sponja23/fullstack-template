# @repo/utils

A last-resort home for tiny, dependency-free, general-purpose helpers with no better owner.

This package is the leaf of the dependency graph: it has zero dependencies and every export is a pure, environment-agnostic function. The moment a helper needs a dependency, reaches for a runtime API, or encodes a domain concept, it belongs elsewhere.

## Adding to this package requires explicit user sign-off

Consult the user before adding an export, dependency, changed signature, or widened contract. Exhaust co-location with one consumer and a named domain package for related consumers before proposing an addition here.

`errMessage(unknown): string` earns its place because it recurs across unrelated packages: it returns an `Error`'s message or the value's string representation. It does not log.
