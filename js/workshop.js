import * as THREE from 'three';
import { createWoodPlankTexture, createChimneyBrickTexture, createSignTexture } from './textures.js';
import { playWindowSwitchSound } from './audio.js';

export class Workshop {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.windowMeshes = [];
    this.glassPanes = [];
    this.smokeParticles = [];
    this.lightsOn = true;

    this.woodTexture = createWoodPlankTexture();
    this.brickTexture = createChimneyBrickTexture();
    this.signTexture = createSignTexture("SANTA'S WORKSHOP", "★ NORTH POLE ★", 256, 96);

    this.initMaterials();
    this.buildCabin();
    this.buildRoof();
    this.buildChimney();
    this.buildWindows();
    this.buildDoorAndPorch();
    this.buildSign();
    this.setupLighting();

    this.scene.add(this.group);
  }

  initMaterials() {
    // Wood cabin walls
    this.woodMaterial = new THREE.MeshStandardMaterial({
      map: this.woodTexture,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });

    // Dark trim wood
    this.darkWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d1e0d,
      roughness: 0.9,
      flatShading: true
    });

    // Snow covering
    this.snowMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5fbff,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true
    });

    // Icicle ice
    this.iceMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0f0fd,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });

    // Chimney brick
    this.brickMaterial = new THREE.MeshStandardMaterial({
      map: this.brickTexture,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true
    });

    // Glowing window glass
    this.windowMaterialOn = new THREE.MeshStandardMaterial({
      color: 0xfff0b3,
      emissive: 0xffaa11,
      emissiveIntensity: 2.4,
      roughness: 0.2,
      metalness: 0.1,
      flatShading: true
    });

    this.windowMaterialOff = new THREE.MeshStandardMaterial({
      color: 0x1a2634,
      emissive: 0x0d1520,
      emissiveIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.3,
      flatShading: true
    });
  }

  buildCabin() {
    // Main cabin dimensions
    this.width = 6.0;
    this.height = 3.6;
    this.depth = 4.8;

    // Stone foundation base
    const foundationGeom = new THREE.BoxGeometry(this.width + 0.4, 0.6, this.depth + 0.4);
    const foundationMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.95,
      flatShading: true
    });
    const foundation = new THREE.Mesh(foundationGeom, foundationMat);
    foundation.position.y = 0.3;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.group.add(foundation);

    // Main log walls
    const wallsGeom = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const walls = new THREE.Mesh(wallsGeom, this.woodMaterial);
    walls.position.y = 0.6 + this.height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    this.group.add(walls);

    // Corner log pillars (gives voxel/blocky cabin feel)
    const pillarGeom = new THREE.BoxGeometry(0.5, this.height + 0.2, 0.5);
    const corners = [
      [-this.width / 2, this.depth / 2],
      [this.width / 2, this.depth / 2],
      [-this.width / 2, -this.depth / 2],
      [this.width / 2, -this.depth / 2]
    ];
    corners.forEach(([cx, cz]) => {
      const pillar = new THREE.Mesh(pillarGeom, this.darkWoodMaterial);
      pillar.position.set(cx, 0.6 + (this.height + 0.2) / 2, cz);
      pillar.castShadow = true;
      this.group.add(pillar);
    });

    // Gable triangular walls
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-this.width / 2, 0);
    gableShape.lineTo(0, 2.2);
    gableShape.lineTo(this.width / 2, 0);
    gableShape.closePath();

    const extrudeSettings = { depth: 0.4, bevelEnabled: false };
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);

    const frontGable = new THREE.Mesh(gableGeom, this.woodMaterial);
    frontGable.position.set(0, 0.6 + this.height, this.depth / 2 - 0.4);
    this.group.add(frontGable);

    const backGable = new THREE.Mesh(gableGeom, this.woodMaterial);
    backGable.position.set(0, 0.6 + this.height, -this.depth / 2);
    this.group.add(backGable);
  }

  buildRoof() {
    const roofSlopeLength = 4.4;
    const roofWidth = this.depth + 1.2;
    const roofThickness = 0.35;
    const roofAngle = Math.PI * 0.20;

    // Left roof slope
    const roofGeom = new THREE.BoxGeometry(roofSlopeLength, roofThickness, roofWidth);

    const leftRoof = new THREE.Mesh(roofGeom, this.snowMaterial);
    leftRoof.position.set(-1.7, 0.6 + this.height + 1.0, 0);
    leftRoof.rotation.z = roofAngle;
    leftRoof.castShadow = true;
    leftRoof.receiveShadow = true;
    this.group.add(leftRoof);

    // Right roof slope
    const rightRoof = new THREE.Mesh(roofGeom, this.snowMaterial);
    rightRoof.position.set(1.7, 0.6 + this.height + 1.0, 0);
    rightRoof.rotation.z = -roofAngle;
    rightRoof.castShadow = true;
    rightRoof.receiveShadow = true;
    this.group.add(rightRoof);

    // Ridge snow cap on top of roof
    const ridgeGeom = new THREE.BoxGeometry(0.5, 0.35, roofWidth + 0.1);
    const ridge = new THREE.Mesh(ridgeGeom, this.snowMaterial);
    ridge.position.set(0, 0.6 + this.height + 2.3, 0);
    this.group.add(ridge);

    // Icicles along front eave
    this.buildIcicles();
  }

  buildIcicles() {
    const icicleGroup = new THREE.Group();
    const count = 12;
    const spacing = (this.depth + 0.8) / count;

    for (let i = 0; i <= count; i++) {
      const h = 0.3 + Math.random() * 0.45;
      const icicleGeom = new THREE.ConeGeometry(0.08, h, 4);
      const icicle = new THREE.Mesh(icicleGeom, this.iceMaterial);
      icicle.rotation.x = Math.PI;
      icicle.position.set(this.width / 2 + 0.45, 0.6 + this.height - 0.2, -this.depth / 2 - 0.2 + i * spacing);
      icicleGroup.add(icicle);

      // Other side
      const icicle2 = icicle.clone();
      icicle2.position.x = -this.width / 2 - 0.45;
      icicleGroup.add(icicle2);
    }
    this.group.add(icicleGroup);
  }

  buildChimney() {
    // Red brick chimney stack
    const chimneyGeom = new THREE.BoxGeometry(1.0, 2.8, 1.0);
    const chimney = new THREE.Mesh(chimneyGeom, this.brickMaterial);
    chimney.position.set(-1.8, 0.6 + this.height + 1.8, -0.8);
    chimney.castShadow = true;
    this.group.add(chimney);

    // Snow collar around chimney
    const snowCapGeom = new THREE.BoxGeometry(1.2, 0.3, 1.2);
    const snowCap = new THREE.Mesh(snowCapGeom, this.snowMaterial);
    snowCap.position.set(-1.8, 0.6 + this.height + 3.25, -0.8);
    this.group.add(snowCap);

    // Chimney smoke emitter anchor
    this.chimneySmokePosition = new THREE.Vector3(-1.8, 0.6 + this.height + 3.5, -0.8);
  }

  buildWindows() {
    // Helper to build a window unit with frame and crossbars
    const createWindow = (w, h, name) => {
      const winGroup = new THREE.Group();
      winGroup.name = name;

      // Glowing Glass Pane (Interactive mesh)
      const glassGeom = new THREE.BoxGeometry(w, h, 0.12);
      const glass = new THREE.Mesh(glassGeom, this.windowMaterialOn);
      glass.name = 'window_glass';
      glass.userData = { isWindow: true, workshop: this, isGlassPane: true };
      winGroup.add(glass);
      this.windowMeshes.push(glass);
      this.glassPanes.push(glass);

      // Outer wooden window frame
      const frameGeom = new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.08);
      const frameMat = this.darkWoodMaterial;
      const frame = new THREE.Mesh(frameGeom, frameMat);
      frame.position.z = -0.04;
      frame.userData = { isWindow: true, workshop: this };
      winGroup.add(frame);
      this.windowMeshes.push(frame);

      // Mullion cross bars (pixel window grid)
      const barHGeom = new THREE.BoxGeometry(w, 0.08, 0.14);
      const barH = new THREE.Mesh(barHGeom, frameMat);
      barH.userData = { isWindow: true, workshop: this };
      winGroup.add(barH);
      this.windowMeshes.push(barH);

      const barVGeom = new THREE.BoxGeometry(0.08, h, 0.14);
      const barV = new THREE.Mesh(barVGeom, frameMat);
      barV.userData = { isWindow: true, workshop: this };
      winGroup.add(barV);
      this.windowMeshes.push(barV);

      // Window snow sill
      const sillGeom = new THREE.BoxGeometry(w + 0.24, 0.12, 0.22);
      const sill = new THREE.Mesh(sillGeom, this.snowMaterial);
      sill.position.set(0, -h / 2 - 0.06, 0.06);
      sill.userData = { isWindow: true, workshop: this };
      winGroup.add(sill);
      this.windowMeshes.push(sill);

      // Snow on top of window
      const topSnowGeom = new THREE.BoxGeometry(w + 0.16, 0.15, 0.2);
      const topSnow = new THREE.Mesh(topSnowGeom, this.snowMaterial);
      topSnow.position.set(0, h / 2 + 0.07, 0.06);
      topSnow.userData = { isWindow: true, workshop: this };
      winGroup.add(topSnow);
      this.windowMeshes.push(topSnow);

      return winGroup;
    };

    // Front Window Left
    const winFL = createWindow(1.2, 1.2, 'win_front_left');
    winFL.position.set(-1.6, 2.2, this.depth / 2 + 0.04);
    this.group.add(winFL);

    // Front Window Right
    const winFR = createWindow(1.2, 1.2, 'win_front_right');
    winFR.position.set(1.6, 2.2, this.depth / 2 + 0.04);
    this.group.add(winFR);

    // Side Window Left
    const winSL = createWindow(1.4, 1.2, 'win_side_left');
    winSL.position.set(-this.width / 2 - 0.04, 2.2, 0);
    winSL.rotation.y = -Math.PI / 2;
    this.group.add(winSL);

    // Side Window Right
    const winSR = createWindow(1.4, 1.2, 'win_side_right');
    winSR.position.set(this.width / 2 + 0.04, 2.2, 0);
    winSR.rotation.y = Math.PI / 2;
    this.group.add(winSR);

    // Attic / Loft triangular or circular window
    const winAttic = createWindow(0.8, 0.8, 'win_attic');
    winAttic.position.set(0, 4.7, this.depth / 2 + 0.02);
    this.group.add(winAttic);
  }

  buildDoorAndPorch() {
    // Front door
    const doorWidth = 1.3;
    const doorHeight = 2.4;
    const doorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, 0.15);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x541c09,
      roughness: 0.85,
      flatShading: true
    });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(0, 0.6 + doorHeight / 2, this.depth / 2 + 0.05);
    door.castShadow = true;
    this.group.add(door);

    // Golden door knob
    const knobGeom = new THREE.SphereGeometry(0.08, 6, 6);
    const knobMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.9,
      roughness: 0.2
    });
    const knob = new THREE.Mesh(knobGeom, knobMat);
    knob.position.set(0.42, 0.6 + doorHeight / 2, this.depth / 2 + 0.15);
    this.group.add(knob);

    // Christmas Wreath on door
    const wreathGeom = new THREE.TorusGeometry(0.32, 0.1, 8, 16);
    const wreathMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.9,
      flatShading: true
    });
    const wreath = new THREE.Mesh(wreathGeom, wreathMat);
    wreath.position.set(0, 0.6 + doorHeight / 2 + 0.35, this.depth / 2 + 0.16);
    this.group.add(wreath);

    // Red ribbon bow on wreath
    const bowGeom = new THREE.BoxGeometry(0.18, 0.14, 0.08);
    const bowMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      roughness: 0.6
    });
    const bow = new THREE.Mesh(bowGeom, bowMat);
    bow.position.set(0, 0.6 + doorHeight / 2 + 0.62, this.depth / 2 + 0.2);
    this.group.add(bow);

    // Wooden Porch step
    const porchGeom = new THREE.BoxGeometry(2.4, 0.25, 1.2);
    const porch = new THREE.Mesh(porchGeom, this.woodMaterial);
    porch.position.set(0, 0.125, this.depth / 2 + 0.6);
    porch.receiveShadow = true;
    this.group.add(porch);

    // Snow dusting on porch edges
    const porchSnowGeom = new THREE.BoxGeometry(2.5, 0.1, 0.3);
    const porchSnow = new THREE.Mesh(porchSnowGeom, this.snowMaterial);
    porchSnow.position.set(0, 0.28, this.depth / 2 + 1.1);
    this.group.add(porchSnow);

    // Lantern by the door
    const lanternGeom = new THREE.BoxGeometry(0.2, 0.35, 0.2);
    this.lanternMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xffaa00,
      emissiveIntensity: 1.8,
      flatShading: true
    });
    const lantern = new THREE.Mesh(lanternGeom, this.lanternMaterial);
    lantern.position.set(0.95, 2.5, this.depth / 2 + 0.2);
    this.group.add(lantern);

    const lanternPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.25, 4),
      this.darkWoodMaterial
    );
    lanternPost.position.set(0.95, 2.7, this.depth / 2 + 0.1);
    this.group.add(lanternPost);
  }

  buildSign() {
    // Hanging wooden signboard "SANTA'S WORKSHOP"
    const signGeom = new THREE.BoxGeometry(2.8, 1.0, 0.12);
    const signMat = new THREE.MeshStandardMaterial({
      map: this.signTexture,
      roughness: 0.8,
      flatShading: true
    });
    const sign = new THREE.Mesh(signGeom, signMat);
    sign.position.set(0, 3.8, this.depth / 2 + 0.35);
    sign.castShadow = true;
    this.group.add(sign);

    // Hanging chains
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const chain1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), chainMat);
    chain1.position.set(-1.0, 4.4, this.depth / 2 + 0.3);
    this.group.add(chain1);

    const chain2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), chainMat);
    chain2.position.set(1.0, 4.4, this.depth / 2 + 0.3);
    this.group.add(chain2);
  }

  setupLighting() {
    // Warm interior point light shining through the windows
    this.interiorLight = new THREE.PointLight(0xffa834, 3.2, 18, 1.2);
    this.interiorLight.position.set(0, 2.4, 0.5);
    this.interiorLight.castShadow = true;
    this.interiorLight.shadow.bias = -0.002;
    this.interiorLight.shadow.mapSize.width = 512;
    this.interiorLight.shadow.mapSize.height = 512;
    this.group.add(this.interiorLight);

    // Porch warm glow
    this.porchLight = new THREE.PointLight(0xffbe53, 1.2, 6, 1.5);
    this.porchLight.position.set(0.95, 2.5, this.depth / 2 + 0.4);
    this.group.add(this.porchLight);
  }

  /**
   * Toggle workshop lights ON/OFF
   */
  toggleLights() {
    this.setLights(!this.lightsOn);
    playWindowSwitchSound(this.lightsOn);
    return this.lightsOn;
  }

  setLights(state) {
    this.lightsOn = state;

    // Update only the glass panes with emissive glowing material
    this.glassPanes.forEach(mesh => {
      mesh.material = this.lightsOn ? this.windowMaterialOn : this.windowMaterialOff;
    });

    // Update interior pointlight
    this.interiorLight.intensity = this.lightsOn ? 3.2 : 0.08;
    this.porchLight.intensity = this.lightsOn ? 1.2 : 0.05;

    if (this.lanternMaterial) {
      this.lanternMaterial.emissiveIntensity = this.lightsOn ? 1.8 : 0.1;
    }

    return this.lightsOn;
  }

  /**
   * Chimney smoke animation
   */
  update(delta, time) {
    // Spawn smoke puff periodically
    if (Math.random() < 0.12 && this.smokeParticles.length < 24) {
      const puffGeom = new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.12, 0);
      const puffMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.9,
        transparent: true,
        opacity: 0.7,
        flatShading: true
      });
      const puff = new THREE.Mesh(puffGeom, puffMat);
      puff.position.copy(this.chimneySmokePosition);
      puff.position.x += (Math.random() - 0.5) * 0.2;
      puff.position.z += (Math.random() - 0.5) * 0.2;

      puff.userData = {
        vy: 0.8 + Math.random() * 0.4,
        vx: 0.2 + Math.random() * 0.2, // slight wind drift
        scaleSpeed: 0.6 + Math.random() * 0.4,
        life: 1.0,
        decay: 0.25 + Math.random() * 0.15
      };

      this.group.add(puff);
      this.smokeParticles.push(puff);
    }

    // Update existing smoke puffs
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.userData.life -= p.userData.decay * delta;

      if (p.userData.life <= 0) {
        this.group.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        this.smokeParticles.splice(i, 1);
      } else {
        p.position.y += p.userData.vy * delta;
        p.position.x += p.userData.vx * delta;
        p.position.z += Math.sin(time * 2 + i) * 0.01;

        const s = 1.0 + (1.0 - p.userData.life) * p.userData.scaleSpeed;
        p.scale.set(s, s, s);
        p.material.opacity = p.userData.life * 0.65;
      }
    }
  }
}
