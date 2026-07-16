import type { Metadata } from "next";
import { GiftExperience } from "./GiftExperience";

export const metadata: Metadata = {
  title: "给你的夏日来信",
  description: "一座会发光、会互动、只认真收藏她的夏日照片宇宙。",
};

export default function Home() {
  return <GiftExperience />;
}
