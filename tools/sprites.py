"""Turns Google Flow character art into stage sprites.

Put each promoter's frames in assets/sprites/raw/<pitch id>/ named closed, mid, open and
(optionally) blink, as .png/.jpg/.webp, on a flat green background. Then:

  python3 tools/sprites.py                 # every promoter that has raw frames
  python3 tools/sprites.py slater --patch  # paste only the changed mouth/eyes onto the base frame

What it does, per promoter:
  1. keys out the green background (and removes green spill on the edges),
  2. lines every frame up with the closed-mouth frame, since AI edits tend to shift a few pixels,
  3. with --patch, keeps the base frame and copies over only the region that differs (the mouth or
     the eyes), so nothing else can flicker while the character talks,
  4. crops all frames to the same box, scales them to 1040 px tall, saves
     assets/sprites/<id>/<frame>.png and lists them in content/sprites.json.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RAW = os.path.join(ROOT, "assets", "sprites", "raw")
OUT = os.path.join(ROOT, "assets", "sprites")
INDEX = os.path.join(ROOT, "content", "sprites.json")
FRAMES = ["closed", "mid", "open", "blink"]
HEIGHT = 1040


def load(pid, name):
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        p = os.path.join(RAW, pid, name + ext)
        if os.path.exists(p):
            return np.asarray(Image.open(p).convert("RGB")).astype(np.float32)
    return None


def key_green(rgb):
    """RGBA with the green screen removed. Works on any fairly flat, saturated green."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    greenness = g - np.maximum(r, b)                     # how much greener than the other channels
    alpha = np.clip(1 - (greenness - 25) / 60, 0, 1)     # soft edge between 25 and 85
    # despill: pull leftover green down to the brighter of red/blue on semi-green edges
    g2 = np.where(greenness > 0, np.maximum(r, b) + np.clip(greenness, 0, 25) * 0.2, g)
    out = np.dstack([r, g2, b, alpha * 255])
    a = Image.fromarray(out[..., 3].astype(np.uint8)).filter(ImageFilter.MinFilter(3))  # trim the halo
    out[..., 3] = np.asarray(a)
    return out


def shift_to(base, img):
    """Integer (dy, dx) that best lines img up with base, by FFT cross-correlation of luminance."""
    A = base[..., :3].mean(-1) * (base[..., 3] / 255)
    B = img[..., :3].mean(-1) * (img[..., 3] / 255)
    A -= A.mean(); B -= B.mean()
    c = np.fft.ifft2(np.fft.fft2(A) * np.conj(np.fft.fft2(B))).real
    dy, dx = np.unravel_index(np.argmax(c), c.shape)
    h, w = c.shape
    return (dy - h if dy > h // 2 else dy), (dx - w if dx > w // 2 else dx)


def roll(img, dy, dx):
    out = np.roll(img, (dy, dx), axis=(0, 1))
    if dy > 0: out[:dy] = 0
    if dy < 0: out[dy:] = 0
    if dx > 0: out[:, :dx] = 0
    if dx < 0: out[:, dx:] = 0
    return out


def patch(base, frame):
    """Base frame with only the changed area (mouth or eyes) taken from `frame`, feathered."""
    diff = np.abs(frame[..., :3] - base[..., :3]).mean(-1) * (np.maximum(frame[..., 3], base[..., 3]) / 255)
    mask = diff > 40
    h, w = mask.shape
    # ignore the outer edges, where alignment noise lives
    mask[: h // 8] = mask[-h // 10:] = False
    mask[:, : w // 6] = mask[:, -w // 6:] = False
    if mask.sum() < 50:
        return base.copy()
    ys, xs = np.nonzero(mask)
    y0, y1 = np.percentile(ys, [1, 99]).astype(int)
    x0, x1 = np.percentile(xs, [1, 99]).astype(int)
    pad = int(0.03 * h)
    region = np.zeros((h, w), np.uint8)
    region[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad] = 255
    soft = np.asarray(Image.fromarray(region).filter(ImageFilter.GaussianBlur(pad / 2))).astype(np.float32)[..., None] / 255
    return base * (1 - soft) + frame * soft


def process(pid, use_patch):
    raw = {n: load(pid, n) for n in FRAMES}
    if raw["closed"] is None:
        print(f"{pid}: no closed frame in assets/sprites/raw/{pid}/, skipped")
        return None
    size = raw["closed"].shape[:2]
    frames = {}
    for n, img in raw.items():
        if img is None:
            continue
        if img.shape[:2] != size:
            img = np.asarray(Image.fromarray(img.astype(np.uint8)).resize(size[::-1], Image.LANCZOS)).astype(np.float32)
        frames[n] = key_green(img)
    base = frames["closed"]
    for n in list(frames):
        if n == "closed":
            continue
        dy, dx = shift_to(base, frames[n])
        frames[n] = roll(frames[n], dy, dx)
        if use_patch:
            frames[n] = patch(base, frames[n])
        print(f"{pid}/{n}: shifted {dy},{dx}{' and patched' if use_patch else ''}")
    alpha = np.max([f[..., 3] for f in frames.values()], axis=0) > 8
    ys, xs = np.nonzero(alpha)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    os.makedirs(os.path.join(OUT, pid), exist_ok=True)
    listed = {}
    for n, f in frames.items():
        im = Image.fromarray(np.clip(f[y0:y1, x0:x1], 0, 255).astype(np.uint8), "RGBA")
        im = im.resize((round(im.width * HEIGHT / im.height), HEIGHT), Image.LANCZOS)
        im.save(os.path.join(OUT, pid, n + ".png"), optimize=True)
        listed[n] = n + ".png"
    return listed


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    use_patch = "--patch" in sys.argv
    pids = args or (sorted(os.listdir(RAW)) if os.path.isdir(RAW) else [])
    index = json.load(open(INDEX)) if os.path.exists(INDEX) else {}
    for pid in pids:
        got = process(pid, use_patch)
        if got:
            index[pid] = got
    json.dump(index, open(INDEX, "w"), indent=1)
    print("content/sprites.json:", ", ".join(index) or "(empty)")


if __name__ == "__main__":
    main()
