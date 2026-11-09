import * as THREE from 'three';
import { createSnowTexture } from './textures.js';

/**
 * North Pole Snowy Landscape & Frozen Pond
 * - Stepped voxel snow banks & hills
 * - Translucent frozen ice lake
 * - Winding snowy pathway
 * - Festive snowmen & rustic wooden fences
 */
export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    this.initMaterials();
    this.buildGround();
    this.buildFrozenPond();
    this.buildSnowBanks();
    this.buildSnowman();
    this.buildRusticFences();

    this.scene.add(this.group);
  }

  initMaterials() {
    this.snowTexture = createSnowTexture();

    // Main snowy surface
    this.snowMat = new THREE.MeshStandardMaterial({
      map: this.snowTexture,
      color: 0xf5fbff,
      roughness: 0.92,
      metalness: 0.05,
      flatShading: true
    });

    // Dark permafrost / rock underlayer
    this.permafrostMat = new THREE.MeshStandardMaterial({
      color: 0x3d4b5c,
      roughness: 0.95,
      flatShading: true
    });

    // Frozen ice pond
    this.iceMat = new THREE.MeshStandardMaterial({
      color: 0x88d4ec,
      emissive: 0x113a4d,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88,
      flatShading: true
    });

    // Fence wood
    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.85,
      flatShading: true
    });
  }

  buildGround() {
    // 1. Primary ground base (wide snowy expanse)
    const groundGeom = new THREE.CylinderGeometry(28, 30, 1.2, 32);
    const ground = new THREE.Mesh(groundGeom, this.snowMat);
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Permafrost rim beneath
    const baseGeom = new THREE.CylinderGeometry(30, 31, 2.0, 32);
    const base = new THREE.Mesh(baseGeom, this.permafrostMat);
    base.position.y = -2.2;
    this.group.add(base);

    // 2. Stepped snow terraces (voxel-like elevation layers)
    const terraceConfigs = [
      // Northern hill slope
      { x: -5, z: -15, rx: 14, rz: 8, h: 0.6 },
      { x: -8, z: -18, rx: 10, rz: 6, h: 0.7 },
      // Eastern ridge
      { x: 14, z: 2, rx: 8, rz: 14, h: 0.5 },
      // Southwestern gentle rise
      { x: -14, z: 8, rx: 10, rz: 10, h: 0.4 }
    ];

    terraceConfigs.forEach(t => {
      const terrGeom = new THREE.CylinderGeometry(t.rx, t.rx + 1.0, t.h, 16);
      terrGeom.scale(1, 1, t.rz / t.rx);
      const terr = new THREE.Mesh(terrGeom, this.snowMat);
      terr.position.set(t.x, t.h / 2, t.z);
      terr.receiveShadow = true;
      terr.castShadow = true;
      this.group.add(terr);
    });
  }

  buildFrozenPond() {
    // Frozen ice pond in the northwest corner
    const pondGroup = new THREE.Group();
    pondGroup.position.set(-11, 0.02, -7);

    // Oval ice surface
    const iceGeom = new THREE.CylinderGeometry(5.2, 5.4, 0.1, 16);
    iceGeom.scale(1.2, 1, 0.8);
    const ice = new THREE.Mesh(iceGeom, this.iceMat);
    ice.receiveShadow = true;
    pondGroup.add(ice);

    // Decorative ice cracks / crystal blocks
    const crackMat = new THREE.MeshBasicMaterial({
      color: 0xe0f7fa,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < 5; i++) {
      const crack = new THREE.Mesh(new THREE.BoxGeometry(1.6 + Math.random() * 1.5, 0.02, 0.08), crackMat);
      crack.position.set((Math.random() - 0.5) * 5, 0.06, (Math.random() - 0.5) * 3);
      crack.rotation.y = Math.random() * Math.PI;
      pondGroup.add(crack);
    }

    // Snow banks ringing the pond
    const bankMat = this.snowMat;
    for (let a = 0; a < Math.PI * 2; a += 0.5) {
      const bx = Math.cos(a) * 5.6 * 1.2;
      const bz = Math.sin(a) * 5.6 * 0.8;
      const bank = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.35, 0), bankMat);
      bank.position.set(bx, 0.2, bz);
      bank.receiveShadow = true;
      pondGroup.add(bank);
    }

    this.group.add(pondGroup);
  }

  buildSnowBanks() {
    // Clusters of soft voxel snow drifts around the scene
    const driftPositions = [
      [-3, 4.5], [3, 4.5], [-4, -2], [1, -5],
      [8, 3], [-8, 0], [4, 9], [-5, 11]
    ];

    driftPositions.forEach(([dx, dz]) => {
      const drift = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.7 + Math.random() * 0.5, 0),
        this.snowMat
      );
      drift.position.set(dx, 0.2, dz);
      drift.scale.set(1.4, 0.6, 1.2);
      drift.rotation.set(0, Math.random() * Math.PI, 0);
      drift.castShadow = true;
      drift.receiveShadow = true;
      this.group.add(drift);
    });
  }

  buildSnowman() {
    // Cute voxel/retro snowman standing cheerfully between the workshop and pond
    const smGroup = new THREE.Group();
    smGroup.position.set(-3.8, 0, 1.5);
    smGroup.rotation.y = 0.45;

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xfafcff,
      roughness: 0.9,
      flatShading: true
    });

    // Bottom snowball
    const b1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), snowMat);
    b1.position.y = 0.65;
    b1.castShadow = true;
    smGroup.add(b1);

    // Middle snowball
    const b2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), snowMat);
    b2.position.y = 1.6;
    b2.castShadow = true;
    smGroup.add(b2);

    // Head snowball
    const b3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), snowMat);
    b3.position.y = 2.35;
    b3.castShadow = true;
    smGroup.add(b3);

    // Carrot nose (orange cone)
    const carrotMat = new THREE.MeshStandardMaterial({
      color: 0xf77f00,
      roughness: 0.6,
      flatShading: true
    });
    const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 5), carrotMat);
    carrot.rotation.x = Math.PI / 2;
    carrot.position.set(0, 2.35, 0.45);
    smGroup.add(carrot);

    // Coal eyes & buttons
    const coalMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      flatShading: true
    });

    // Eyes
    [-0.12, 0.12].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), coalMat);
      eye.position.set(ex, 2.45, 0.36);
      smGroup.add(eye);
    });

    // Buttons on chest
    [1.75, 1.55, 1.35].forEach(by => {
      const button = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), coalMat);
      button.position.set(0, by, 0.52);
      smGroup.add(button);
    });

    // Red festive scarf
    const scarfMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      roughness: 0.7,
      flatShading: true
    });
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 6, 12), scarfMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 2.02;
    smGroup.add(scarf);

    // Scarf tail
    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.06), scarfMat);
    scarfTail.position.set(0.2, 1.75, 0.42);
    scarfTail.rotation.z = -0.3;
    smGroup.add(scarfTail);

    // Black Top Hat
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.8,
      flatShading: true
    });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 10), hatMat);
    brim.position.y = 2.7;
    smGroup.add(brim);

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 10), hatMat);
    crown.position.y = 2.95;
    smGroup.add(crown);

    // Hat red ribbon band
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 10), scarfMat);
    band.position.y = 2.78;
    smGroup.add(band);

    // Stick arms
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0x5a3818,
      roughness: 0.9,
      flatShading: true
    });
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), stickMat);
    armL.position.set(-0.7, 1.75, 0);
    armL.rotation.z = Math.PI / 3;
    smGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), stickMat);
    armR.position.set(0.7, 1.75, 0);
    armR.rotation.z = -Math.PI / 3;
    smGroup.add(armR);

    this.group.add(smGroup);
  }

  buildRusticFences() {
    // Rustic post-and-rail wooden fence line
    const fenceGroup = new THREE.Group();

    const postGeom = new THREE.BoxGeometry(0.18, 1.2, 0.18);
    const railGeom = new THREE.BoxGeometry(2.1, 0.12, 0.08);

    // Fence section near workshop path
    for (let i = 0; i < 4; i++) {
      const px = -2.5 + i * 2.0;
      const pz = 8.5;

      // Post
      const post = new THREE.Mesh(postGeom, this.woodMat);
      post.position.set(px, 0.6, pz);
      post.castShadow = true;
      fenceGroup.add(post);

      // Snow on post top
      const snowTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), this.snowMat);
      snowTop.position.set(px, 1.25, pz);
      fenceGroup.add(snowTop);

      if (i < 3) {
        // Rails
        const rail1 = new THREE.Mesh(railGeom, this.woodMat);
        rail1.position.set(px + 1.0, 0.45, pz);
        fenceGroup.add(rail1);

        const rail2 = new THREE.Mesh(railGeom, this.woodMat);
        rail2.position.set(px + 1.0, 0.85, pz);
        fenceGroup.add(rail2);

        // Snow on top rail
        const railSnow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.12), this.snowMat);
        railSnow.position.set(px + 1.0, 0.94, pz);
        fenceGroup.add(railSnow);
      }
    }

    this.group.add(fenceGroup);
  }
}
