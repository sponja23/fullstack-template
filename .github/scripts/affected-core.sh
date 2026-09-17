#!/usr/bin/env bash

# Shared dependency-graph operations for affected-package detection.

affected_root_dep_files=(pnpm-lock.yaml pnpm-workspace.yaml package.json)

affected_root_dep_changed() {
  ! git diff --quiet "$1" HEAD -- "${affected_root_dep_files[@]}"
}

affected_closure_paths() {
  pnpm --filter "...[$1]" --parseable list --depth -1
}

affected_all_paths() {
  pnpm -r --parseable list --depth -1
}
