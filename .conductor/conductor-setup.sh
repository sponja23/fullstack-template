#!/bin/bash

set -e

if [ -z "$CONDUCTOR_ROOT_PATH" ]; then
    echo "Error: CONDUCTOR_ROOT_PATH is not set"
    exit 1
fi

if [ -z "$CONDUCTOR_WORKSPACE_PATH" ]; then
    echo "Error: CONDUCTOR_WORKSPACE_PATH is not set"
    exit 1
fi

echo "Symlinking .env files from $CONDUCTOR_ROOT_PATH to $CONDUCTOR_WORKSPACE_PATH"
cd "$CONDUCTOR_ROOT_PATH"
find . -name ".env" -type f | while read -r file; do
    dir=$(dirname "$file")
    mkdir -p "$CONDUCTOR_WORKSPACE_PATH/$dir"
    ln -sf "$CONDUCTOR_ROOT_PATH/$file" "$CONDUCTOR_WORKSPACE_PATH/$file"
    echo "Symlinked: $file"
done

if [ -d "$CONDUCTOR_ROOT_PATH/.vscode" ]; then
    rm -rf "$CONDUCTOR_WORKSPACE_PATH/.vscode"
    ln -s "$CONDUCTOR_ROOT_PATH/.vscode" "$CONDUCTOR_WORKSPACE_PATH/.vscode"
    echo "Symlinked: .vscode directory"
fi

LOCAL_SETUP="$CONDUCTOR_WORKSPACE_PATH/.conductor/local-setup.sh"
if [ -f "$LOCAL_SETUP" ]; then
    bash "$LOCAL_SETUP"
fi

cd "$CONDUCTOR_WORKSPACE_PATH"
pnpm install
