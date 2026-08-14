#!/usr/bin/env bash
# Install the email-generator systemd --user preview unit on THIS machine.
#
# 1. Symlinks the .service unit into ~/.config/systemd/user.
# 2. daemon-reload + enable lingering so it survives logout.
#
# Idempotent -- safe to re-run after pulling unit changes.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}"
USER_UNIT_DIR="$CONFIG_DIR/systemd/user"
UNIT="email-generator-preview.service"

mkdir -p "$USER_UNIT_DIR"
ln -sf "$SCRIPT_DIR/$UNIT" "$USER_UNIT_DIR/$UNIT"
echo "linked $UNIT"

systemctl --user daemon-reload

# Keep the user service running after logout (once per machine).
loginctl enable-linger "$USER" || true

cat <<'USAGE'

Installed. Start it (enable --now persists across boots):

  systemctl --user enable --now email-generator-preview

  # Status / logs:
  systemctl --user status email-generator-preview
  journalctl --user -u email-generator-preview -f
USAGE
