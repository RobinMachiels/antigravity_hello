import * as THREE from 'three';

/**
 * Procedural pixel-art textures generator
 * All textures use THREE.NearestFilter to maintain crisp 64-bit pixel art definition.
 */

// Helper to create an offscreen canvas
function createPixelCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Helper to create a Three.js texture with NearestFilter
function makeNearestTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * 1. North Pole Candy Cane Spiral Texture
 * Diagonal alternating bright candy red and pure crisp white stripes.
 */
export function createCandyCaneTexture() {
  const size = 128;
  const { canvas, ctx } = createPixelCanvas(size, size);

  // Background white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Red stripes at 45 degree angle with a thin gold accent line
  const stripeWidth = 32;
  ctx.fillStyle = '#d62828';

  for (let offset = -size; offset < size * 2; offset += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + stripeWidth, 0);
    ctx.lineTo(offset + stripeWidth - size, size);
    ctx.lineTo(offset - size, size);
    ctx.closePath();
    ctx.fill();

    // Subtle darker red edge shadow for depth
    ctx.fillStyle = '#9e1c1c';
    ctx.fillRect(offset + stripeWidth - 4, 0, 4, size);
    ctx.fillStyle = '#d62828';
  }

  // Thin gold pin-stripe
  ctx.fillStyle = '#f6bd60';
  for (let offset = -size; offset < size * 2; offset += stripeWidth * 2) {
    ctx.fillRect(offset - 4, 0, 3, size);
  }

  const texture = makeNearestTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  return texture;
}

/**
 * 2. Wood Planks Texture for Santa's Workshop
 */
export function createWoodPlankTexture() {
  const size = 64;
  const { canvas, ctx } = createPixelCanvas(size, size);

  // Base warm cedar wood
  ctx.fillStyle = '#7a3e1d';
  ctx.fillRect(0, 0, size, size);

  // Planks
  const plankHeight = 16;
  const colors = ['#8d4922', '#7a3e1d', '#683416', '#85421e'];

  for (let y = 0; y < size; y += plankHeight) {
    const plankColor = colors[(y / plankHeight) % colors.length];
    ctx.fillStyle = plankColor;
    ctx.fillRect(0, y, size, plankHeight - 2);

    // Dark plank groove
    ctx.fillStyle = '#3e1c0b';
    ctx.fillRect(0, y + plankHeight - 2, size, 2);

    // Wood grain lines
    ctx.fillStyle = '#5c2d13';
    ctx.fillRect(4, y + 4, size - 12, 1);
    ctx.fillRect(10, y + 8, size - 20, 1);

    // Nails
    ctx.fillStyle = '#261207';
    ctx.fillRect(3, y + 3, 2, 2);
    ctx.fillRect(size - 5, y + 3, 2, 2);
  }

  const texture = makeNearestTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 3. Chimney Brick Texture
 */
export function createChimneyBrickTexture() {
  const size = 64;
  const { canvas, ctx } = createPixelCanvas(size, size);

  // Mortar background
  ctx.fillStyle = '#9e9994';
  ctx.fillRect(0, 0, size, size);

  // Bricks
  const bHeight = 8;
  const bWidth = 16;
  const brickColors = ['#9e2a2b', '#b53334', '#8b2425', '#a72c2d'];

  let row = 0;
  for (let y = 0; y < size; y += bHeight) {
    const offsetX = (row % 2 === 0) ? 0 : bWidth / 2;
    for (let x = -bWidth; x < size + bWidth; x += bWidth) {
      const colIndex = Math.abs(Math.floor((x + y * 7) / 11)) % brickColors.length;
      ctx.fillStyle = brickColors[colIndex];
      ctx.fillRect(x + offsetX + 1, y + 1, bWidth - 2, bHeight - 2);

      // Subtle pixel highlight on top edge of brick
      ctx.fillStyle = '#c74445';
      ctx.fillRect(x + offsetX + 1, y + 1, bWidth - 2, 1);
    }
    row++;
  }

  const texture = makeNearestTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

/**
 * 4. Wooden Signboard Texture (for North Pole and Santa's Workshop)
 */
export function createSignTexture(text, subtitle = '', width = 256, height = 96, isPointed = false) {
  const { canvas, ctx } = createPixelCanvas(width, height);

  // Background wood plank
  ctx.fillStyle = '#5c2c16';
  ctx.fillRect(0, 0, width, height);

  // Inner carved face
  ctx.fillStyle = '#8b4a24';
  ctx.fillRect(4, 4, width - 8, height - 8);

  // Wood borders / trim
  ctx.strokeStyle = '#381708';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Snow cap on top edge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, 2, width - 4, 6);
  ctx.fillStyle = '#d0e5f2';
  ctx.fillRect(6, 6, width - 12, 3);

  // Pixel style text
  ctx.fillStyle = '#fff4cc';
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#210e05';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  if (subtitle) {
    ctx.fillText(text, width / 2, height / 2 - 10);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#ffd166';
    ctx.fillText(subtitle, width / 2, height / 2 + 16);
  } else {
    ctx.fillText(text, width / 2, height / 2);
  }

  return makeNearestTexture(canvas);
}

/**
 * 5. Pixel Snowflake Sprite Texture
 */
export function createPixelSnowflakeTexture() {
  const size = 32;
  const { canvas, ctx } = createPixelCanvas(size, size);

  // Clear
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Outer soft pixel glow
  ctx.fillStyle = 'rgba(215, 235, 255, 0.4)';
  ctx.fillRect(cx - 3, cy - 3, 6, 6);

  // 8-bit pixel cross
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 1, 4, 2, size - 8);
  ctx.fillRect(4, cy - 1, size - 8, 2);

  // Diagonals
  ctx.fillRect(cx - 4, cy - 4, 2, 2);
  ctx.fillRect(cx + 2, cy - 4, 2, 2);
  ctx.fillRect(cx - 4, cy + 2, 2, 2);
  ctx.fillRect(cx + 2, cy + 2, 2, 2);

  // Center core
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 2, cy - 2, 4, 4);

  return makeNearestTexture(canvas);
}

/**
 * 6. Pixel Star Sprite Texture for Sky
 */
export function createPixelStarTexture() {
  const size = 32;
  const { canvas, ctx } = createPixelCanvas(size, size);

  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;

  // Outer glow
  ctx.fillStyle = 'rgba(180, 220, 255, 0.3)';
  ctx.fillRect(cx - 4, cy - 4, 8, 8);

  // Ray flares
  ctx.fillStyle = 'rgba(255, 255, 240, 0.8)';
  ctx.fillRect(cx - 1, 2, 2, size - 4);
  ctx.fillRect(2, cy - 1, size - 4, 2);

  // Bright core
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 2, cy - 2, 4, 4);

  return makeNearestTexture(canvas);
}

/**
 * 7. Present Wrapping Paper Patterns
 */
export function createPresentTexture(type = 0) {
  const size = 32;
  const { canvas, ctx } = createPixelCanvas(size, size);

  if (type === 0) {
    // Red with golden polka dots
    ctx.fillStyle = '#d90429';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffd166';
    for (let x = 4; x < size; x += 10) {
      for (let y = 4; y < size; y += 10) {
        ctx.fillRect(x, y, 3, 3);
      }
    }
  } else if (type === 1) {
    // Forest green with diagonal gold stripes
    ctx.fillStyle = '#1b4332';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#f4a261';
    for (let i = -size; i < size * 2; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 3, 0);
      ctx.lineTo(i + 3 - size, size);
      ctx.lineTo(i - size, size);
      ctx.closePath();
      ctx.fill();
    }
  } else if (type === 2) {
    // Royal blue with silver snowflakes
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#e0f2fe';
    for (let x = 6; x < size; x += 12) {
      for (let y = 6; y < size; y += 12) {
        ctx.fillRect(x, y - 2, 1, 5);
        ctx.fillRect(x - 2, y, 5, 1);
      }
    }
  } else if (type === 3) {
    // Radiant festive gold
    ctx.fillStyle = '#e09f3e';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#fff3b0';
    for (let x = 0; x < size; x += 4) {
      ctx.fillRect(x, (x * 2) % size, 2, 2);
    }
  } else {
    // Purple / Plum
    ctx.fillStyle = '#5a189a';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#e0aaff';
    for (let y = 0; y < size; y += 6) {
      ctx.fillRect(0, y, size, 2);
    }
  }

  const texture = makeNearestTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 8. Snowy Ground Texture
 */
export function createSnowTexture() {
  const size = 64;
  const { canvas, ctx } = createPixelCanvas(size, size);

  ctx.fillStyle = '#e8f4f8';
  ctx.fillRect(0, 0, size, size);

  // Subtle crystal speckles
  const speckleColors = ['#f5fcff', '#d6e9f3', '#c2def0', '#ffffff'];
  for (let i = 0; i < 180; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const col = speckleColors[Math.floor(Math.random() * speckleColors.length)];
    ctx.fillStyle = col;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = makeNearestTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}
