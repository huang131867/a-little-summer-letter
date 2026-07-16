/* eslint-disable @next/next/no-img-element */
"use client";

import type { CSSProperties, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type VarStyle = CSSProperties & Record<`--${string}`, string>;

function assetPath(path: string) {
  const base =
    (globalThis as typeof globalThis & { __ASSET_BASE__?: string }).__ASSET_BASE__ ?? "/";
  return `${base}${path.replace(/^\/+/, "")}`;
}

const featuredPhotos = [
  {
    src: "/photos/gift/hero-flower.jpg",
    title: "花墙前的你",
    note: "颜色很热闹，你更亮。",
    tone: "FLOWER",
  },
  {
    src: "/photos/gift/aquarium-blue.jpg",
    title: "海蓝色的你",
    note: "鱼群在游，镜头只想停在你这里。",
    tone: "BLUE",
  },
  {
    src: "/photos/gift/gallery-close.jpg",
    title: "展厅里的你",
    note: "那么多画里，我还是先看你。",
    tone: "GALLERY",
  },
  {
    src: "/photos/gift/lake-profile.jpg",
    title: "湖边的你",
    note: "风慢下来，连水面都温柔一点。",
    tone: "LAKE",
  },
];

const memoryChapters = [
  {
    key: "study",
    label: "认真",
    title: "你认真起来，世界会安静一点",
    text: "低头写字、翻书、想事情的瞬间，都很值得被留下。",
    image: "/photos/gift/study-candid.jpg",
  },
  {
    key: "cute",
    label: "可爱",
    title: "你可爱起来，完全不讲道理",
    text: "自拍、皱脸、偷笑、小表情，每一张都很犯规。",
    image: "/photos/gift/mirror-yellow.jpg",
  },
  {
    key: "blue",
    label: "海蓝",
    title: "你站在蓝色里，像一小束光",
    text: "水族馆很大，但这个下午被你变得很近。",
    image: "/photos/gift/together-aquarium.jpg",
  },
  {
    key: "art",
    label: "艺术",
    title: "你在展厅里，也像被收藏的一帧",
    text: "灯箱、镜面、画框都很好看，但你是中心。",
    image: "/photos/gift/gallery-polished.jpg",
  },
  {
    key: "us",
    label: "我们",
    title: "一起走过的地方，也会发光",
    text: "风景会换，天气会换，和你在一起的那一段不会。",
    image: "/photos/gift/together-view.jpg",
  },
];

const galleryPhotos = [
  "/photos/gift/soft-selfie.jpg",
  "/photos/gift/dream-purple.jpg",
  "/photos/gift/polaroid-peace.jpg",
  "/photos/gift/polaroid-sitting.jpg",
  "/photos/gift/mirror-dress.jpg",
  "/photos/gift/study-soft.jpg",
  "/photos/gift/cap-mirror.jpg",
  "/photos/gift/gallery-polished.jpg",
];

const companionLines = [
  "你的小小分身：正在认真营业。",
  "你的小小分身：靠近鼠标会偷偷发光。",
  "你的小小分身：今天也很可爱。",
  "你的小小分身：把好心情递给你。",
];

const heartNotes = [
  "你不用一直发光，你站在那里就很好。",
  "你认真时好看，可爱时更犯规。",
  "希望今天的风也偏心你一点。",
  "想把好天气和好运都分给你。",
  "你值得很多很多温柔。",
];

type Pointer = {
  x: number;
  y: number;
  ready: boolean;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  glyph: string;
  rotate: number;
};

function CursorMagic({
  pointer,
  sparkles,
}: {
  pointer: Pointer;
  sparkles: Sparkle[];
}) {
  return (
    <>
      <div
        className={pointer.ready ? "cursor-aura visible" : "cursor-aura"}
        style={
          {
            "--cursor-x": `${pointer.x}px`,
            "--cursor-y": `${pointer.y}px`,
          } as VarStyle
        }
      />
      <div
        className={pointer.ready ? "cursor-heart visible" : "cursor-heart"}
        style={
          {
            "--cursor-x": `${pointer.x}px`,
            "--cursor-y": `${pointer.y}px`,
          } as VarStyle
        }
      >
        ♥
      </div>
      <div className="sparkle-layer" aria-hidden="true">
        {sparkles.map((sparkle) => (
          <span
            className="sparkle"
            key={sparkle.id}
            style={
              {
                left: `${sparkle.x}px`,
                top: `${sparkle.y}px`,
                "--dx": `${sparkle.dx}px`,
                "--dy": `${sparkle.dy}px`,
                "--rotate": `${sparkle.rotate}deg`,
              } as VarStyle
            }
          >
            {sparkle.glyph}
          </span>
        ))}
      </div>
    </>
  );
}

function PhotoCompanion({
  pointer,
  onMagic,
}: {
  pointer: Pointer;
  onMagic: (x: number, y: number, count?: number) => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const width = typeof window === "undefined" ? 1 : window.innerWidth || 1;
  const height = typeof window === "undefined" ? 1 : window.innerHeight || 1;
  const moveX = pointer.ready ? (pointer.x / width - 0.5) * 20 : 0;
  const moveY = pointer.ready ? (pointer.y / height - 0.5) * 14 : 0;
  const rotate = pointer.ready ? (pointer.x / width - 0.5) * 8 : 0;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setLineIndex((lineIndex + 1) % companionLines.length);
    onMagic(event.clientX, event.clientY, 22);
  };

  return (
    <section className="companion-section" id="companion" aria-labelledby="companion-title">
      <div className="companion-copy reveal">
        <p className="section-kicker">MINI YOU</p>
        <h2 id="companion-title">这里是小小真人版的你。</h2>
        <p>头像来自真实照片，身体做成 Q 版贴纸。它会跟着鼠标靠近，点一下会冒心。</p>
        <div className="companion-note">{companionLines[lineIndex]}</div>
      </div>

      <button
        className="photo-companion-stage reveal magnetic-card"
        type="button"
        onClick={handleClick}
        aria-label="点亮小小真人版的你"
        style={
          {
            "--move-x": `${moveX}px`,
            "--move-y": `${moveY}px`,
            "--rotate": `${rotate}deg`,
          } as VarStyle
        }
      >
        <span className="stage-orbit orbit-one" />
        <span className="stage-orbit orbit-two" />
        <span className="stage-floating-heart heart-one">♥</span>
        <span className="stage-floating-heart heart-two">♡</span>
        <img
          className="photo-companion"
          src={assetPath("/photos/gift/chibi-companion.png")}
          alt="小小真人版的你"
          draggable={false}
        />
      </button>
    </section>
  );
}

function HeartReactor({
  pointer,
  onMagic,
}: {
  pointer: Pointer;
  onMagic: (x: number, y: number, count?: number) => void;
}) {
  const [charge, setCharge] = useState(0);
  const note = heartNotes[charge % heartNotes.length];
  const width = typeof window === "undefined" ? 1 : window.innerWidth || 1;
  const height = typeof window === "undefined" ? 1 : window.innerHeight || 1;
  const pullX = pointer.ready ? (pointer.x / width - 0.5) * 26 : 0;
  const pullY = pointer.ready ? (pointer.y / height - 0.5) * 18 : 0;

  return (
    <section className="heart-section reveal" aria-labelledby="heart-title">
      <div className="heart-copy">
        <p className="section-kicker">MOUSE REACTION</p>
        <h2 id="heart-title">靠近这里，页面会偏向你。</h2>
        <p>{note}</p>
      </div>
      <button
        type="button"
        className="heart-reactor magnetic-card"
        aria-label="点亮心动反应"
        onClick={(event) => {
          setCharge(charge + 1);
          onMagic(event.clientX, event.clientY, 26);
        }}
        style={
          {
            "--pull-x": `${pullX}px`,
            "--pull-y": `${pullY}px`,
            "--charge": `${Math.min(charge, 8)}`,
          } as VarStyle
        }
      >
        <span className="heart-ring ring-a" />
        <span className="heart-ring ring-b" />
        <span className="heart-ring ring-c" />
        <span className="heart-core">♥</span>
        <span className="heart-count">{String(charge + 1).padStart(2, "0")}</span>
      </button>
    </section>
  );
}

export function GiftExperience() {
  const [pointer, setPointer] = useState<Pointer>({ x: 0, y: 0, ready: false });
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [activeChapter, setActiveChapter] = useState(memoryChapters[0]);
  const [letterOpen, setLetterOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const sparkleId = useRef(0);
  const lastTrail = useRef(0);

  const addSparkles = useCallback((x: number, y: number, count = 1) => {
    const glyphs = ["♥", "♡", "✦", "✧", "花"];
    const next = Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.8;
      const distance = 20 + Math.random() * 74;
      return {
        id: sparkleId.current++,
        x,
        y,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 22,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        rotate: -45 + Math.random() * 90,
      };
    });
    setSparkles((current) => [...current.slice(-90), ...next]);
    window.setTimeout(() => {
      const ids = new Set(next.map((sparkle) => sparkle.id));
      setSparkles((current) => current.filter((sparkle) => !ids.has(sparkle.id)));
    }, 1100);
  }, []);

  const handleMagnetMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = x / rect.width - 0.5;
    const ry = y / rect.height - 0.5;
    target.style.setProperty("--glow-x", `${x}px`);
    target.style.setProperty("--glow-y", `${y}px`);
    target.style.setProperty("--tilt-x", `${-ry * 7}deg`);
    target.style.setProperty("--tilt-y", `${rx * 9}deg`);
  }, []);

  const handleMagnetLeave = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    target.style.setProperty("--tilt-x", "0deg");
    target.style.setProperty("--tilt-y", "0deg");
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      setPointer({ x: event.clientX, y: event.clientY, ready: true });
      const now = performance.now();
      if (now - lastTrail.current > 56) {
        lastTrail.current = now;
        addSparkles(event.clientX, event.clientY, 1);
      }
    };
    const onPointerDown = (event: PointerEvent) => addSparkles(event.clientX, event.clientY, 12);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [addSparkles]);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("revealed");
        });
      },
      { threshold: 0.16 },
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  const floatingPetals = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        "--left": `${3 + ((index * 13) % 94)}%`,
        "--delay": `${(index * 0.41) % 7}s`,
        "--duration": `${7.6 + (index % 6) * 1.2}s`,
        "--size": `${8 + (index % 5) * 3}px`,
      }) as VarStyle),
    [],
  );

  return (
    <main>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <CursorMagic pointer={pointer} sparkles={sparkles} />
      <div className="petal-field" aria-hidden="true">
        {floatingPetals.map((style, index) => (
          <span key={index} style={style} />
        ))}
      </div>

      <header className="hero" id="top">
        <img className="hero-photo" src={assetPath("/photos/gift/hero-flower.jpg")} alt="花墙前的你" />
        <div className="hero-vignette" />
        <nav className="topbar" aria-label="页面导航">
          <a className="brand" href="#top">SUMMER LETTER</a>
          <a className="nav-pill" href="#companion">小小你</a>
          <a className="nav-pill" href="#memories">照片</a>
          <a className="nav-pill" href="#film">视频</a>
          <a className="nav-pill" href="#letter">信</a>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">给你，一个会回应鼠标的夏天</p>
          <h1>
            你在的
            <span>夏日宇宙</span>
          </h1>
          <p>照片、星光、蓝色水族馆、花墙，还有小小真人版的你。</p>
          <div className="hero-actions">
            <a className="primary-button" href="#memories">看照片</a>
            <a className="ghost-button" href="#letter">读那封信</a>
          </div>
        </div>
      </header>

      <section className="intro-section reveal" aria-labelledby="intro-title">
        <p className="section-kicker">LESS TALK, MORE YOU</p>
        <h2 id="intro-title">这次少说废话，多放你。</h2>
        <p>每一屏都围着你转：照片会动，鼠标会发光，小小你会跟着靠近。</p>
      </section>

      <PhotoCompanion pointer={pointer} onMagic={addSparkles} />

      <section className="feature-section" id="memories" aria-labelledby="feature-title">
        <div className="section-heading reveal">
          <p className="section-kicker">PHOTO MOMENTS</p>
          <h2 id="feature-title">四个瞬间，刚好都是你。</h2>
        </div>
        <div className="feature-grid">
          {featuredPhotos.map((photo, index) => (
            <article
              className={`feature-card reveal magnetic-card feature-${index + 1}`}
              key={photo.src}
              onPointerMove={handleMagnetMove}
              onPointerLeave={handleMagnetLeave}
            >
              <img src={assetPath(photo.src)} alt={photo.title} loading={index > 1 ? "lazy" : "eager"} />
              <div>
                <span>{photo.tone}</span>
                <h3>{photo.title}</h3>
                <p>{photo.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chapter-section" aria-labelledby="chapter-title">
        <div className="chapter-copy reveal">
          <p className="section-kicker">FIVE SIDES OF YOU</p>
          <h2 id="chapter-title">你有很多种好看。</h2>
          <div className="chapter-tabs" role="tablist" aria-label="照片分类">
            {memoryChapters.map((chapter) => (
              <button
                key={chapter.key}
                type="button"
                className={chapter.key === activeChapter.key ? "active" : ""}
                onClick={(event) => {
                  setActiveChapter(chapter);
                  addSparkles(event.clientX, event.clientY, 8);
                }}
              >
                {chapter.label}
              </button>
            ))}
          </div>
        </div>
        <article
          className="chapter-display reveal magnetic-card"
          onPointerMove={handleMagnetMove}
          onPointerLeave={handleMagnetLeave}
        >
          <img src={assetPath(activeChapter.image)} alt={activeChapter.title} />
          <div className="chapter-text">
            <span>{activeChapter.label}</span>
            <h3>{activeChapter.title}</h3>
            <p>{activeChapter.text}</p>
          </div>
        </article>
      </section>

      <section className="gallery-section" aria-labelledby="gallery-title">
        <div className="section-heading reveal">
          <p className="section-kicker">PHOTO RIVER</p>
          <h2 id="gallery-title">继续往右滑，都是你。</h2>
        </div>
        <div className="photo-river" aria-label="精选照片">
          {galleryPhotos.map((photo, index) => (
            <figure
              className="river-card reveal magnetic-card"
              key={photo}
              onPointerMove={handleMagnetMove}
              onPointerLeave={handleMagnetLeave}
            >
              <img src={assetPath(photo)} alt={`精选照片 ${index + 1}`} loading="lazy" />
              <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <HeartReactor pointer={pointer} onMagic={addSparkles} />

      <section className="film-section" id="film" aria-labelledby="film-title">
        <div className="film-copy reveal">
          <p className="section-kicker">NEW CUT</p>
          <h2 id="film-title">视频重新剪了：只保留照片和一点点心跳。</h2>
          <p>少字、快一点、顺一点，像把这些瞬间串成一小段夏天。</p>
          <a className="ghost-button light" href={assetPath("/video/summer-letter.mp4")} download>
            保存视频
          </a>
        </div>
        <div className="phone-frame reveal magnetic-card" onPointerMove={handleMagnetMove} onPointerLeave={handleMagnetLeave}>
          <div className="phone-speaker" />
          <video controls playsInline preload="metadata" poster={assetPath("/video/poster.jpg")}>
            <source src={assetPath("/video/summer-letter.mp4")} type="video/mp4" />
            你的浏览器暂不支持视频播放。
          </video>
        </div>
      </section>

      <section className="letter-section reveal" id="letter" aria-labelledby="letter-title">
        <p className="section-kicker">A REAL LETTER</p>
        <h2 id="letter-title">最后这封信，这次一定看得全。</h2>
        <button
          type="button"
          className="letter-toggle"
          onClick={(event) => {
            setLetterOpen(!letterOpen);
            addSparkles(event.clientX, event.clientY, 18);
          }}
          aria-expanded={letterOpen}
          aria-controls="letter-paper"
        >
          {letterOpen ? "收起一点" : "打开信"}
        </button>
        <article id="letter-paper" className={letterOpen ? "letter-paper-panel open" : "letter-paper-panel"}>
          <p>给你：</p>
          <p>
            我想把这个网页做得更像你一点，不是堆很多漂亮词，而是让每一张照片都被认真看见。
            你认真、可爱、偶尔发呆，也会在镜头前突然变得很亮。
          </p>
          <p>
            如果今天有一点累，希望你打开这里的时候，能感觉自己被轻轻接住。
            你不需要一直表现得很好，因为你本来就很好。
          </p>
          <p>
            以后还想和你一起去很多地方，把新的照片、新的视频、新的小瞬间，都慢慢放进来。
          </p>
          <strong>你值得被偏心，也值得被好好喜欢。</strong>
        </article>
      </section>

      <footer>
        <p>给你。只给你。</p>
        <a href="#top">回到开头</a>
      </footer>
    </main>
  );
}
