"""Run with uv run --python 3.13 --with Pillow==13.0.0 python -m unittest discover -s scripts."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BACKGROUND = (244, 239, 226, 255)
PNG_SIZES = {
    "favicon/favicon-16x16.png": 16,
    "favicon/favicon-32x32.png": 32,
    "favicon/apple-touch-icon.png": 180,
    "favicon/android-chrome-192x192.png": 192,
    "favicon/android-chrome-512x512.png": 512,
    "favicon/mstile-150x150.png": 150,
    "favicon.png": 32,
}


class FaviconPackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workspace = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls.workspace.cleanup)
        cls.output = Path(cls.workspace.name)
        subprocess.run(
            [sys.executable, str(ROOT / "scripts/generate_favicons.py"), "--output-dir", str(cls.output)],
            check=True,
            capture_output=True,
            text=True,
        )

    def test_png_sizes_and_opaque_cream_background(self):
        for filename, size in PNG_SIZES.items():
            with self.subTest(filename=filename), Image.open(self.output / filename) as image:
                self.assertEqual(image.size, (size, size))
                rgba = image.convert("RGBA")
                self.assertEqual(rgba.getchannel("A").getextrema(), (255, 255))
                for corner in ((0, 0), (size - 1, 0), (0, size - 1), (size - 1, size - 1)):
                    self.assertEqual(rgba.getpixel(corner), BACKGROUND)
                self.assertGreater(len(rgba.getcolors(maxcolors=size * size)), 1)

    def test_ico_contains_all_three_sizes_with_cream_background(self):
        with Image.open(self.output / "favicon/favicon.ico") as icon:
            self.assertEqual(icon.ico.sizes(), {(16, 16), (32, 32), (48, 48)})
            for size in icon.ico.sizes():
                frame = icon.ico.getimage(size).convert("RGBA")
                self.assertEqual(frame.getpixel((0, 0)), BACKGROUND)
                self.assertEqual(frame.getchannel("A").getextrema(), (255, 255))
        self.assertEqual(
            (self.output / "favicon.ico").read_bytes(),
            (self.output / "favicon/favicon.ico").read_bytes(),
        )

    def test_generation_preserves_unrelated_files(self):
        sentinel = self.output / "keep.txt"
        sentinel.write_text("preserve me")
        subprocess.run(
            [sys.executable, str(ROOT / "scripts/generate_favicons.py"), "--output-dir", str(self.output)],
            check=True,
            capture_output=True,
        )
        self.assertEqual(sentinel.read_text(), "preserve me")

    def test_svg_uses_the_original_swoop_t_and_cream_background(self):
        svg = ET.parse(ROOT / "static/favicon/favicon.svg").getroot()
        namespace = {"svg": "http://www.w3.org/2000/svg"}
        self.assertEqual(svg[0].tag, "{http://www.w3.org/2000/svg}title")
        background = svg.find("svg:rect", namespace)
        self.assertEqual(background.attrib["fill"], "#F4EFE2")
        self.assertEqual((background.attrib["width"], background.attrib["height"]), ("96", "96"))
        paths = svg.findall(".//svg:path", namespace)
        self.assertEqual([element.attrib["d"] for element in paths], [
            "M -33,-17 C -28,-33 -13,-35 0,-26 C 14,-17 25,-16 32,-29",
            "M 0,-26 C -5,-8 -9,8 -2,24 C 2,34 16,35 21,25",
        ])
        self.assertTrue(all(element.attrib["stroke"] == "#F16F66" for element in paths))

    def test_manifest_icons_resolve_beside_the_manifest(self):
        manifest = json.loads((ROOT / "static/favicon/site.webmanifest").read_text())
        self.assertEqual(manifest["background_color"], "#F4EFE2")
        self.assertEqual(manifest["theme_color"], "#F4EFE2")
        for icon in manifest["icons"]:
            self.assertFalse(icon["src"].startswith("/"))
            path = self.output / "favicon" / icon["src"]
            with Image.open(path) as image:
                self.assertEqual(icon["sizes"], f"{image.width}x{image.height}")

    def test_html_declares_svg_ico_and_theme_color(self):
        html = (ROOT / "src/app.html").read_text()
        self.assertIn('type="image/svg+xml" sizes="any" href="%sveltekit.assets%/favicon/favicon.svg"', html)
        self.assertIn('type="image/x-icon" href="%sveltekit.assets%/favicon/favicon.ico"', html)
        self.assertIn('<meta name="theme-color" content="#F4EFE2">', html)
        self.assertIn('safari-pinned-tab.svg" color="#F16F66"', html)

    def test_pinned_tab_mask_keeps_the_swoop_shape(self):
        namespace = {"svg": "http://www.w3.org/2000/svg"}
        mask = ET.parse(ROOT / "static/favicon/safari-pinned-tab.svg").getroot()
        original = ET.parse(ROOT / "static/favicon/favicon.svg").getroot()
        self.assertIsNone(mask.find("svg:rect", namespace))
        self.assertEqual(mask.find("svg:g", namespace).attrib["stroke"], "#000000")
        self.assertEqual(
            [element.attrib["d"] for element in mask.findall(".//svg:path", namespace)],
            [element.attrib["d"] for element in original.findall(".//svg:path", namespace)],
        )

    def test_windows_tile_uses_the_cream_background_and_correct_path(self):
        config = ET.parse(ROOT / "static/favicon/browserconfig.xml").getroot()
        self.assertEqual(config.find(".//TileColor").text, "#F4EFE2")
        self.assertEqual(config.find(".//square150x150logo").attrib["src"], "/favicon/mstile-150x150.png")


if __name__ == "__main__":
    unittest.main()
