import * as THREE from 'three';
import { createPresentTexture } from './textures.js';
import { playPresentSound } from './audio.js';

/**
 * Presents under the Christmas trees
 * Voxel/low-poly gift boxes with ribbons, bows, and interactive bounce.
 */
export class Presents {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.presentMeshes = [];
    this.animatingPresents = [];

    this.initMaterials();
    this.spawnPresents();
    this.scene.add(this.group);
  }

  initMaterials() {
    // Generate different wrapping textures
    this.wrapTextures = [
      createPresentTexture(0), // Red polka dots
      createPresentTexture(1), // Green gold stripes
      createPresentTexture(2), // Blue silver snowflakes
      createPresentTexture(3), // Gold shimmer
      createPresentTexture(4)  // Royal purple
    ];

    this.wrapMaterials = this.wrapTextures.map(tex => {
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.5,
        metalness: 0.1,
        flatShading: true
      });
    });

    // Ribbon materials
    this.ribbonMaterials = {
      gold: new THREE.MeshStandardMaterial({
        color: 0xffd166,
        metalness: 0.7,
        roughness: 0.3,
        flatShading: true
      }),
      silver: new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        metalness: 0.8,
        roughness: 0.25,
        flatShading: true
      }),
      red: new THREE.MeshStandardMaterial({
        color: 0xd90429,
        metalness: 0.5,
        roughness: 0.4,
        flatShading: true
      }),
      green: new THREE.MeshStandardMaterial({
        color: 0x2d6a4f,
        metalness: 0.5,
        roughness: 0.4,
        flatShading: true
      })
    };

    // Lights list for animation / breathing glow
    this.presentLights = [];
  }

  createSinglePresent(config) {
    const {
      x, y = 0, z,
      size = [0.8, 0.6, 0.8],
      wrapType = 0,
      ribbonColor = 'gold',
      rotation = 0
    } = config;

    const [w, h, d] = size;
    const presentGroup = new THREE.Group();
    presentGroup.position.set(x, y + h / 2, z);
    presentGroup.rotation.y = rotation;

    // 1. Box Body
    const boxGeom = new THREE.BoxGeometry(w, h, d);
    const boxMat = this.wrapMaterials[wrapType % this.wrapMaterials.length];
    const box = new THREE.Mesh(boxGeom, boxMat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.userData = { isPresent: true, parentGroup: presentGroup };
    presentGroup.add(box);
    this.presentMeshes.push(box);

    // 2. Ribbons (cross bands)
    const ribbonMat = this.ribbonMaterials[ribbonColor] || this.ribbonMaterials.gold;
    const ribThick = 0.02;
    const ribWidth = Math.min(w, d) * 0.22;

    // Horizontal ribbon band (around Z axis)
    const rib1Geom = new THREE.BoxGeometry(w + ribThick * 2, h + ribThick * 2, ribWidth);
    const rib1 = new THREE.Mesh(rib1Geom, ribbonMat);
    rib1.userData = { isPresent: true, parentGroup: presentGroup };
    presentGroup.add(rib1);
    this.presentMeshes.push(rib1);

    // Vertical ribbon band (around X axis)
    const rib2Geom = new THREE.BoxGeometry(ribWidth, h + ribThick * 2, d + ribThick * 2);
    const rib2 = new THREE.Mesh(rib2Geom, ribbonMat);
    rib2.userData = { isPresent: true, parentGroup: presentGroup };
    presentGroup.add(rib2);
    this.presentMeshes.push(rib2);

    // 3. Ribbon Bow on Top
    const bowGroup = new THREE.Group();
    bowGroup.position.y = h / 2 + 0.05;

    // Center knot
    const knotGeom = new THREE.BoxGeometry(ribWidth * 0.9, 0.1, ribWidth * 0.9);
    const knot = new THREE.Mesh(knotGeom, ribbonMat);
    bowGroup.add(knot);

    // Bow loops
    const loopGeom = new THREE.TorusGeometry(0.12, 0.04, 6, 8, Math.PI);

    const loop1 = new THREE.Mesh(loopGeom, ribbonMat);
    loop1.rotation.y = Math.PI / 4;
    loop1.rotation.z = Math.PI / 4;
    loop1.position.set(-0.08, 0.08, -0.08);
    bowGroup.add(loop1);

    const loop2 = new THREE.Mesh(loopGeom, ribbonMat);
    loop2.rotation.y = -Math.PI / 4;
    loop2.rotation.z = -Math.PI / 4;
    loop2.position.set(0.08, 0.08, 0.08);
    bowGroup.add(loop2);

    presentGroup.add(bowGroup);

    // 4. Warm subtle point light above the present ribbon bow
    const lightColors = [0xffe099, 0xffb703, 0xffcad4, 0x90e0ef, 0xd8bbff];
    const lightColor = lightColors[wrapType % lightColors.length];
    const presentLight = new THREE.PointLight(lightColor, 0.7, 2.2, 2.0);
    presentLight.position.set(0, h / 2 + 0.25, 0);
    presentGroup.add(presentLight);
    this.presentLights.push({
      light: presentLight,
      baseIntensity: 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 2.0 + Math.random() * 1.5
    });

    // Store animation data
    presentGroup.userData = {
      baseY: y + h / 2,
      baseScale: 1.0,
      animTime: 0
    };

    this.group.add(presentGroup);
    return presentGroup;
  }

  spawnPresents() {
    // Tree 1 (Grand Tree at -7.5, 4.5): Bountiful pile of presents!
    this.createSinglePresent({
      x: -7.0, z: 3.5, size: [0.9, 0.8, 0.9],
      wrapType: 0, ribbonColor: 'gold', rotation: 0.2
    });
    this.createSinglePresent({
      x: -8.1, z: 3.8, size: [0.75, 0.5, 0.75],
      wrapType: 2, ribbonColor: 'silver', rotation: -0.4
    });
    this.createSinglePresent({
      x: -6.6, z: 4.8, size: [0.65, 0.65, 0.65],
      wrapType: 1, ribbonColor: 'gold', rotation: 0.6
    });
    this.createSinglePresent({
      x: -7.8, z: 5.4, size: [0.85, 0.7, 0.6],
      wrapType: 3, ribbonColor: 'red', rotation: -0.15
    });
    this.createSinglePresent({
      x: -7.1, z: 3.6, y: 0.8, size: [0.5, 0.45, 0.5],
      wrapType: 4, ribbonColor: 'silver', rotation: 0.35
    });

    // Tree 2 (North Pole Guard Tree at 6.8, -2.5): 2 presents
    this.createSinglePresent({
      x: 6.2, z: -2.0, size: [0.75, 0.7, 0.75],
      wrapType: 1, ribbonColor: 'red', rotation: 0.5
    });
    this.createSinglePresent({
      x: 7.2, z: -1.8, size: [0.6, 0.5, 0.6],
      wrapType: 3, ribbonColor: 'green', rotation: -0.3
    });

    // Tree 3 (Workshop Garden Tree at 6.2, 6.5): 2 presents
    this.createSinglePresent({
      x: 5.5, z: 6.2, size: [0.8, 0.65, 0.8],
      wrapType: 0, ribbonColor: 'gold', rotation: 0.1
    });
    this.createSinglePresent({
      x: 6.8, z: 7.1, size: [0.7, 0.6, 0.55],
      wrapType: 2, ribbonColor: 'silver', rotation: -0.7
    });

    // Tree 4 (Frozen Pond Shoreline Pine at -9.5, -6.0): 1 present
    this.createSinglePresent({
      x: -9.0, z: -5.4, size: [0.8, 0.7, 0.8],
      wrapType: 2, ribbonColor: 'silver', rotation: 0.4
    });

    // Tree 5 (Northern Hillside Pine at -1.5, -10.5): 1 present
    this.createSinglePresent({
      x: -1.0, z: -9.8, size: [0.75, 0.65, 0.75],
      wrapType: 4, ribbonColor: 'gold', rotation: -0.2
    });
  }

  /**
   * Interactive bounce when clicked
   */
  bouncePresent(presentGroup) {
    if (!presentGroup) return;
    playPresentSound();
    if (!this.animatingPresents.includes(presentGroup)) {
      presentGroup.userData.animTime = 0;
      this.animatingPresents.push(presentGroup);
    }
  }

  update(delta, time = 0) {
    // Gentle warm breathing shimmer on present lights
    for (const item of this.presentLights) {
      item.light.intensity = item.baseIntensity * (0.8 + 0.25 * Math.sin(time * item.speed + item.phase));
    }

    for (let i = this.animatingPresents.length - 1; i >= 0; i--) {
      const p = this.animatingPresents[i];
      p.userData.animTime += delta * 6;

      const progress = p.userData.animTime;
      if (progress >= Math.PI) {
        // Reset to base
        p.position.y = p.userData.baseY;
        p.scale.set(1, 1, 1);
        p.rotation.y += 0.2;
        this.animatingPresents.splice(i, 1);
      } else {
        // Cute jump curve
        const hop = Math.sin(progress) * 0.4;
        p.position.y = p.userData.baseY + hop;
        const squash = 1.0 + Math.sin(progress * 2) * 0.15;
        p.scale.set(squash, 1.0 + hop * 0.5, squash);
        p.rotation.y += delta * 4;
      }
    }
  }
}
