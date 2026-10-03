import re
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP


_MAX_PRICE = Decimal("9999999999.99")
_MONEY_CLEANUP = re.compile(r"(?i)\s|\$|CLP")
_PRICE_CHARACTERS = re.compile(r"-?[0-9.,]+")


def normalizar_precio_clp(value):
    """Convierte importes CLP en texto o número a un float con dos decimales."""
    if value is None or isinstance(value, bool):
        return None

    if isinstance(value, (int, float, Decimal)):
        try:
            amount = Decimal(str(value))
        except InvalidOperation:
            return None
    elif isinstance(value, str):
        text = _MONEY_CLEANUP.sub("", value).strip()
        if not text or not _PRICE_CHARACTERS.fullmatch(text):
            return None

        last_dot = text.rfind(".")
        last_comma = text.rfind(",")
        if last_dot >= 0 and last_comma >= 0:
            decimal_separator = "." if last_dot > last_comma else ","
            grouping_separator = "," if decimal_separator == "." else "."
            integer, fraction = text.rsplit(decimal_separator, 1)
            text = integer.replace(grouping_separator, "") + "." + fraction
        elif last_dot >= 0 or last_comma >= 0:
            separator = "." if last_dot >= 0 else ","
            parts = text.split(separator)
            if len(parts) > 2:
                if _uses_thousands_groups(parts):
                    text = "".join(parts)
                else:
                    text = "".join(parts[:-1]) + "." + parts[-1]
            elif len(parts[1]) == 3 and 1 <= len(parts[0].lstrip("-")) <= 3:
                text = "".join(parts)
            elif separator == ",":
                text = text.replace(",", ".", 1)

        try:
            amount = Decimal(text)
        except InvalidOperation:
            return None
    else:
        return None

    if not amount.is_finite() or amount < 0 or amount > _MAX_PRICE:
        return None
    return float(amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _uses_thousands_groups(parts):
    return (
        len(parts[0].lstrip("-")) in range(1, 4)
        and all(len(group) == 3 for group in parts[1:])
    )


def normalizar_ean_gtin(value):
    """Normaliza el EAN/GTIN como texto y conserva sus ceros iniciales."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, int):
        text = str(value)
    elif isinstance(value, float) and value.is_integer():
        text = str(int(value))
    elif isinstance(value, str):
        text = value.strip()
    else:
        return None

    if not text:
        return None
    digits = []
    for character in text:
        if character.isdigit():
            digits.append(character)
        elif character.isspace() or character == "-":
            continue
        else:
            return None
    return "".join(digits) or None


def normalizar_texto(value):
    if value is None:
        return None
    text = " ".join(str(value).split())
    return text or None