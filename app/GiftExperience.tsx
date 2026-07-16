/* eslint-disable @next/next/no-img-element */
"use client";

import type { CSSProperties, MouseEvent } from "react";
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
    title: "花墙前的小太阳",
    note: "她站在一片热闹的颜色里，还是最先被看见的那一束光。",
    tone: "FLOWER LIGHT",
  },
  {
    src: "/photos/gift/aquarium-blue.jpg",
    title: "蓝色海底隧道",
    note: "水光在旁边游，她安静站着，像把夏天降了噪。",
    tone: "AQUARIUM BLUE",
  },
  {
    src: "/photos/gift/gallery-close.jpg",
    title: "美术馆里的一秒",
    note: "身后有很多画，但镜头最偏心。",
    tone: "SOFT GALLERY",
  },
  {
    src: "/photos/gift/lake-profile.jpg",
    title: "湖边侧脸",
    note: "风、湖水和树影，都在悄悄变得温柔。",
    tone: "LAKE BREEZE",
  },
];

const memoryChapters = [
  {
    key: "study",
    label: "认真",
    title: "她认真起来的时候，世界会安静一点",
    text: "那些笔记、课本和低头的一瞬间，不是普通日常，是她努力生活的证据。",
    image: "/photos/gift/study-candid.jpg",
  },
  {
    key: "mirror",
    label: "可爱",
    title: "镜子偷偷保存了很多可爱的她",
    text: "有时候是黄色上衣，有时候是小小自拍。每一次都像在说：今天也值得被喜欢。",
    image: "/photos/gift/mirror-yellow.jpg",
  },
  {
    key: "blue",
    label: "海蓝",
    title: "水族馆给她打了一层蓝色柔光",
    text: "鱼群、玻璃、海水和她，都被放进同一个发光的下午。",
    image: "/photos/gift/together-aquarium.jpg",
  },
  {
    key: "gallery",
    label: "艺术",
    title: "她在展厅里，也像一张被认真收藏的画",
    text: "灯箱和镜面把世界照得很满，但她的眼神让画面有了中心。",
    image: "/photos/gift/gallery-polished.jpg",
  },
  {
    key: "together",
    label: "我们",
    title: "还有一些地方，是两个人一起记住的",
    text: "风景会变，天气会变，可是并肩的那一小段时间会留下来。",
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

const moodLines = [
  "今天的小小她：正在偷偷把好运塞进你的口袋。",
  "今天的小小她：比了一个很轻的心，假装不是故意的。",
  "今天的小小她：把夏天折成一封信，放在你手心。",
  "今天的小小她：认真营业，负责让普通日子变可爱。",
];

const jarNotes = [
  "你不用一直闪闪发光，站在那里就已经很好。",
  "我喜欢你认真，也喜欢你可爱得不讲道理。",
  "想把好天气、晚风和小小的好运都分给你。",
  "以后每个夏天，都要有值得期待的事。",
  "如果今天有一点累，就先被温柔接住。",
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

function ChibiCompanion({
  pointer,
  onMagic,
}: {
  pointer: Pointer;
  onMagic: (x: number, y: number, count?: number) => void;
}) {
  const [moodIndex, setMoodIndex] = useState(0);
  const width = typeof window === "undefined" ? 1 : window.innerWidth || 1;
  const height = typeof window === "undefined" ? 1 : window.innerHeight || 1;
  const lookX = pointer.ready ? (pointer.x / width - 0.5) * 9 : 0;
  const lookY = pointer.ready ? (pointer.y / height - 0.5) * 5 : 0;
  const mood = moodLines[moodIndex];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const next = (moodIndex + 1) % moodLines.length;
    setMoodIndex(next);
    onMagic(event.clientX, event.clientY, 14);
  };

  return (
    <section className="companion-section" id="companion" aria-labelledby="companion-title">
      <div className="companion-copy reveal">
        <p className="section-kicker">A TINY VERSION OF HER</p>
        <h2 id="companion-title">把不好看的建模，换成一只小小的她。</h2>
        <p>
          她会跟着鼠标轻轻转头，也会在被点到的时候冒出一串小心心。不是硬邦邦的模型，
          是一只藏着夏天、信封和蓝色外套的 Q 版分身。
        </p>
        <div className="companion-note">{mood}</div>
      </div>

      <button
        className="chibi-stage reveal"
        type="button"
        onClick={handleClick}
        aria-label="让 Q 版小小她发光"
      >
        <span className="stage-sun" />
        <span className="stage-letter">♡</span>
        <span className="stage-star star-a">✦</span>
        <span className="stage-star star-b">✧</span>
        <span
          className="chibi"
          style={
            {
              "--look-x": `${lookX}px`,
              "--look-y": `${lookY}px`,
            } as VarStyle
          }
        >
          <span className="chibi-shadow" />
          <span className="chibi-hair back" />
          <span className="chibi-head">
            <span className="chibi-bangs bang-a" />
            <span className="chibi-bangs bang-b" />
            <span className="chibi-bangs bang-c" />
            <span className="chibi-eye eye-left" />
            <span className="chibi-eye eye-right" />
            <span className="chibi-blush blush-left" />
            <span className="chibi-blush blush-right" />
            <span className="chibi-mouth" />
          </span>
          <span className="chibi-hair side-left" />
          <span className="chibi-hair side-right" />
          <span className="chibi-body">
            <span className="chibi-shirt" />
            <span className="chibi-jacket left" />
            <span className="chibi-jacket right" />
            <span className="chibi-necklace" />
          </span>
          <span className="chibi-arm arm-left" />
          <span className="chibi-arm arm-right">
            <span className="finger one" />
            <span className="finger two" />
          </span>
          <span className="chibi-leg leg-left" />
          <span className="chibi-leg leg-right" />
        </span>
      </button>
    </section>
  );
}

export function GiftExperience() {
  const [pointer, setPointer] = useState<Pointer>({ x: 0, y: 0, ready: false });
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [activeChapter, setActiveChapter] = useState(memoryChapters[0]);
  const [jarIndex, setJarIndex] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const sparkleId = useRef(0);
  const lastTrail = useRef(0);

  const addSparkles = useCallback((x: number, y: number, count = 1) => {
    const glyphs = ["♡", "✦", "✧"];
    const next = Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.6;
      const distance = 18 + Math.random() * 54;
      return {
        id: sparkleId.current++,
        x,
        y,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 18,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        rotate: -30 + Math.random() * 60,
      };
    });
    setSparkles((current) => [...current.slice(-70), ...next]);
    window.setTimeout(() => {
      const ids = new Set(next.map((sparkle) => sparkle.id));
      setSparkles((current) => current.filter((sparkle) => !ids.has(sparkle.id)));
    }, 1100);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      setPointer({ x: event.clientX, y: event.clientY, ready: true });
      const now = performance.now();
      if (now - lastTrail.current > 95) {
        lastTrail.current = now;
        addSparkles(event.clientX, event.clientY, 1);
      }
    };
    const onPointerDown = (event: PointerEvent) => addSparkles(event.clientX, event.clientY, 9);
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
      Array.from({ length: 18 }, (_, index) => ({
        "--left": `${4 + ((index * 17) % 92)}%`,
        "--delay": `${(index * 0.47) % 7}s`,
        "--duration": `${8 + (index % 5) * 1.35}s`,
        "--size": `${9 + (index % 4) * 4}px`,
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
        <img
          className="hero-photo"
          src={assetPath("/photos/gift/hero-flower.jpg")}
          alt="花墙前比耶的女孩"
        />
        <div className="hero-vignette" />
        <nav className="topbar" aria-label="礼物页面导航">
          <a className="brand" href="#top">A LITTLE SUMMER LETTER</a>
          <a className="nav-pill" href="#companion">小小她</a>
          <a className="nav-pill" href="#memories">照片宇宙</a>
          <a className="nav-pill" href="#letter">最后一封信</a>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">FOR THE GIRL WHO MAKES ORDINARY DAYS GLOW</p>
          <h1>
            给你的
            <span>夏日来信</span>
          </h1>
          <p>
            我把认真、可爱、蓝色水光、花墙和那些一起走过的地方，重新装进这个小小网页。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#memories">打开回忆</a>
            <a className="ghost-button" href="#companion">看看小小她</a>
          </div>
        </div>
        <div className="hero-stamp" aria-hidden="true">
          <span>2026</span>
          <small>SUMMER<br />ARCHIVE</small>
        </div>
      </header>

      <section className="intro-section reveal" aria-labelledby="intro-title">
        <p className="section-kicker">A PLACE THAT KEEPS ONLY HER</p>
        <h2 id="intro-title">这一次，照片不再只是排开，而是变成一座会回应她的宇宙。</h2>
        <p>
          我把杂乱背景压低，把主体留出来；让光、花瓣、星星和鼠标一起动起来。
          页面越往下，越像一封慢慢展开的信。
        </p>
      </section>

      <ChibiCompanion pointer={pointer} onMagic={addSparkles} />

      <section className="feature-section" id="memories" aria-labelledby="feature-title">
        <div className="section-heading reveal">
          <p className="section-kicker">FOUR WAYS TO REMEMBER HER</p>
          <h2 id="feature-title">她不是一种样子，她有很多种发光方式。</h2>
        </div>
        <div className="feature-grid">
          {featuredPhotos.map((photo, index) => (
            <article className={`feature-card reveal feature-${index + 1}`} key={photo.src}>
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
          <p className="section-kicker">MEMORY CONSTELLATION</p>
          <h2 id="chapter-title">把她的不同瞬间，点成一张小星图。</h2>
          <div className="chapter-tabs" role="tablist" aria-label="回忆分类">
            {memoryChapters.map((chapter) => (
              <button
                key={chapter.key}
                type="button"
                className={chapter.key === activeChapter.key ? "active" : ""}
                onClick={(event) => {
                  setActiveChapter(chapter);
                  addSparkles(event.clientX, event.clientY, 6);
                }}
              >
                {chapter.label}
              </button>
            ))}
          </div>
        </div>
        <article className="chapter-display reveal">
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
          <p className="section-kicker">A SMALL PHOTO RIVER</p>
          <h2 id="gallery-title">一些被认真留下来的她。</h2>
        </div>
        <div className="photo-river" aria-label="精选照片">
          {galleryPhotos.map((photo, index) => (
            <figure className="river-card reveal" key={photo}>
              <img src={assetPath(photo)} alt={`精选照片 ${index + 1}`} loading="lazy" />
              <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="jar-section reveal" aria-labelledby="jar-title">
        <div className="jar-copy">
          <p className="section-kicker">A LITTLE JAR OF TENDERNESS</p>
          <h2 id="jar-title">每按一次，就多收下一句悄悄话。</h2>
          <p>{jarNotes[jarIndex]}</p>
          <button
            type="button"
            onClick={(event) => {
              setJarIndex((jarIndex + 1) % jarNotes.length);
              addSparkles(event.clientX, event.clientY, 12);
            }}
          >
            再放进一颗喜欢
          </button>
        </div>
        <div className="glass-jar" aria-hidden="true">
          {jarNotes.map((_, index) => (
            <span key={index} className={index <= jarIndex ? "lit" : ""} />
          ))}
        </div>
      </section>

      <section className="film-section" aria-labelledby="film-title">
        <div className="film-copy reveal">
          <p className="section-kicker">A TINY CINEMA</p>
          <h2 id="film-title">原来的短片也留下，但它现在只是这座宇宙的一颗星。</h2>
          <p>把耳机戴上，慢慢看。照片会停住，心跳不会。</p>
          <a className="ghost-button light" href={assetPath("/video/summer-letter.mp4")} download>
            保存这支小短片
          </a>
        </div>
        <div className="phone-frame reveal">
          <div className="phone-speaker" />
          <video controls playsInline preload="metadata" poster={assetPath("/video/poster.jpg")}>
            <source src={assetPath("/video/summer-letter.mp4")} type="video/mp4" />
            你的浏览器暂不支持视频播放。
          </video>
        </div>
      </section>

      <section className="letter-section reveal" id="letter" aria-labelledby="letter-title">
        <p className="section-kicker">THE LAST LITTLE SURPRISE</p>
        <h2 id="letter-title">最后，还有一封会打开的信。</h2>
        <button
          type="button"
          className={letterOpen ? "envelope open" : "envelope"}
          onClick={(event) => {
            setLetterOpen(!letterOpen);
            addSparkles(event.clientX, event.clientY, 16);
          }}
          aria-expanded={letterOpen}
          aria-controls="letter-paper"
        >
          <span className="envelope-back" />
          <span className="envelope-paper" id="letter-paper">
            <b>给最特别的你：</b>
            <em>
              如果世界偶尔很吵，希望你还记得，有人认真收藏过你每一个可爱的瞬间。
              你不需要一直闪闪发光，因为你只是站在那里，就已经让普通的一天有了意义。
              愿你被温柔接住，也愿以后每一个夏天，都有值得期待的事。
            </em>
            <strong>被好好爱着，今天也是。</strong>
          </span>
          <span className="envelope-front">打开这封信 <i>♡</i></span>
        </button>
      </section>

      <footer>
        <p>MADE WITH PHOTOS, SUMMER LIGHT, AND A VERY BIASED HEART</p>
        <a href="#top">回到开头</a>
      </footer>
    </main>
  );
}
