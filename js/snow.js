import * as THREE from 'three';
import { createPixelSnowflakeTexture } from './textures.js';

/**
 * Falling Snow Particles System
 * - 3,000 pixel snowflakes
 * - Dynamic wind turbulence and drifting
 * - Seamless boundary wrap-around
 */
export class SnowParticles {
  constructor(scene, count = 3000) {
    this.scene = scene;
    this.count = count;
    this.bounds = {
      x: 36,
      yMin: 0.1,
      yMax: 28,
      z: 36
    };

    this.windStrength = 1.0;
    this.initParticles();
    this.scene.add(this.points);
  }

  initParticles() {
    this.snowflakeTexture = createPixelSnowflakeTexture();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);
    const phases = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      // Random position across bounded volume
      positions[i * 3 + 0] = (Math.random() - 0.5) * this.bounds.x * 2;
      positions[i * 3 + 1] = Math.random() * (this.bounds.yMax - this.bounds.yMin) + this.bounds.yMin;
      positions[i * 3 + 2] = (Math.random() - 0.5) * this.bounds.z * 2;

      // Downward velocity + horizontal drift
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = -(1.2 + Math.random() * 2.2); // fall speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.35 + Math.random() * 0.45;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.velocities = velocities;
    this.phases = phases;

    const material = new THREE.PointsMaterial({
      size: 0.65,
      map: this.snowflakeTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geometry, material);
  }

  setDensity(multiplier) {
    this.points.material.opacity = Math.min(1.0, 0.9 * multiplier);
  }

  update(delta, time) {
    const positions = this.points.geometry.attributes.position.array;
    const count = this.count;
    const windX = Math.sin(time * 0.35) * 0.8 * this.windStrength;
    const windZ = Math.cos(time * 0.28) * 0.5 * this.windStrength;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const phase = this.phases[i];

      // Vertical fall
      positions[idx + 1] += this.velocities[idx + 1] * delta;

      // Gentle fluttering sway with sine turbulence
      positions[idx + 0] += (this.velocities[idx + 0] + windX + Math.sin(time * 1.5 + phase) * 0.35) * delta;
      positions[idx + 2] += (this.velocities[idx + 2] + windZ + Math.cos(time * 1.2 + phase) * 0.35) * delta;

      // Ground reset (loop back to top)
      if (positions[idx + 1] < this.bounds.yMin) {
        positions[idx + 1] = this.bounds.yMax;
        positions[idx + 0] = (Math.random() - 0.5) * this.bounds.x * 2;
        positions[idx + 2] = (Math.random() - 0.5) * this.bounds.z * 2;
      }

      // X boundaries wrap
      if (positions[idx + 0] > this.bounds.x) positions[idx + 0] = -this.bounds.x;
      else if (positions[idx + 0] < -this.bounds.x) positions[idx + 0] = this.bounds.x;

      // Z boundaries wrap
      if (positions[idx + 2] > this.bounds.z) positions[idx + 2] = -this.bounds.z;
      else if (positions[idx + 2] < -this.bounds.z) positions[idx + 2] = this.bounds.z;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
