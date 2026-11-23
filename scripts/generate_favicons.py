# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow==13.0.0"]
# ///
"""Run: uv run --python 3.13 scripts/generate_favicons.py. Requires rsvg-convert."""

import argparse
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "static/favicon/favicon.svg"
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
ICO_SIZES = [(16, 16), (32, 32), (48, 48)]

parser = argparse.ArgumentParser(description="Render the Swoop T SVG into the favicon package.")
parser.add_argument("--output-dir", type=Path, default=ROOT / "static")
args = parser.parse_args()
renderer = shutil.which("rsvg-convert")
if renderer is None:
    raise RuntimeError("Install rsvg-convert before generating favicons: brew install librsvg")

output = args.output_dir.resolve()
output.mkdir(parents=True, exist_ok=True)

with tempfile.TemporaryDirectory(prefix=".favicon-", dir=output) as workspace:
    staging = Path(workspace)
    for filename, size in PNG_SIZES.items():
        destination = staging / filename
        destination.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [renderer, "--width", str(size), "--height", str(size), str(SOURCE), "--output", str(destination)],
            check=True,
        )

    with Image.open(staging / "favicon/android-chrome-512x512.png") as image:
        image.save(staging / "favicon/favicon.ico", format="ICO", sizes=ICO_SIZES)
    shutil.copyfile(staging / "favicon/favicon.ico", staging / "favicon.ico")

    # Validate every generated image before replacing existing assets.
    for filename, size in PNG_SIZES.items():
        with Image.open(staging / filename) as image:
            rgba = image.convert("RGBA")
            if image.size != (size, size) or rgba.getchannel("A").getextrema() != (255, 255):
                raise ValueError(f"Incorrect dimensions or transparent pixels: {filename}")
            corners = ((0, 0), (size - 1, 0), (0, size - 1), (size - 1, size - 1))
            if any(rgba.getpixel(corner) != BACKGROUND for corner in corners):
                raise ValueError(f"Incorrect background color: {filename}")

    with Image.open(staging / "favicon/favicon.ico") as icon:
        if icon.ico.sizes() != set(ICO_SIZES):
            raise ValueError("The ICO must contain 16, 32, and 48 pixel frames")
        for size in ICO_SIZES:
            frame = icon.ico.getimage(size).convert("RGBA")
            if frame.getpixel((0, 0)) != BACKGROUND or frame.getchannel("A").getextrema() != (255, 255):
                raise ValueError(f"Incorrect ICO background: {size}")

    filenames = [*PNG_SIZES, "favicon/favicon.ico", "favicon.ico"]
    for filename in filenames:
        destination = output / filename
        destination.parent.mkdir(parents=True, exist_ok=True)
        (staging / filename).replace(destination)

print(f"Generated {len(filenames)} PNG/ICO assets in {output} from {SOURCE.name}.")
