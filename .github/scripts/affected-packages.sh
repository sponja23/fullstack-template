#!/usr/bin/env bash

# Emit one `<package-basename>=true` output for every workspace package changed
# since the supplied commit or transitively dependent on a changed package.
set -euo pipefail

# shellcheck source=.github/scripts/affected-core.sh
source "$(dirname "${BASH_SOURCE[0]}")/affected-core.sh"

base="${1:?usage: affected-packages.sh <base-ref>}"
sink="${GITHUB_OUTPUT:-/dev/stdout}"

git cat-file -e "${base}^{commit}" 2>/dev/null ||
  git fetch --depth=1 origin "${base}" 2>/dev/null ||
  echo "::notice::could not fetch base ${base}; relying on local history" >&2

root="$(git rev-parse --show-toplevel)"

if affected_root_dep_changed "${base}"; then
  echo "::notice::root dependency graph changed; every package is affected" >&2
  paths="$(affected_all_paths)"
else
  paths="$(affected_closure_paths "${base}")"
fi

affected=""
while IFS= read -r directory; do
  [ -z "${directory}" ] && continue
  [ "${directory}" = "${root}" ] && continue
  relative="${directory#"${root}"/}"
  affected="${affected:+${affected} }${relative}"
  slug="$(basename "${relative}")"
  echo "${slug//-/_}=true" >>"${sink}"
done <<EOF
${paths}
EOF

echo "::notice::affected packages: ${affected:-<none>}" >&2
