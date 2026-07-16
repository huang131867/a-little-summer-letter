# 给你的夏日来信

一个送给女朋友的互动照片网页：照片、Q版小小她、鼠标星光、回忆章节、温柔收集罐和最后一封信。

## 内容亮点

- 第一屏使用花墙照片做沉浸式主视觉。
- 原来的 3D 建模区已换成代码绘制的 Q 版互动小人。
- 鼠标移动会生成星光和小心心，点击页面会有轻微反馈。
- 精选照片被整理成花墙、水族馆、美术馆、学习、镜子、一起出游等章节。
- `docs/` 是 GitHub Pages 发布目录。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
pnpm install
pnpm run dev
pnpm run build:pages
```

## 常用命令

- `pnpm run dev`: 本地预览站点。
- `pnpm run build`: 构建 Sites / Vinext 版本。
- `pnpm run build:pages`: 构建 GitHub Pages 静态版本到 `docs/`。
- `pnpm run lint`: 检查源码。

## 素材说明

网页使用的精选照片位于 `public/photos/gift/`，都是从原始照片中裁出的网页版本。原始照片不在项目内修改。
