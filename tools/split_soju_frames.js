const { createCanvas, loadImage } = require('/Users/allenwang/.gemini/antigravity-ide/canvas_tool/node_modules/canvas');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../imgs');
const sourcePath = path.join(root, 'soju.jpeg');
const outputRoot = path.join(root, 'soju');

const actions = {
  idle: [
    [0, 0, 256, 205], [256, 0, 256, 205], [512, 0, 256, 205], [768, 0, 256, 205],
  ],
  run: [
    [0, 205, 256, 205], [256, 205, 256, 205], [512, 205, 256, 205], [768, 205, 256, 205],
  ],
  // The third row is the headbutt sequence; the next row is the jump sequence.
  attack_head: [
    [20, 430, 246, 184], [317, 430, 223, 184], [594, 471, 296, 143],
  ],
  jump: [
    [20, 614, 255, 205], [270, 614, 250, 205], [600, 614, 230, 205],
  ],
  attack_punch: [
    [20, 614, 255, 205], [270, 614, 250, 205], [600, 614, 230, 205],
  ],
  attack_kick: [
    [10, 839, 230, 185], [285, 839, 190, 185], [530, 850, 160, 174],
  ],
  hurt: [[10, 839, 230, 185]],
};

function removeGrayBackground(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const isGray = Math.abs(r - g) <= 18 && Math.abs(g - b) <= 18;
    const matchesBackground = Math.abs(r - 128) <= 35 && Math.abs(g - 128) <= 35 && Math.abs(b - 128) <= 35;
    if (isGray && matchesBackground) pixels[i + 3] = 0;
  }
  ctx.putImageData(imageData, 0, 0);
}

async function main() {
  const image = await loadImage(sourcePath);
  const source = createCanvas(image.width, image.height);
  const sourceContext = source.getContext('2d');
  sourceContext.drawImage(image, 0, 0);
  removeGrayBackground(sourceContext, image.width, image.height);

  let count = 0;
  for (const [action, frames] of Object.entries(actions)) {
    const outputDir = path.join(outputRoot, action);
    fs.mkdirSync(outputDir, { recursive: true });
    for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
      const [sx, sy, sw, sh] = frames[frameIndex];
      const frame = createCanvas(sw, sh);
      const frameContext = frame.getContext('2d');
      frameContext.imageSmoothingEnabled = false;
      frameContext.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
      fs.writeFileSync(path.join(outputDir, `frame_${String(frameIndex + 1).padStart(2, '0')}.png`), frame.toBuffer('image/png'));
      count++;
    }
  }
  console.log(`Exported ${count} transparent frames from ${sourcePath}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
