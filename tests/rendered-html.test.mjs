import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("describes the finished summer letter site", async () => {
  const [page, layout, experience, githubIndex] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/GiftExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../github-site/index.html", import.meta.url), "utf8"),
  ]);

  assert.match(page, /给你的夏日来信/);
  assert.match(layout, /收藏你的夏日照片宇宙/);
  assert.match(githubIndex, /鼠标星光/);
  assert.match(experience, /PhotoCompanion/);
  assert.match(experience, /小小真人版的你/);
  assert.match(experience, /这次一定看得全/);
  assert.doesNotMatch(experience, /ChibiViewer|chibi-girl\.glb/);
});

test("keeps curated gift photos available for the page", async () => {
  const files = await readdir(new URL("../public/photos/gift/", import.meta.url));
  const required = [
    "hero-flower.jpg",
    "aquarium-blue.jpg",
    "gallery-close.jpg",
    "mirror-yellow.jpg",
    "lake-profile.jpg",
    "study-candid.jpg",
    "together-view.jpg",
    "chibi-companion.png",
  ];

  for (const file of required) {
    assert.ok(files.includes(file), `${file} should exist`);
  }
});
