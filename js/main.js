import * as THREE from 'three';
import { SmoothOrbitControls } from './controls.js';
import { Terrain } from './terrain.js';
import { Workshop } from './workshop.js';
import { ChristmasTrees } from './trees.js';
import { Presents } from './presents.js';
import { NorthPoleMarker } from './northpole.js';
import { SnowParticles } from './snow.js';
import { StarrySky } from './stars.js';
import { PixelPostProcess } from './postprocessing.js';
import { toggleMute, toggleMusicBox, isMusicPlaying } from './audio.js';

class NorthPoleScene {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.hoveredInteractive = false;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLighting();
    this.initControls();
    this.initWorld();
    this.initPostProcessing();
    this.initInteractivity();
    this.initUI();

    this.onWindowResize();
    window.addEventListener('resize', () => this.onWindowResize());

    // Start loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Crisp pixel edges
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x050a18, 1.0);

    // Chunky pixel-style shadow maps
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    // Arctic night fog
    this.scene.fog = new THREE.FogExp2(0x060c1d, 0.016);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    // Initial cinematic viewpoint
    this.camera.position.set(16, 12, 22);
    this.camera.lookAt(0, 2.5, 0);
  }

  initLighting() {
    // 1. Ambient Arctic Blue Sky light
    const ambientLight = new THREE.AmbientLight(0x1a2947, 0.9);
    this.scene.add(ambientLight);

    // 2. Hemisphere fill light (deep indigo sky to dark navy ground)
    const hemiLight = new THREE.HemisphereLight(0x283b5e, 0x091122, 0.5);
    this.scene.add(hemiLight);

    // 3. Directional Moonlight (cool pale blue)
    this.moonLight = new THREE.DirectionalLight(0xbdd8ff, 1.4);
    this.moonLight.position.set(-16, 28, 14);
    this.moonLight.castShadow = true;

    // Shadow camera configuration
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 5;
    this.moonLight.shadow.camera.far = 60;

    const d = 22;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.001;

    this.scene.add(this.moonLight);
  }

  initControls() {
    this.controls = new SmoothOrbitControls(this.camera, this.renderer.domElement);
  }

  initWorld() {
    // 1. Shimmering Starry Sky, Aurora Borealis & Moon
    this.sky = new StarrySky(this.scene);

    // 2. North Pole Snowy Island & frozen pond terrain
    this.terrain = new Terrain(this.scene);

    // 3. Santa's Workshop with interactive lighting
    this.workshop = new Workshop(this.scene);

    // 4. 5 Decorated Christmas Trees with baubles, stars, fairy lights
    this.trees = new ChristmasTrees(this.scene);

    // 5. Presents under all 5 trees
    this.presents = new Presents(this.scene);

    // 6. Iconic striped Candy Cane North Pole marker
    this.northPole = new NorthPoleMarker(this.scene);

    // 7. Falling snow particles
    this.snow = new SnowParticles(this.scene, 3200);
  }

  initPostProcessing() {
    this.postProcess = new PixelPostProcess(this.renderer, this.scene, this.camera);
  }

  initInteractivity() {
    const dom = this.renderer.domElement;

    // Pointer move for hover detection
    dom.addEventListener('pointermove', e => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.checkHover();
    });

    // Click / Pointerdown interaction
    dom.addEventListener('pointerdown', e => {
      // Only handle primary left click
      if (e.button !== 0) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.handleClick();
    });
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Objects to test: workshop windows + presents
    const interactiveObjects = [
      ...this.workshop.windowMeshes,
      ...this.presents.presentMeshes
    ];

    const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
      this.renderer.domElement.style.cursor = 'pointer';
      this.hoveredInteractive = true;
    } else {
      this.renderer.domElement.style.cursor = 'grab';
      this.hoveredInteractive = false;
    }
  }

  handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check workshop windows
    const winIntersects = this.raycaster.intersectObjects(this.workshop.windowMeshes, true);
    if (winIntersects.length > 0) {
      const lightsOn = this.workshop.toggleLights();
      this.showToast(lightsOn ? '💡 Santa\'s Workshop Lights: ON' : '🌙 Santa\'s Workshop Lights: OFF');
      this.updateLightButtonUI(lightsOn);
      return;
    }

    // 2. Check presents under trees
    const presentIntersects = this.raycaster.intersectObjects(this.presents.presentMeshes, true);
    if (presentIntersects.length > 0) {
      const hit = presentIntersects[0].object;
      const parent = hit.userData.parentGroup;
      if (parent) {
        this.presents.bouncePresent(parent);
        this.showToast('🎁 Unwrapping a Christmas gift!');
      }
      return;
    }
  }

  showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  initUI() {
    // 1. Workshop Light Toggle Button
    const lightBtn = document.getElementById('btn-lights');
    if (lightBtn) {
      lightBtn.addEventListener('click', () => {
        const state = this.workshop.toggleLights();
        this.showToast(state ? '💡 Santa\'s Workshop Lights: ON' : '🌙 Santa\'s Workshop Lights: OFF');
        this.updateLightButtonUI(state);
      });
    }

    // 2. Music / Sound Box Toggle
    const musicBtn = document.getElementById('btn-music');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        const playing = toggleMusicBox();
        musicBtn.classList.toggle('active', playing);
        musicBtn.innerHTML = playing ? '🎵 Music: ON' : '🔇 Music: OFF';
        this.showToast(playing ? '🎶 Festive Chiptune Music Box: Playing' : '🔇 Music Box Muted');
      });
    }

    // 3. Pixel Scale / Resolution Selector
    const pixelSelect = document.getElementById('select-pixel');
    if (pixelSelect) {
      pixelSelect.addEventListener('change', e => {
        const val = parseFloat(e.target.value);
        this.postProcess.setPixelSize(val);
        this.showToast(`🎨 Pixel Resolution: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // 4. Retro Dither & Palette Quantization Toggle
    const paletteBtn = document.getElementById('btn-palette');
    if (paletteBtn) {
      paletteBtn.addEventListener('click', () => {
        const active = !this.postProcess.paletteEnabled;
        this.postProcess.setPaletteEnabled(active);
        paletteBtn.classList.toggle('active', active);
        this.showToast(active ? '👾 64-Bit Retro Palette: ACTIVE' : '✨ Smooth Palette: ACTIVE');
      });
    }

    // 5. Camera View Presets
    const presetButtons = {
      'btn-cam-overview': { pos: new THREE.Vector3(16, 12, 22), look: new THREE.Vector3(0, 2.5, 0) },
      'btn-cam-workshop': { pos: new THREE.Vector3(0, 4.5, 12), look: new THREE.Vector3(0, 2.8, 0) },
      'btn-cam-northpole': { pos: new THREE.Vector3(10.0, 5.0, 4.5), look: new THREE.Vector3(5, 4.0, -0.5) },
      'btn-cam-tree': { pos: new THREE.Vector3(-4.5, 4.2, 10.5), look: new THREE.Vector3(-7.5, 3.2, 4.5) }
    };

    Object.entries(presetButtons).forEach(([id, target]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.controls.setPreset(target.pos, target.look);
          this.showToast(`🎥 Camera: ${btn.textContent.trim()}`);
        });
      }
    });

    // 6. Auto-Rotate Orbit
    const orbitBtn = document.getElementById('btn-orbit');
    if (orbitBtn) {
      orbitBtn.addEventListener('click', () => {
        this.controls.autoRotate = !this.controls.autoRotate;
        orbitBtn.classList.toggle('active', this.controls.autoRotate);
        this.showToast(this.controls.autoRotate ? '🔄 Auto-Orbit: ON' : '⏸ Auto-Orbit: OFF');
      });
    }

    // 7. Mouse Instructions Close & Toggle Button
    const closeHintBtn = document.getElementById('btn-close-hint');
    const toggleHintBtn = document.getElementById('btn-toggle-hint');
    const hintBox = document.getElementById('hud-hint');

    if (closeHintBtn && hintBox) {
      closeHintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hintBox.classList.add('hidden');
        if (toggleHintBtn) toggleHintBtn.classList.remove('active');
        this.showToast('ℹ️ Instructions hidden (click Info to show again)');
      });
    }

    if (toggleHintBtn && hintBox) {
      toggleHintBtn.addEventListener('click', () => {
        const isHidden = hintBox.classList.toggle('hidden');
        toggleHintBtn.classList.toggle('active', !isHidden);
      });
    }
  }

  updateLightButtonUI(isOn) {
    const lightBtn = document.getElementById('btn-lights');
    if (lightBtn) {
      lightBtn.classList.toggle('active', isOn);
      lightBtn.innerHTML = isOn ? '💡 Lights: ON' : '🌙 Lights: OFF';
    }
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.postProcess.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Update Camera controls
    this.controls.update(delta);

    // 2. Update Santa's Workshop (chimney smoke particles)
    this.workshop.update(delta, time);

    // 3. Update Christmas Trees (rotating golden star, twinkling fairy lights)
    this.trees.update(delta, time);

    // 4. Update Presents bounce animation and light shimmer
    this.presents.update(delta, time);

    // 5. Update North Pole marker finial rotation
    this.northPole.update(delta, time);

    // 6. Update Falling Snow particles
    this.snow.update(delta, time);

    // 7. Update Shimmering Stars and Northern Lights
    this.sky.update(delta, time);

    // 8. Render through 64-bit Pixel-Art Post-Processor
    this.postProcess.render();
  }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
  new NorthPoleScene();
});
