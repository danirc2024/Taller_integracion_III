"""
Utilidades chicas y transversales que no encajan en ningun otro modulo
(fixes de infraestructura, no logica de negocio porsiaca)
"""

import sys

from fastapi.responses import JSONResponse


def fix_encoding_consola() -> None:

    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass  # streams sin reconfigure() (poco comun); se ignora


class RespuestaUTF8(JSONResponse):

    media_type = "application/json; charset=utf-8"
