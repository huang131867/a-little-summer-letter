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
PHOTO_DIR = ROOT / "public" / "photos" / "gift"
VIDEO_DIR = ROOT / "public" / "video"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 720, 1280
FPS = 24
DURATION = 20.0

FONT_REGULAR = r"C:\Windows\Fonts\msyh.ttc"
FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
font_title = ImageFont.truetype(FONT_BOLD, 58)
font_big = ImageFont.truetype(FONT_BOLD, 44)
font_body = ImageFont.truetype(FONT_REGULAR, 28)
font_small = ImageFont.truetype(FONT_REGULAR, 20)

MOMENTS = [
    ("hero-flower.jpg", "你在花里"),
    ("gallery-close.jpg", "你在发光"),
    ("aquarium-blue.jpg", "你在蓝色里"),
    ("mirror-yellow.jpg", "你很可爱"),
    ("study-candid.jpg", "你很认真"),
    ("lake-profile.jpg", "你很安静"),
    ("dream-purple.jpg", "你像梦里"),
    ("polaroid-peace.jpg", "你比耶"),
    ("together-aquarium.jpg", "我们在这里"),
    ("together-view.jpg", "还想一起去很多地方"),
]


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
    x = int(max_x * (0.5 + pan[0] * 0.38))
    y = int(max_y * (0.5 + pan[1] * 0.38))
    x = max(0, min(max_x, x))
    y = max(0, min(max_y, y))
    return resized.crop((x, y, x + target_w, y + target_h))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def contain_card(image: Image.Image, max_size=(620, 850)) -> Image.Image:
    factor = min(max_size[0] / image.width, max_size[1] / image.height)
    resized = image.resize((int(image.width * factor), int(image.height * factor)), Image.Resampling.LANCZOS)
    card = Image.new("RGBA", (resized.width + 28, resized.height + 28), (255, 250, 246, 255))
    card.putalpha(rounded_mask(card.size, 36))
    photo_mask = rounded_mask(resized.size, 28)
    card.paste(resized.convert("RGBA"), (14, 14), photo_mask)
    return card


def draw_centered(draw: ImageDraw.ImageDraw, text: str, y: int, font: ImageFont.FreeTypeFont, fill, spacing=8):
    for line in text.split("\n"):
        box = draw.textbbox((0, 0), line, font=font)
        x = (WIDTH - (box[2] - box[0])) // 2
        draw.text((x, y), line, font=font, fill=fill)
        y += (box[3] - box[1]) + spacing


def draw_heart(draw: ImageDraw.ImageDraw, x: float, y: float, size: float, fill):
    s = size
    draw.ellipse((x - s * 0.52, y - s * 0.36, x, y + s * 0.17), fill=fill)
    draw.ellipse((x, y - s * 0.36, x + s * 0.52, y + s * 0.17), fill=fill)
    draw.polygon([(x - s * 0.52, y - s * 0.04), (x + s * 0.52, y - s * 0.04), (x, y + s * 0.72)], fill=fill)


def prepare_images() -> list[Image.Image]:
    images: list[Image.Image] = []
    for name, _ in MOMENTS:
        path = PHOTO_DIR / name
        image = Image.open(path).convert("RGB")
        image = ImageEnhance.Color(image).enhance(1.04)
        image = ImageEnhance.Contrast(image).enhance(1.02)
        images.append(image)
    return images


IMAGES = prepare_images()
random.seed(2026)
PARTICLES = [
    (random.uniform(0, WIDTH), random.uniform(0, HEIGHT), random.uniform(8, 22), random.uniform(0.22, 0.62))
    for _ in range(34)
]


def scene_frame(index: int, local: float) -> Image.Image:
    image = IMAGES[index]
    _, caption = MOMENTS[index]
    direction = -1 if index % 2 else 1
    pan = (direction * (local - 0.5) * 0.42, (0.5 - local) * 0.20)
    background = cover(image, (WIDTH, HEIGHT), zoom=1.16 + 0.05 * ease(local), pan=pan)
    background = ImageEnhance.Color(background).enhance(0.78)
    background = background.filter(ImageFilter.GaussianBlur(28))
    frame = background.convert("RGBA")

    tint_color = (255, 214, 222, 72) if index % 3 != 2 else (172, 218, 239, 82)
    frame = Image.alpha_composite(frame, Image.new("RGBA", (WIDTH, HEIGHT), tint_color))

    particle_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    pd = ImageDraw.Draw(particle_layer, "RGBA")
    for px, py, radius, speed in PARTICLES:
        y = (py - local * speed * 360 + index * 61) % (HEIGHT + 90) - 45
        fill = (255, 250, 246, 54) if index % 3 != 2 else (210, 244, 255, 58)
        pd.ellipse((px - radius, y - radius, px + radius, y + radius), fill=fill)
    frame = Image.alpha_composite(frame, particle_layer)

    card = contain_card(image)
    angle = math.sin((local + index * 0.17) * math.pi * 2) * 1.4
    card = card.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    shadow.putalpha(card.getchannel("A").filter(ImageFilter.GaussianBlur(18)))
    shadow_color = Image.new("RGBA", card.size, (70, 35, 45, 82))
    shadow = Image.composite(shadow_color, Image.new("RGBA", card.size), shadow.getchannel("A"))

    x_card = (WIDTH - card.width) // 2 + int(math.sin(local * math.pi * 2) * 10)
    y_card = int(128 - math.sin(local * math.pi) * 20)
    frame.alpha_composite(shadow, (x_card + 10, y_card + 24))
    frame.alpha_composite(card, (x_card, y_card))

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    draw.rounded_rectangle((56, 1045, 664, 1198), radius=38, fill=(255, 250, 246, 228), outline=(255, 255, 255, 180), width=2)
    draw_centered(draw, caption, 1080, font_big if len(caption) < 9 else font_body, (92, 45, 58, 255))
    draw_centered(draw, f"{index + 1:02d} / {len(MOMENTS):02d}", 1154, font_small, (178, 100, 123, 255))
    draw_heart(draw, 93, 1000, 21, (236, 126, 154, 205))
    draw_heart(draw, 626, 1018, 16, (255, 229, 185, 205))
    return Image.alpha_composite(frame, overlay)


def make_frame(t: float) -> Image.Image:
    intro = 1.4
    outro = 1.6
    clip_length = (DURATION - intro - outro) / len(IMAGES)
    clips_end = intro + clip_length * len(IMAGES)

    if t < intro:
        frame = scene_frame(0, 0.1)
        wash = Image.new("RGBA", (WIDTH, HEIGHT), (255, 235, 238, int(160 - 80 * ease(t / intro))))
        frame = Image.alpha_composite(frame, wash)
        text = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(text, "RGBA")
        fade = int(255 * ease(t / intro))
        draw_centered(draw, "你在的\n夏日宇宙", 466, font_title, (94, 45, 60, fade), spacing=18)
        draw_centered(draw, "A LITTLE SUMMER LETTER", 662, font_small, (174, 103, 125, fade))
        draw_heart(draw, 360, 760, 42, (234, 128, 155, fade))
        return Image.alpha_composite(frame, text)

    if t < clips_end:
        offset = t - intro
        index = min(len(IMAGES) - 1, int(offset // clip_length))
        local = (offset - index * clip_length) / clip_length
        current = scene_frame(index, local)
        cross = 0.18
        if local > 1 - cross and index < len(IMAGES) - 1:
            mix = ease((local - (1 - cross)) / cross)
            upcoming = scene_frame(index + 1, 0.02)
            current = Image.blend(current, upcoming, mix)
        return current

    frame = scene_frame(len(IMAGES) - 1, 0.82)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (255, 239, 242, 170))
    frame = Image.alpha_composite(frame, overlay)
    text = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(text, "RGBA")
    fade = int(255 * ease((t - clips_end) / outro))
    draw_centered(draw, "你值得被偏心", 500, font_title, (92, 45, 58, fade))
    draw_centered(draw, "也值得被好好喜欢", 610, font_body, (164, 92, 115, fade))
    draw_heart(draw, 360, 748, 54, (232, 116, 147, fade))
    return Image.alpha_composite(frame, text)


def build_audio(path: Path):
    rate = 44100
    t = np.linspace(0, DURATION, int(rate * DURATION), endpoint=False)
    signal = np.zeros_like(t)
    chords = [
        (261.63, 329.63, 392.00),
        (293.66, 369.99, 440.00),
        (220.00, 277.18, 329.63),
        (246.94, 311.13, 392.00),
    ]
    bar_length = 2.0
    for bar, chord in enumerate(chords * 3):
        start = bar * bar_length
        if start >= DURATION:
            break
        end = min(DURATION, start + bar_length + 0.8)
        mask = (t >= start) & (t < end)
        local = t[mask] - start
        env = np.minimum(1.0, local / 0.42) * np.exp(-local / 4.2)
        for frequency in chord:
            signal[mask] += 0.029 * np.sin(2 * np.pi * frequency * local) * env
        signal[mask] += 0.016 * np.sin(2 * np.pi * chord[1] * 2 * local) * np.exp(-local * 1.35)
    signal += 0.006 * np.sin(2 * np.pi * 130.81 * t)
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
    make_frame(4.2).convert("RGB").save(poster, quality=92, optimize=True)

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
        assert process.stdin is not None
        for frame_index in range(int(DURATION * FPS)):
            frame = make_frame(frame_index / FPS).convert("RGB")
            process.stdin.write(frame.tobytes())
        process.stdin.close()
        assert process.stderr is not None
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
