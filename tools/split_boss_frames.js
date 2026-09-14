const { createCanvas, loadImage } = require('/Users/allenwang/.gemini/antigravity-ide/canvas_tool/node_modules/canvas');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../imgs');
const outputRoot = path.join(root, 'boss');

// Boss sprite frames configuration
const bossActions = {
  idle: {
    source: path.join('boss', 'boss_idle.jpg'),
    frames: [
      [0, 0, 200, 180], [200, 0, 200, 180], [400, 0, 200, 180], [600, 0, 200, 180],
    ]
  },
  move: {
    source: path.join('boss', 'boss_move.jpg'),
    frames: [
      [0, 0, 200, 180], [200, 0, 200, 180], [400, 0, 200, 180], [600, 0, 200, 180],
    ]
  },
  attack: {
    source: path.join('boss', 'boss_attack.jpg'),
    frames: [
      [0, 0, 220, 180], [220, 0, 220, 180], [440, 0, 220, 180],
    ]
  },
  spray: {
    source: path.join('boss', 'boss_ spray.jpg'),
    frames: [
      [0, 0, 200, 180], [200, 0, 200, 180], [400, 0, 200, 180],
    ]
  }
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
  let totalFrames = 0;
  
  for (const [action, config] of Object.entries(bossActions)) {
    const sourcePath = path.join(root, config.source);
    console.log(`Processing ${action} from ${config.source}`);
    
    try {
      const image = await loadImage(sourcePath);
      const source = createCanvas(image.width, image.height);
      const sourceContext = source.getContext('2d');
      sourceContext.drawImage(image, 0, 0);
      removeGrayBackground(sourceContext, image.width, image.height);

      const outputDir = path.join(outputRoot, action);
      fs.mkdirSync(outputDir, { recursive: true });
      
      for (let frameIndex = 0; frameIndex < config.frames.length; frameIndex++) {
        const [sx, sy, sw, sh] = config.frames[frameIndex];
        const frame = createCanvas(sw, sh);
        const frameContext = frame.getContext('2d');
        frameContext.imageSmoothingEnabled = false;
        frameContext.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
        fs.writeFileSync(path.join(outputDir, `frame_${String(frameIndex + 1).padStart(2, '0')}.png`), frame.toBuffer('image/png'));
        totalFrames++;
      }
      
      console.log(`  Exported ${config.frames.length} frames for ${action}`);
    } catch (error) {
      console.error(`  Error processing ${action}:`, error.message);
    }
  }
  
  console.log(`Total: Exported ${totalFrames} boss sprite frames`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });