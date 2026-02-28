#!/bin/sh
# Configure the repository to use the tracked `.githooks` folder for git hooks
git config core.hooksPath .githooks
echo "Configured core.hooksPath to .githooks"
