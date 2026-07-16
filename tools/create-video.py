from __future__ import annotations

import math
import random
import subprocess
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PHOTO_DIR = ROOT / "public" / "photos"
VIDEO_DIR = ROOT / "public" / "video"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 720, 1280
FPS = 24
DURATION = 14.0

FONT_REGULAR = r"C:\Windows\Fonts\msyh.ttc"
FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
font_hero = ImageFont.truetype(FONT_BOLD, 62)
font_title = ImageFont.truetype(FONT_BOLD, 42)
font_body = ImageFont.truetype(FONT_REGULAR, 28)
font_small = ImageFont.truetype(FONT_REGULAR, 19)


def ease(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def cover(image: Image.Image, size: tuple[int, int], zoom: float = 1.0, pan=(0.0, 0.0)) -> Image.Image:
    target_w, target_h = size
    factor = max(target_w / image.width, target_h / image.height) * zoom
    resized = image.resize(
        (max(target_w, int(image.width * factor)), max(target_h, int(image.height * factor))),
        Image.Resampling.LANCZOS,
    )
    max_x = max(0, resized.width - target_w)
    max_y = max(0, resized.height - target_h)
    x = int(max_x * (0.5 + pan[0] * 0.36))
    y = int(max_y * (0.5 + pan[1] * 0.36))
    x = max(0, min(max_x, x))
    y = max(0, min(max_y, y))
    return resized.crop((x, y, x + target_w, y + target_h))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def contain_card(image: Image.Image, max_size=(616, 880)) -> Image.Image:
    factor = min(max_size[0] / image.width, max_size[1] / image.height)
    resized = image.resize((int(image.width * factor), int(image.height * factor)), Image.Resampling.LANCZOS)
    card = Image.new("RGBA", (resized.width + 24, resized.height + 24), (255, 248, 245, 255))
    card_mask = rounded_mask(card.size, 34)
    card.putalpha(card_mask)
    photo_mask = rounded_mask(resized.size, 25)
    card.paste(resized.convert("RGBA"), (12, 12), photo_mask)
    return card


def draw_centered(draw: ImageDraw.ImageDraw, text: str, y: int, font: ImageFont.FreeTypeFont, fill, spacing=8):
    lines = text.split("\n")
    for line in lines:
        box = draw.textbbox((0, 0), line, font=font)
        x = (WIDTH - (box[2] - box[0])) // 2
        draw.text((x, y), line, font=font, fill=fill)
        y += (box[3] - box[1]) + spacing


def heart(draw: ImageDraw.ImageDraw, x: float, y: float, size: float, fill, alpha=255):
    layer = getattr(draw, "_image", None)
    color = fill if len(fill) == 4 else (*fill, alpha)
    s = size
    draw.ellipse((x - s * 0.52, y - s * 0.36, x, y + s * 0.17), fill=color)
    draw.ellipse((x, y - s * 0.36, x + s * 0.52, y + s * 0.17), fill=color)
    draw.polygon([(x - s * 0.52, y - s * 0.04), (x + s * 0.52, y - s * 0.04), (x, y + s * 0.72)], fill=color)


def prepare_images():
    paths = [
        PHOTO_DIR / "playful.jpg",
        PHOTO_DIR / "pink-frame.jpg",
        PHOTO_DIR / "warm-restaurant.jpg",
        PHOTO_DIR / "mirror-gallery.jpg",
        PHOTO_DIR / "pink-smile.jpg",
    ]
    images = [Image.open(path).convert("RGB") for path in paths]
    # Remove the phone gallery chrome from the screenshot while keeping the portrait itself.
    images[0] = images[0].crop((0, 390, images[0].width, 1655))
    return images


IMAGES = prepare_images()
CAPTIONS = [
    "可爱，是你的日常",
    "你笑起来，世界会变软",
    "城市的灯，也没有你亮",
    "把每一个闪闪发光的瞬间收藏起来",
    "愿你每天都被温柔接住",
]

random.seed(19)
PARTICLES = [
    (random.uniform(0, WIDTH), random.uniform(0, HEIGHT), random.uniform(9, 24), random.uniform(0.12, 0.55))
    for _ in range(26)
]


def scene_frame(index: int, local: float) -> Image.Image:
    image = IMAGES[index]
    direction = -1 if index % 2 else 1
    pan = (direction * (local - 0.5) * 0.34, (0.5 - local) * 0.16)
    background = cover(image, (WIDTH, HEIGHT), zoom=1.08 + 0.035 * ease(local), pan=pan)
    background = ImageEnhance.Color(background).enhance(0.78)
    background = background.filter(ImageFilter.GaussianBlur(26))
    tint = Image.new("RGBA", (WIDTH, HEIGHT), (255, 203, 215, 78))
    frame = Image.alpha_composite(background.convert("RGBA"), tint)

    veil = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil, "RGBA")
    vd.rectangle((0, 0, WIDTH, HEIGHT), fill=(44, 20, 31, 26))
    for px, py, radius, speed in PARTICLES:
        y = (py - local * speed * 320 + index * 57) % (HEIGHT + 80) - 40
        vd.ellipse((px - radius, y - radius, px + radius, y + radius), fill=(255, 244, 240, 58))
    frame = Image.alpha_composite(frame, veil)

    card = contain_card(image)
    angle = math.sin((local + index) * math.pi * 2) * 1.1
    card = card.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    shadow.putalpha(card.getchannel("A").filter(ImageFilter.GaussianBlur(20)))
    shadow_color = Image.new("RGBA", card.size, (72, 32, 49, 80))
    shadow = Image.composite(shadow_color, Image.new("RGBA", card.size), shadow.getchannel("A"))
    y_card = int(126 + math.sin(local * math.pi) * -18)
    x_card = (WIDTH - card.width) // 2
    frame.alpha_composite(shadow, (x_card + 10, y_card + 24))
    frame.alpha_composite(card, (x_card, y_card))

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    draw.rounded_rectangle((54, 1040, 666, 1208), radius=40, fill=(255, 249, 245, 225), outline=(255, 255, 255, 175), width=2)
    draw_centered(draw, CAPTIONS[index], 1080, font_title if len(CAPTIONS[index]) < 15 else font_body, (91, 48, 61, 255))
    draw_centered(draw, f"0{index + 1}  ·  SUMMER MOMENT", 1161, font_small, (177, 112, 132, 255))
    heart(draw, 95, 101, 24, (236, 126, 154, 210))
    heart(draw, 624, 996, 19, (255, 235, 238, 190))
    return Image.alpha_composite(frame, overlay)


def make_frame(t: float) -> Image.Image:
    intro = 1.2
    clip_length = 2.2
    clips_end = intro + clip_length * len(IMAGES)

    if t < intro:
        frame = scene_frame(4, 0.12)
        wash = Image.new("RGBA", (WIDTH, HEIGHT), (255, 231, 233, int(120 + 80 * (1 - t / intro))))
        frame = Image.alpha_composite(frame, wash)
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay, "RGBA")
        fade = int(255 * ease(t / intro))
        draw_centered(draw, "给你的\n夏日来信", 458, font_hero, (94, 45, 60, fade), spacing=18)
        draw_centered(draw, "A LITTLE SUMMER LETTER", 650, font_small, (174, 103, 125, fade))
        heart(draw, 360, 750, 42, (234, 128, 155, fade))
        return Image.alpha_composite(frame, overlay)

    if t < clips_end:
        offset = t - intro
        index = min(len(IMAGES) - 1, int(offset // clip_length))
        local = (offset - index * clip_length) / clip_length
        current = scene_frame(index, local)
        cross = 0.12
        if local > 1 - cross and index < len(IMAGES) - 1:
            mix = ease((local - (1 - cross)) / cross)
            upcoming = scene_frame(index + 1, 0.02)
            current = Image.blend(current, upcoming, mix)
        return current

    frame = scene_frame(4, 0.78)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (255, 239, 240, 165))
    frame = Image.alpha_composite(frame, overlay)
    text_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer, "RGBA")
    fade = int(255 * ease((t - clips_end) / max(0.2, DURATION - clips_end)))
    draw_centered(draw, "Have a nice day", 475, font_hero, (92, 46, 60, fade))
    draw_centered(draw, "Be happy · 被好好爱着", 585, font_body, (164, 92, 115, fade))
    heart(draw, 360, 720, 50, (232, 116, 147, fade))
    return Image.alpha_composite(frame, text_layer)


def build_audio(path: Path):
    rate = 44100
    t = np.linspace(0, DURATION, int(rate * DURATION), endpoint=False)
    signal = np.zeros_like(t)
    chords = [(261.63, 329.63, 392.0), (220.0, 277.18, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66)]
    for bar, chord in enumerate(chords * 2):
        start = bar * 1.75
        if start >= DURATION:
            break
        end = min(DURATION, start + 2.2)
        mask = (t >= start) & (t < end)
        local = t[mask] - start
        env = np.minimum(1.0, local / 0.35) * np.exp(-local / 3.8)
        for frequency in chord:
            signal[mask] += 0.035 * np.sin(2 * np.pi * frequency * local) * env
        bell = chord[1] * 2
        signal[mask] += 0.024 * np.sin(2 * np.pi * bell * local) * np.exp(-local * 1.5)
    signal += 0.008 * np.sin(2 * np.pi * 130.81 * t)
    signal = np.clip(signal, -0.9, 0.9)
    pcm = (signal * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(pcm.tobytes())


def render():
    output = VIDEO_DIR / "summer-letter.mp4"
    audio = VIDEO_DIR / "summer-letter-audio.wav"
    poster = VIDEO_DIR / "poster.jpg"
    build_audio(audio)
    make_frame(6.7).convert("RGB").save(poster, quality=92, optimize=True)

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    command = [
        ffmpeg,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-r", str(FPS),
        "-i", "-",
        "-i", str(audio),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "160k",
        "-shortest",
        "-movflags", "+faststart",
        str(output),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        for frame_index in range(int(DURATION * FPS)):
            frame = make_frame(frame_index / FPS).convert("RGB")
            process.stdin.write(frame.tobytes())
        process.stdin.close()
        stderr = process.stderr.read().decode("utf-8", errors="replace")
        code = process.wait()
        if code:
            raise RuntimeError(stderr[-4000:])
    finally:
        if process.stdin and not process.stdin.closed:
            process.stdin.close()
    audio.unlink(missing_ok=True)
    print(f"Wrote {output} ({output.stat().st_size} bytes)")
    print(f"Wrote {poster} ({poster.stat().st_size} bytes)")


if __name__ == "__main__":
    render()
