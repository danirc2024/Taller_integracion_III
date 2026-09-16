#!/bin/bash
# ──────────────────────────────────────────────────────────────────
# Configura los git hooks del proyecto.
# Ejecutar UNA VEZ después de clonar el repositorio.
#
# Uso:
#   bash scripts/setup-hooks.sh
# ──────────────────────────────────────────────────────────────────

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "$REPO_ROOT" ]; then
    echo "❌ Error: No estás dentro de un repositorio Git."
    exit 1
fi

# Hacer ejecutable el hook
chmod +x "$REPO_ROOT/scripts/git-hooks/pre-commit"

# Configurar directorio de hooks
git config core.hooksPath scripts/git-hooks

echo "✅ Git hooks configurados correctamente."
echo "   Los mapas de contexto IA (GEMINI.md, CLAUDE.md, copilot-instructions.md)"
echo "   se actualizarán automáticamente con cada commit."
