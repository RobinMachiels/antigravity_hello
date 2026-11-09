import * as THREE from 'three';
import { createPixelStarTexture } from './textures.js';

/**
 * Shimmering Starry Sky & Northern Lights (Aurora Borealis)
 * - 1,200 shimmering stars with randomized twinkle frequencies
 * - Undulating stylized Aurora Borealis ribbon
 * - Stylized crescent moon
 */
export class StarrySky {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    this.initStars();
    this.initAurora();
    this.initMoon();

    this.scene.add(this.group);
  }

  initStars() {
    this.starCount = 1200;
    this.starTexture = createPixelStarTexture();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);
    const shimmerParams = new Float32Array(this.starCount * 2); // [rate, phase]

    // Color variations
    const palette = [
      new THREE.Color(0xffffff), // Pure diamond white
      new THREE.Color(0xd7eaff), // Soft arctic blue
      new THREE.Color(0xfff3c4), // Pale golden star
      new THREE.Color(0xcce8ff), // Sapphire frost
      new THREE.Color(0xd0f4de)  // Aurora mint green
    ];

    const radius = 65;

    for (let i = 0; i < this.starCount; i++) {
      // Hemisphere distribution (upper dome: phi between 0 and PI/2.2)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.46; // keep strictly in upper sky

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) + 2.0; // elevated above ground
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random color
      const baseCol = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = baseCol.r;
      colors[i * 3 + 1] = baseCol.g;
      colors[i * 3 + 2] = baseCol.b;

      // Shimmer speed and phase
      shimmerParams[i * 2 + 0] = 1.5 + Math.random() * 4.5;
      shimmerParams[i * 2 + 1] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.baseColors = new Float32Array(colors);
    this.shimmerParams = shimmerParams;

    const material = new THREE.PointsMaterial({
      size: 1.4,
      map: this.starTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.group.add(this.starPoints);
  }

  initAurora() {
    // Stylized waving Aurora Borealis curtain in northern sky
    const ribbonWidth = 70;
    const ribbonHeight = 12;
    const segmentsW = 40;
    const segmentsH = 8;

    const geometry = new THREE.PlaneGeometry(ribbonWidth, ribbonHeight, segmentsW, segmentsH);

    // Bend plane into an arc spanning the north
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const curveZ = -38 - Math.cos((x / ribbonWidth) * Math.PI) * 12;
      pos.setZ(i, curveZ);
      pos.setY(i, pos.getY(i) + 24);
    }
    geometry.computeVertexNormals();

    // Aurora vertex wave & gradient shader
    this.auroraMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Wave motion
          float wave1 = sin(pos.x * 0.12 + time * 0.8) * 2.2;
          float wave2 = cos(pos.x * 0.25 - time * 0.5) * 1.5;
          pos.z += wave1 + wave2;
          pos.y += sin(pos.x * 0.08 + time * 0.4) * 1.2;

          vElevation = pos.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        void main() {
          // Vertical gradient: Emerald green at bottom, cyan in middle, violet/magenta at top
          vec3 colGreen = vec3(0.18, 0.90, 0.65);
          vec3 colTeal  = vec3(0.0, 0.85, 0.95);
          vec3 colViolet= vec3(0.65, 0.25, 0.95);

          vec3 color = mix(colGreen, colTeal, smoothstep(0.0, 0.5, vUv.y));
          color = mix(color, colViolet, smoothstep(0.5, 1.0, vUv.y));

          // Soft fading edges
          float alpha = sin(vUv.x * 3.14159) * (1.0 - abs(vUv.y - 0.4) * 1.8);
          alpha = clamp(alpha * 0.45, 0.0, 0.55);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.auroraMesh = new THREE.Mesh(geometry, this.auroraMaterial);
    this.group.add(this.auroraMesh);
  }

  initMoon() {
    // Stylized crescent moon in the sky
    const moonGroup = new THREE.Group();
    moonGroup.position.set(-28, 38, -32);

    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0
    });

    // Outer moon disk
    const moonGeom = new THREE.CylinderGeometry(2.4, 2.4, 0.3, 16);
    const moon = new THREE.Mesh(moonGeom, moonMat);
    moon.rotation.x = Math.PI / 2;
    moon.rotation.z = 0.4;
    moonGroup.add(moon);

    // Dark cutout disk to create a crisp crescent
    const darkMat = new THREE.MeshBasicMaterial({
      color: 0x050b18 // matching deep night sky
    });
    const cutout = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.35, 16), darkMat);
    cutout.rotation.x = Math.PI / 2;
    cutout.position.set(0.9, 0.5, 0.02);
    moonGroup.add(cutout);

    // Soft moon aura
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x70a0ff,
      transparent: true,
      opacity: 0.18
    });
    const aura = new THREE.Mesh(new THREE.CircleGeometry(3.6, 16), auraMat);
    aura.position.z = -0.1;
    moonGroup.add(aura);

    this.group.add(moonGroup);
  }

  update(delta, time) {
    // 1. Shimmer stars
    if (this.starPoints) {
      const colors = this.starPoints.geometry.attributes.color.array;
      const count = this.starCount;

      for (let i = 0; i < count; i++) {
        const rate = this.shimmerParams[i * 2 + 0];
        const phase = this.shimmerParams[i * 2 + 1];

        // Pulsating shimmer multiplier between 0.35 and 1.2
        const twinkle = 0.45 + 0.55 * Math.sin(time * rate + phase);

        const r0 = this.baseColors[i * 3 + 0];
        const g0 = this.baseColors[i * 3 + 1];
        const b0 = this.baseColors[i * 3 + 2];

        colors[i * 3 + 0] = r0 * twinkle;
        colors[i * 3 + 1] = g0 * twinkle;
        colors[i * 3 + 2] = b0 * twinkle;
      }

      this.starPoints.geometry.attributes.color.needsUpdate = true;
    }

    // 2. Animate Aurora wave
    if (this.auroraMaterial) {
      this.auroraMaterial.uniforms.time.value = time;
    }
  }
}
