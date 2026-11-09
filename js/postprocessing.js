import * as THREE from 'three';

/**
 * Self-contained 64-Bit Pixel-Art Post-Processing Pipeline
 * Renders the scene to an off-screen render target, then applies pixelation
 * and retro color quantization via a full-screen quad shader.
 * Zero external addon dependencies, ultra fast, 100% reliable.
 */
export class PixelPostProcess {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Config defaults
    this.pixelSize = 4.0; // 4x chunky pixel scale (classic 64-bit / voxel feel)
    this.colorLevels = 24.0; // Retro color depth
    this.paletteEnabled = true;

    this.initRenderTarget();
    this.initPostScene();
  }

  initRenderTarget() {
    const size = this.renderer.getSize(new THREE.Vector2());
    const pixelRatio = this.renderer.getPixelRatio();

    this.renderTarget = new THREE.WebGLRenderTarget(
      Math.floor(size.x * pixelRatio),
      Math.floor(size.y * pixelRatio),
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        stencilBuffer: false,
        depthBuffer: true
      }
    );
  }

  initPostScene() {
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const size = this.renderer.getSize(new THREE.Vector2());
    const pixelRatio = this.renderer.getPixelRatio();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        uResolution: { value: new THREE.Vector2(size.x * pixelRatio, size.y * pixelRatio) },
        uPixelSize: { value: this.pixelSize },
        uColorLevels: { value: this.colorLevels },
        uPaletteEnabled: { value: this.paletteEnabled ? 1 : 0 },
        uDitherStrength: { value: 0.015 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uPixelSize;
        uniform float uColorLevels;
        uniform int uPaletteEnabled;
        uniform float uDitherStrength;
        varying vec2 vUv;

        // Pure branch Bayer 4x4 matrix for 100% universal WebGL compatibility
        float bayer4(vec2 coord) {
          vec2 p = mod(floor(coord), 4.0);
          float x = p.x;
          float y = p.y;
          if (y < 0.5) {
            if (x < 0.5) return -0.5;
            if (x < 1.5) return 0.5 - 0.5; // 8/16
            if (x < 2.5) return 0.125 - 0.5; // 2/16
            return 0.625 - 0.5; // 10/16
          } else if (y < 1.5) {
            if (x < 0.5) return 0.75 - 0.5; // 12/16
            if (x < 1.5) return 0.25 - 0.5; // 4/16
            if (x < 2.5) return 0.875 - 0.5; // 14/16
            return 0.375 - 0.5; // 6/16
          } else if (y < 2.5) {
            if (x < 0.5) return 0.1875 - 0.5; // 3/16
            if (x < 1.5) return 0.6875 - 0.5; // 11/16
            if (x < 2.5) return 0.0625 - 0.5; // 1/16
            return 0.5625 - 0.5; // 9/16
          } else {
            if (x < 0.5) return 0.9375 - 0.5; // 15/16
            if (x < 1.5) return 0.4375 - 0.5; // 7/16
            if (x < 2.5) return 0.8125 - 0.5; // 13/16
            return 0.3125 - 0.5; // 5/16
          }
        }

        void main() {
          vec2 dxy = uPixelSize / uResolution;
          vec2 coord = dxy * floor(vUv / dxy) + (dxy * 0.5);
          vec4 color = texture2D(tDiffuse, coord);

          if (uPaletteEnabled == 1) {
            // Slight retro dither
            float dither = bayer4(gl_FragCoord.xy / uPixelSize) * uDitherStrength;
            vec3 quantized = color.rgb + dither;
            quantized = floor(quantized * uColorLevels + 0.5) / uColorLevels;
            color.rgb = clamp(quantized, 0.0, 1.0);
          }

          gl_FragColor = color;
        }
      `,
      depthTest: false,
      depthWrite: false
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.postScene.add(quad);
  }

  setPixelSize(size) {
    this.pixelSize = Math.max(1.0, size);
    this.material.uniforms.uPixelSize.value = this.pixelSize;
  }

  setPaletteEnabled(enabled) {
    this.paletteEnabled = !!enabled;
    this.material.uniforms.uPaletteEnabled.value = this.paletteEnabled ? 1 : 0;
  }

  setSize(width, height) {
    const pixelRatio = this.renderer.getPixelRatio();
    const w = Math.floor(width * pixelRatio);
    const h = Math.floor(height * pixelRatio);

    this.renderTarget.setSize(w, h);
    this.material.uniforms.uResolution.value.set(w, h);
  }

  render() {
    // 1. Render primary scene into our offscreen render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // 2. Render pixelated post-processing quad to screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }
}
