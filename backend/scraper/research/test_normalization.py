import unittest

from scraper_core.normalization import (
    normalizar_ean_gtin,
    normalizar_precio_clp,
    normalizar_texto,
)


class ScraperNormalizationTest(unittest.TestCase):
    def test_normalizes_clp_price_formats(self):
        cases = (
            ("$1.290", 1290.0),
            ("1290", 1290.0),
            ("1290.00", 1290.0),
            ("$1.290,50", 1290.5),
            ("1,290.50", 1290.5),
            (1290, 1290.0),
            (1290.0, 1290.0),
        )

        for value, expected in cases:
            with self.subTest(value=value):
                self.assertEqual(normalizar_precio_clp(value), expected)

    def test_rejects_invalid_prices(self):
        for value in (None, True, "", "$abc", -1, float("inf")):
            with self.subTest(value=value):
                self.assertIsNone(normalizar_precio_clp(value))

    def test_normalizes_ean_without_losing_leading_zeroes(self):
        self.assertEqual(
            normalizar_ean_gtin(" 00-7800000000001 "),
            "007800000000001",
        )
        self.assertEqual(normalizar_ean_gtin(7800000000001), "7800000000001")
        self.assertIsNone(normalizar_ean_gtin("EAN-unknown"))

    def test_normalizes_whitespace_in_text(self):
        self.assertEqual(normalizar_texto("  Leche\n entera   1 L "), "Leche entera 1 L")
        self.assertIsNone(normalizar_texto(" \n "))


if __name__ == "__main__":
    unittest.main()