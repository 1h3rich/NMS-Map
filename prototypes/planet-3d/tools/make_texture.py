"""Generates assets/planet.png: a 1024x512 equirectangular planet texture.

Noise is sampled on the unit sphere, so the texture wraps without a seam.
Run: python3 tools/make_texture.py  (needs numpy and Pillow)
"""
import numpy as np
from PIL import Image

W, H = 1024, 512
rng = np.random.default_rng(42)
GRID = 64
lattice = rng.random((GRID, GRID, GRID))


def value_noise(p):
    i = np.floor(p).astype(int)
    f = p - i
    f = f * f * (3 - 2 * f)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                v = lattice[(i[..., 0] + dx) % GRID, (i[..., 1] + dy) % GRID, (i[..., 2] + dz) % GRID]
                w = (f[..., 0] if dx else 1 - f[..., 0]) * (f[..., 1] if dy else 1 - f[..., 1]) * (f[..., 2] if dz else 1 - f[..., 2])
                out = out + v * w
    return out


lon = (np.arange(W) / W) * 2 * np.pi - np.pi
lat = np.pi / 2 - (np.arange(H) / H) * np.pi
lon, lat = np.meshgrid(lon, lat)
p = np.stack([np.cos(lat) * np.cos(lon), np.sin(lat), np.cos(lat) * np.sin(lon)], -1)

h = sum(value_noise(p * 2 ** o * 2 + 17) / 2 ** o for o in range(6)) / 1.97
stops = [(0.0, (20, 40, 110)), (0.47, (40, 90, 170)), (0.5, (220, 200, 140)),
         (0.56, (90, 160, 70)), (0.7, (40, 100, 50)), (0.82, (120, 100, 80)), (1.0, (245, 245, 250))]
xs = [s[0] for s in stops]
img = np.stack([np.interp(h, xs, [s[1][c] for s in stops]) for c in range(3)], -1)
ice = np.abs(lat) > np.radians(72) + (h - 0.5) * 0.4
img[ice] = (235, 240, 250)
Image.fromarray(img.astype(np.uint8)).save("assets/planet.png", optimize=True)
