/**
 * normalize_attack_sprites_v2.js
 * 
 * 使用測量出的精確邊界框，把攻擊動作標準化為
 * 460×365 每幀的透明 PNG 圖集（與 idle/run 相同格式）
 * 
 * 資料:
 * - idle frame0: w=350, h=364 (基準)
 * - punch: 5 幀, 各 ~180px, 角色 h~165-216px
 * - head:  3 幀, 各 577px, 角色 h~363-435px (大圖縮放)
 * - kick:  5 幀, 各 536px, 角色幾乎滿框 h~379-380px
 */

const { createCanvas, loadImage } = require('/Users/allenwang/.gemini/antigravity-ide/canvas_tool/node_modules/canvas');
const fs = require('fs');
const path = require('path');

const IMGS_DIR = path.resolve(__dirname, '../imgs');
const FRAME_W = 460;
const FRAME_H = 365;
// 角色腳底 Y 座標（在輸出 frame 中）
const PAWS_Y = 358;
// idle 角色站立高度基準（測量值）
const IDLE_CHAR_H = 364;
// 目標：保持與 idle 相同的視覺大小
const TARGET_CHAR_H = IDLE_CHAR_H; // 364px in 460x365 frame

function applyChromaKey(px, bg, tol) {
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i+1], b = px[i+2];
    const isGray = Math.abs(r-g) <= 20 && Math.abs(g-b) <= 20;
    const matchBg = Math.abs(r-bg[0]) <= tol && Math.abs(g-bg[1]) <= tol && Math.abs(b-bg[2]) <= tol;
    if (isGray && matchBg) px[i+3] = 0;
  }
}

// ─────────────────────────────────────────────────────
// attack_punch: 5 幀, 每幀寬 =903/5=180px, 高 235px
// 角色精確 bbox（測量值）:
//   F0: x=24..179,  y=10..225, w=156, h=216
//   F1: x=180..359, y=10..225, w=180, h=216
//   F2: x=360..539, y=54..225, w=180, h=172  (揍出時身體前傾縮短)
//   F3: x=540..711, y=56..225, w=172, h=170
//   F4: x=734..875, y=61..225, w=142, h=165  (收回，尾巴抬起）
// ─────────────────────────────────────────────────────
async function processPunch() {
  const img = await loadImage(path.join(IMGS_DIR, 'attack_punch.jpg'));
  const src = createCanvas(img.width, img.height);
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);
  const idata = sctx.getImageData(0, 0, img.width, img.height);
  applyChromaKey(idata.data, [119,119,119], 32);
  sctx.putImageData(idata, 0, 0);

  // 精確 bbox (測量值)
  const bboxes = [
    { minX:  24, minY: 10, w: 156, h: 216 },
    { minX: 180, minY: 10, w: 180, h: 216 },
    { minX: 360, minY: 54, w: 180, h: 172 },
    { minX: 540, minY: 56, w: 172, h: 170 },
    { minX: 734, minY: 61, w: 142, h: 165 },
  ];

  // 用 F0 的高度 (216px) 作為「站立幀」基準縮放比例
  // 讓站立幀的角色視覺高度 = TARGET_CHAR_H
  const REF_H = 216;  // F0 站立高度
  const scale = TARGET_CHAR_H / REF_H;  // 364/216 ≈ 1.685

  const outC = createCanvas(FRAME_W * 5, FRAME_H);
  const outCtx = outC.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';

  bboxes.forEach((b, f) => {
    const dw = Math.round(b.w * scale);
    const dh = Math.round(b.h * scale);
    const dx = f * FRAME_W + Math.round((FRAME_W - dw) / 2);
    // 腳底對齊：所有幀的腳底都固定在 PAWS_Y
    const dy = PAWS_Y - dh;
    outCtx.drawImage(src, b.minX, b.minY, b.w, b.h, dx, dy, dw, dh);
  });

  const buf = outC.toBuffer('image/png');
  fs.writeFileSync(path.join(IMGS_DIR, 'attack_punch.png'), buf);
  console.log(`✓ attack_punch.png saved (${FRAME_W*5}x${FRAME_H}, ${buf.length} bytes)`);
  return { nFrames: 5 };
}

// ─────────────────────────────────────────────────────
// attack_head: 3 幀, 每幀寬 577px, 高 448px
// bbox（測量值）:
//   F0: x=27..448,   y=4..438, w=422, h=435  (站立蓄力)
//   F1: x=619..999,  y=4..438, w=381, h=435  (頭頂前衝)
//   F2: x=1154..1670,y=76..438, w=517, h=363 (衝出)
// 角色本身比 idle 大得多，需縮小後置入 460x365 格子
// ─────────────────────────────────────────────────────
async function processHead() {
  const img = await loadImage(path.join(IMGS_DIR, 'attack_head.jpg'));
  const src = createCanvas(img.width, img.height);
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);
  const idata = sctx.getImageData(0, 0, img.width, img.height);
  applyChromaKey(idata.data, [116,116,116], 32);
  sctx.putImageData(idata, 0, 0);

  const bboxes = [
    { minX:  27, minY:   4, w: 422, h: 435 },
    { minX: 619, minY:   4, w: 381, h: 435 },
    { minX: 1154, minY: 76, w: 517, h: 363 },
  ];

  // F0 站立高度 = 435px (源圖中的角色高度)，縮放到 TARGET_CHAR_H
  const REF_H = 435;
  const scale = TARGET_CHAR_H / REF_H;  // 364/435 ≈ 0.837

  const outC = createCanvas(FRAME_W * 3, FRAME_H);
  const outCtx = outC.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';

  bboxes.forEach((b, f) => {
    const dw = Math.round(b.w * scale);
    const dh = Math.round(b.h * scale);
    const dx = f * FRAME_W + Math.round((FRAME_W - dw) / 2);
    const dy = PAWS_Y - dh;
    outCtx.drawImage(src, b.minX, b.minY, b.w, b.h, dx, dy, dw, dh);
  });

  const buf = outC.toBuffer('image/png');
  fs.writeFileSync(path.join(IMGS_DIR, 'attack_head.png'), buf);
  console.log(`✓ attack_head.png saved (${FRAME_W*3}x${FRAME_H}, ${buf.length} bytes)`);
  return { nFrames: 3 };
}

// ─────────────────────────────────────────────────────
// attack_kick: 5 幀, 每幀寬 536px, 高 384px
// bbox（測量值）:
//   F0-F4: 全幅 ~532×380，幾乎佔滿整幀
// 迴旋踢是完整動作，F0=起跳, F1..F3=空中旋轉, F4=落地
// 特殊處理：空中幀需要向上偏移（角色離地）
// ─────────────────────────────────────────────────────
async function processKick() {
  const img = await loadImage(path.join(IMGS_DIR, 'attack_kick.jpeg'));
  const src = createCanvas(img.width, img.height);
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);
  const idata = sctx.getImageData(0, 0, img.width, img.height);
  applyChromaKey(idata.data, [163,163,161], 36);
  sctx.putImageData(idata, 0, 0);

  // 每幀完整來源框（536×384）
  const FW_SRC = 536;

  // 空中旋轉時角色實際只有部分在畫面——但源圖本身就是 full-frame
  // 需要把整幀 scale 到適合，並根據語意上下偏移
  // kick 的角色視覺高度（整幀裡的角色身體）≈ 280px（估計旋轉後的有效尺寸）
  // F4 (著地) 的角色高約 380px 整幀高，縮放到 TARGET_CHAR_H

  // 我們直接把每個 source frame 縮放後置中，並對各幀微調 Y 偏移
  const REF_H = 380; // 來源幀高
  const scale = TARGET_CHAR_H / REF_H; // ≈ 0.958

  // 各幀的空中偏移量（正值 = 向上偏移，讓角色看起來在空中）
  const aerialOffsets = [
    -30,   // F0: 起踢跳起
    -80,   // F1: 旋轉上升
    -100,  // F2: 旋轉最高點
    -70,   // F3: 旋轉下降
    0,     // F4: 落地著地
  ];

  const outC = createCanvas(FRAME_W * 5, FRAME_H);
  const outCtx = outC.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';

  for (let f = 0; f < 5; f++) {
    const sx = f * FW_SRC;
    const dw = Math.round(FW_SRC * scale);
    const dh = Math.round(REF_H * scale);
    const dx = f * FRAME_W + Math.round((FRAME_W - dw) / 2);
    const dy = PAWS_Y - dh + aerialOffsets[f];
    outCtx.drawImage(src, sx, 0, FW_SRC, REF_H, dx, dy, dw, dh);
  }

  const buf = outC.toBuffer('image/png');
  fs.writeFileSync(path.join(IMGS_DIR, 'attack_kick.png'), buf);
  console.log(`✓ attack_kick.png saved (${FRAME_W*5}x${FRAME_H}, ${buf.length} bytes)`);
  return { nFrames: 5 };
}

async function main() {
  console.log('Normalizing attack sprites to 460x365 frames...\n');
  await processPunch();
  await processHead();
  await processKick();
  console.log('\n✅ Done!');
}

main().catch(console.error);
