#!/bin/bash

set -e

if [ -z "$T3CODE_PROJECT_ROOT" ]; then
    echo "Error: T3CODE_PROJECT_ROOT is not set"
    exit 1
fi

ROOT_PATH="$T3CODE_PROJECT_ROOT"

# Unset for local threads, where T3 runs the script in the project root itself.
WORKSPACE_PATH="${T3CODE_WORKTREE_PATH:-$PWD}"

if [ "$(cd "$ROOT_PATH" && pwd -P)" = "$(cd "$WORKSPACE_PATH" && pwd -P)" ]; then
    echo "Running in the project root, nothing to symlink"
else
    echo "Symlinking .env files from $ROOT_PATH to $WORKSPACE_PATH"

    cd "$ROOT_PATH"
    find . -name ".env" -type f | while read -r file; do
        mkdir -p "$WORKSPACE_PATH/$(dirname "$file")"
        ln -sf "$ROOT_PATH/$file" "$WORKSPACE_PATH/$file"
        echo "Symlinked: $file"
    done

    if [ -d "$ROOT_PATH/.vscode" ]; then
        rm -rf "$WORKSPACE_PATH/.vscode"
        ln -s "$ROOT_PATH/.vscode" "$WORKSPACE_PATH/.vscode"
        echo "Symlinked: .vscode directory"
    fi
fi

cd "$WORKSPACE_PATH"

LOCAL_SETUP="$WORKSPACE_PATH/.t3/local-setup.sh"
if [ -f "$LOCAL_SETUP" ]; then
    echo "Running local setup script..."
    bash "$LOCAL_SETUP"
    echo "Local setup script complete."
fi

echo "Running pnpm install..."
pnpm install

echo "Setup complete!"
