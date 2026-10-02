// Renders the FitPartner app icons from inline SVG. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const rings = (scale = 1) => {
  const r = 120 * scale, w = 44 * scale, dx = 70 * scale;
  return `
    <circle cx="${256 - dx}" cy="256" r="${r}" fill="none" stroke="#c6f432" stroke-width="${w}"/>
    <circle cx="${256 + dx}" cy="256" r="${r}" fill="none" stroke="#ff8a65" stroke-width="${w}"/>
    <path d="M ${256 - dx} ${256 - r} A ${r} ${r} 0 0 1 ${256 - dx + r} 256" fill="none" stroke="#c6f432" stroke-width="${w}"/>`;
};

const svg = ({ rounded, scale }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="#0b0d10"/>
  ${rings(scale)}
</svg>`;

mkdirSync("public/icons", { recursive: true });
const standard = Buffer.from(svg({ rounded: true, scale: 0.9 }));
const fullBleed = Buffer.from(svg({ rounded: false, scale: 0.9 }));
const maskable = Buffer.from(svg({ rounded: false, scale: 0.7 })); // inside the 80% safe zone

await sharp(standard).resize(192).png().toFile("public/icons/icon-192.png");
await sharp(standard).resize(512).png().toFile("public/icons/icon-512.png");
await sharp(maskable).resize(512).png().toFile("public/icons/icon-maskable-512.png");
await sharp(fullBleed).resize(180).png().toFile("public/icons/apple-touch-icon.png"); // iOS rounds corners itself
await sharp(standard).resize(64).png().toFile("src/app/icon.png");
console.log("icons written");
