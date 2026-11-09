# ★ NORTH POLE 64 ★
### Interactive Retro 64-Bit Pixel-Art Three.js Browser Scene

A winter wonderland North Pole scene built with Three.js in a nostalgic 64-bit pixel-art aesthetic.

---

## ✨ Features

1. **Santa's Workshop with Interactive Windows**:
   - Voxel-style log cabin with A-frame snowy roof, hanging icicles, front door wreath, and stone chimney.
   - Animated chimney smoke puffs drifting into the arctic air.
   - **Clicking on any window** toggles the workshop lights on and off, controlling the warm glowing interior `PointLight` and emissive window materials with an authentic retro relay sound and chime.

2. **5 Decorated Christmas Trees**:
   - 5 uniquely positioned and scaled pine trees across the snowy clearing and shoreline.
   - Multi-tiered pine foliage dusted with fresh snow.
   - Festive baubles in vibrant retro colors (ruby red, golden yellow, sapphire blue, emerald green, amethyst).
   - Twinkling multi-colored fairy light garlands.
   - Slowly rotating 3D golden stars atop each tree with warm point lighting.

3. **Gifts Under the Trees**:
   - Wrapped gift boxes placed under all 5 trees, with a festive pile under the Grand Tree.
   - Realistic 3D ribbon bands and bows.
   - **Clicking any gift** causes it to playfully bounce and spin with a retro toy sound!

4. **Falling Snow Particle System**:
   - Over 3,000 falling pixel snowflakes drifting and fluttering with dynamic wind sway and seamless boundary wrap.

5. **Shimmering Stars & Sky**:
   - 1,200 shimmering stars across the celestial dome with individual twinkle frequencies and color temperatures.
   - Stylized waving **Aurora Borealis (Northern Lights)** ribbon waving emerald green, teal, and violet in the northern sky.
   - Stylized low-poly crescent moon casting cool moonlight and soft shadows.

6. **The Official North Pole Marker**:
   - Iconic candy-cane barber pole with crisp red and white spiral stripes.
   - Polished golden brass globe finial.
   - Wooden directional signboards: *"★ NORTH POLE ★ 90° 00' 00" N"*, *"SANTA'S WORKSHOP ➔"*, and *"SOUTH ➔ (ALL DIRECTIONS)"*.
   - Elevated snow mound and icy rock base.

7. **Camera & Mouse Controls**:
   - **Left-Click + Drag**: Rotate / orbit around the North Pole scene.
   - **Scroll Wheel**: Smooth zoom in and out.
   - **Right-Click + Drag**: Pan the focal view point.
   - **Quick View Presets**: One-click camera buttons for *Overview*, *Workshop*, *North Pole*, *Main Tree*, and *Auto-Orbit*.
   - Pitch limits ensure the camera never clips through the snowy terrain.

8. **Authentic 64-Bit Pixel Post-Processing**:
   - Custom full-screen pixelation shader pass.
   - Selectable pixel resolutions: **4x (Classic 64-Bit)**, **2x (Sharp Retro)**, **6x (Ultra Chunky)**, or **1x (HD Smooth)**.
   - 4x4 Bayer matrix dithering and retro palette color quantization.

9. **Procedural Web Audio Engine**:
   - Zero external audio file dependencies!
   - Window light switch click + chime.
   - Present bounce sound.
   - Toggleable festive 8-bit chiptune music box (*"Jingle Bells"*).

---

## 🚀 How to Run

### Option 1: Start with Node.js
From the project directory:
```bash
node server.js
```
Then open your browser at:
```
http://localhost:3000
```

### Option 2: Using Any Static File Server
You can serve the folder with any static web server (such as Python, Vite, or VS Code Live Server):
```bash
npx serve .
```
Or open `index.html` via any local HTTP server.
