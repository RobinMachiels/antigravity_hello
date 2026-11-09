import * as THREE from 'three';

/**
 * 5 Decorated Christmas Trees
 * - Tiered voxel/low-poly pine foliage with white snow caps
 * - Colorful baubles / ornaments
 * - Spiraling fairy lights that gently twinkle
 * - Glowing 3D golden star on top that slowly rotates
 */
export class ChristmasTrees {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.trees = [];
    this.stars = [];
    this.fairyLights = [];

    this.initMaterials();
    this.createAllTrees();
    this.scene.add(this.group);
  }

  initMaterials() {
    // Pine foliage colors (deep forest green)
    this.foliageMat1 = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.85,
      flatShading: true
    });
    this.foliageMat2 = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.85,
      flatShading: true
    });

    // Trunk wood
    this.trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a2810,
      roughness: 0.9,
      flatShading: true
    });

    // Snow caps on branches
    this.snowMat = new THREE.MeshStandardMaterial({
      color: 0xf5fcff,
      roughness: 0.9,
      flatShading: true
    });

    // Golden topper star
    this.starMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffaa00,
      emissiveIntensity: 1.5,
      metalness: 0.8,
      roughness: 0.2,
      flatShading: true
    });

    // Bauble ornament colors (vivid retro palette)
    this.baubleColors = [
      0xd90429, // Ruby red
      0xffd166, // Bright gold
      0x0077b6, // Sapphire blue
      0x52b788, // Emerald green
      0x9d4edd  // Amethyst purple
    ];

    this.baubleMaterials = this.baubleColors.map(color => {
      return new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.35,
        metalness: 0.7,
        roughness: 0.25,
        flatShading: true
      });
    });

    // Fairy light colors
    this.fairyLightColors = [0xff4d6d, 0xffbe0b, 0x06d6a0, 0x118ab2, 0xffffff];
  }

  /**
   * Helper to create a single decorated tree
   */
  createTree(config) {
    const { x, z, scale = 1.0, tiers = 4, rotation = 0 } = config;
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);
    treeGroup.rotation.y = rotation;
    treeGroup.scale.set(scale, scale, scale);

    // 1. Wooden Trunk
    const trunkHeight = 1.2 * tiers * 0.45;
    const trunkRadius = 0.28;
    const trunkGeom = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 7);
    const trunk = new THREE.Mesh(trunkGeom, this.trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 2. Foliage Tiers (stepped pyramidal cones with snow edging)
    let currentY = trunkHeight * 0.65;
    const baseRadius = 1.8;
    const tierHeight = 1.3;

    for (let i = 0; i < tiers; i++) {
      const tierFraction = i / tiers;
      const r = baseRadius * (1.0 - tierFraction * 0.65);
      const h = tierHeight * (1.0 - tierFraction * 0.2);

      // Green pine cone
      const coneGeom = new THREE.ConeGeometry(r, h, 8);
      const foliageMat = (i % 2 === 0) ? this.foliageMat1 : this.foliageMat2;
      const cone = new THREE.Mesh(coneGeom, foliageMat);
      cone.position.y = currentY + h / 2;
      cone.castShadow = true;
      cone.receiveShadow = true;
      treeGroup.add(cone);

      // Snow trim on branch rim
      const snowRimGeom = new THREE.CylinderGeometry(r * 0.82, r * 1.02, 0.16, 8, 1, true);
      const snowRim = new THREE.Mesh(snowRimGeom, this.snowMat);
      snowRim.position.y = currentY + 0.08;
      treeGroup.add(snowRim);

      // Snow on the slope
      const snowSlopeGeom = new THREE.ConeGeometry(r * 0.65, h * 0.45, 8);
      const snowSlope = new THREE.Mesh(snowSlopeGeom, this.snowMat);
      snowSlope.position.y = currentY + h * 0.65;
      treeGroup.add(snowSlope);

      // Add colorful baubles around this tier
      const baubleCount = Math.max(3, Math.round(r * 4.5));
      for (let b = 0; b < baubleCount; b++) {
        const angle = (b / baubleCount) * Math.PI * 2 + (i * 0.7);
        const baubleMat = this.baubleMaterials[(b + i) % this.baubleMaterials.length];
        const baubleRadius = 0.13 + Math.random() * 0.04;
        const baubleGeom = new THREE.DodecahedronGeometry(baubleRadius, 0);
        const bauble = new THREE.Mesh(baubleGeom, baubleMat);

        const bx = Math.cos(angle) * (r * 0.88);
        const bz = Math.sin(angle) * (r * 0.88);
        const by = currentY + 0.18 + (Math.sin(b * 3) * 0.1);

        bauble.position.set(bx, by, bz);
        bauble.castShadow = true;
        treeGroup.add(bauble);
      }

      // Add spiraling fairy lights
      const lightCount = Math.max(4, Math.round(r * 5));
      for (let l = 0; l < lightCount; l++) {
        const angle = (l / lightCount) * Math.PI * 2 + (i * 1.2);
        const lColor = this.fairyLightColors[(l + i) % this.fairyLightColors.length];
        const lightMat = new THREE.MeshBasicMaterial({ color: lColor });
        const lightGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const bulb = new THREE.Mesh(lightGeom, lightMat);

        const lx = Math.cos(angle) * (r * 0.82);
        const lz = Math.sin(angle) * (r * 0.82);
        const ly = currentY + (l / lightCount) * (h * 0.75) + 0.15;

        bulb.position.set(lx, ly, lz);
        bulb.userData = {
          baseColor: new THREE.Color(lColor),
          phase: Math.random() * Math.PI * 2,
          speed: 2.0 + Math.random() * 3.0
        };
        treeGroup.add(bulb);
        this.fairyLights.push(bulb);
      }

      currentY += h * 0.62;
    }

    // 3. Golden Star on Top
    const starGeom = new THREE.OctahedronGeometry(0.35, 0);
    const star = new THREE.Mesh(starGeom, this.starMat);
    star.position.y = currentY + 0.35;
    treeGroup.add(star);

    // Decorative mini spikes for 3D star
    const spikeGeom = new THREE.ConeGeometry(0.12, 0.45, 4);
    const spikeAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    spikeAngles.forEach(rad => {
      const spike = new THREE.Mesh(spikeGeom, this.starMat);
      spike.rotation.z = rad;
      spike.position.y = currentY + 0.35;
      treeGroup.add(spike);
    });

    // Mini point light at the star
    const starLight = new THREE.PointLight(0xffbe3b, 0.8, 4.5, 2.0);
    starLight.position.y = currentY + 0.4;
    treeGroup.add(starLight);

    this.stars.push(star);
    this.trees.push(treeGroup);
    this.group.add(treeGroup);

    return { treeGroup, topY: currentY + 0.5 };
  }

  createAllTrees() {
    // 5 Decorated Christmas Trees placed around the North Pole
    const treeConfigs = [
      // 1. The Grand Main Tree near the Santa Workshop plaza
      { x: -7.5, z: 4.5, scale: 1.25, tiers: 5, rotation: 0.3 },

      // 2. Pine tree near the eastern ridge and North Pole
      { x: 6.8, z: -2.5, scale: 1.05, tiers: 4, rotation: 1.2 },

      // 3. Cozy Workshop Garden Tree
      { x: 6.2, z: 6.5, scale: 0.95, tiers: 4, rotation: 2.4 },

      // 4. Frozen Pond Shoreline Pine
      { x: -9.5, z: -6.0, scale: 0.88, tiers: 3, rotation: 0.8 },

      // 5. Northern Hillside Pine (framing the horizon)
      { x: -1.5, z: -10.5, scale: 1.15, tiers: 4, rotation: 3.1 }
    ];

    treeConfigs.forEach(cfg => this.createTree(cfg));
  }

  update(delta, time) {
    // Rotate tree topper stars slowly
    this.stars.forEach((star, idx) => {
      star.rotation.y = time * 0.8 + idx;
      star.rotation.z = Math.sin(time + idx) * 0.08;
    });

    // Twinkle fairy lights
    this.fairyLights.forEach(bulb => {
      const brightness = 0.4 + 0.6 * Math.sin(time * bulb.userData.speed + bulb.userData.phase);
      bulb.material.color.copy(bulb.userData.baseColor).multiplyScalar(brightness);
    });
  }
}
