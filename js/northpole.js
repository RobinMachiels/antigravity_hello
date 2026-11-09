import * as THREE from 'three';
import { createCandyCaneTexture, createSignTexture } from './textures.js';

/**
 * The Official North Pole Marker
 * - Tall pole with red & white spiral stripes
 * - Golden brass globe on top
 * - Authentic directional wooden signboards
 * - Snow mound base
 */
export class NorthPoleMarker {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(5, 0.5, -0.5);

    this.initTextures();
    this.buildBase();
    this.buildPole();
    this.buildSigns();
    this.buildFinial();

    this.scene.add(this.group);
  }

  initTextures() {
    this.poleTexture = createCandyCaneTexture();

    // Wooden signboards
    this.signMainTex = createSignTexture('★ NORTH POLE ★', '90° 00\' 00" N', 256, 80);
    this.signWorkshopTex = createSignTexture('WORKSHOP ➔', 'ELF QUARTERS', 220, 72);
    this.signSouthTex = createSignTexture('SOUTH ➔', 'ALL DIRECTIONS', 220, 72);
  }

  buildBase() {
    // Stepped snow mound
    const snowBaseMat = new THREE.MeshStandardMaterial({
      color: 0xf5fbff,
      roughness: 0.95,
      flatShading: true
    });

    const m1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 0.45, 10), snowBaseMat);
    m1.position.y = 0.22;
    m1.receiveShadow = true;
    m1.castShadow = true;
    this.group.add(m1);

    const m2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.4, 0.35, 9), snowBaseMat);
    m2.position.y = 0.55;
    m2.receiveShadow = true;
    m2.castShadow = true;
    this.group.add(m2);

    // Decorative icy cobblestones around base
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a6578,
      roughness: 0.8,
      flatShading: true
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.1, 0), rockMat);
      rock.position.set(Math.cos(angle) * 1.6, 0.15, Math.sin(angle) * 1.6);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.group.add(rock);
    }
  }

  buildPole() {
    this.poleHeight = 6.2;
    this.poleRadius = 0.22;

    // Barber-pole with red and white spiral stripes
    const poleGeom = new THREE.CylinderGeometry(this.poleRadius, this.poleRadius, this.poleHeight, 16, 8);
    const poleMat = new THREE.MeshStandardMaterial({
      map: this.poleTexture,
      roughness: 0.35,
      metalness: 0.15,
      flatShading: true
    });

    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.y = this.poleHeight / 2 + 0.3;
    pole.castShadow = true;
    pole.receiveShadow = true;
    this.group.add(pole);

    // Gold rings/collars along the pole
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.85,
      roughness: 0.2,
      flatShading: true
    });

    [0.7, 3.2, 5.8].forEach(y => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(this.poleRadius * 1.25, this.poleRadius * 1.25, 0.12, 12),
        collarMat
      );
      ring.position.y = y;
      this.group.add(ring);
    });
  }

  buildSigns() {
    const woodMat = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      flatShading: true
    });

    // 1. Main Official Sign: "NORTH POLE 90°N"
    const sign1Mat = woodMat.clone();
    sign1Mat.map = this.signMainTex;
    const sign1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 0.12), sign1Mat);
    sign1.position.set(0.1, 4.8, 0.22);
    sign1.rotation.y = -0.15;
    sign1.castShadow = true;
    this.group.add(sign1);

    // 2. Workshop direction sign
    const sign2Mat = woodMat.clone();
    sign2Mat.map = this.signWorkshopTex;
    const sign2 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 0.12), sign2Mat);
    sign2.position.set(-0.6, 4.0, 0.1);
    sign2.rotation.y = 0.65;
    sign2.castShadow = true;
    this.group.add(sign2);

    // 3. "SOUTH (EVERY DIRECTION)" sign
    const sign3Mat = woodMat.clone();
    sign3Mat.map = this.signSouthTex;
    const sign3 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 0.12), sign3Mat);
    sign3.position.set(0.6, 3.2, -0.1);
    sign3.rotation.y = -0.75;
    sign3.castShadow = true;
    this.group.add(sign3);
  }

  buildFinial() {
    // Top golden finial: gleaming brass sphere
    const finialMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffaa00,
      emissiveIntensity: 0.35,
      metalness: 0.95,
      roughness: 0.15,
      flatShading: true
    });

    const sphereGeom = new THREE.SphereGeometry(0.48, 12, 10);
    this.finialSphere = new THREE.Mesh(sphereGeom, finialMat);
    this.finialSphere.position.y = this.poleHeight + 0.65;
    this.finialSphere.castShadow = true;
    this.group.add(this.finialSphere);

    // Little golden compass needle or mini spire on top
    const needleGeom = new THREE.ConeGeometry(0.12, 0.5, 6);
    const needle = new THREE.Mesh(needleGeom, finialMat);
    needle.position.y = this.poleHeight + 1.25;
    this.group.add(needle);

    // Soft warm illumination around the pole
    const poleLight = new THREE.PointLight(0xfffae0, 1.2, 10, 1.5);
    poleLight.position.set(0, this.poleHeight * 0.7, 0.5);
    this.group.add(poleLight);
  }

  update(delta, time) {
    // Subtle gleam rotation
    if (this.finialSphere) {
      this.finialSphere.rotation.y = time * 0.4;
    }
  }
}
