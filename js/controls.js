import * as THREE from 'three';

/**
 * Robust Mouse & Touch Orbit Camera Controller
 * Provides smooth damping, mouse rotation (left drag), zoom (wheel / pinch),
 * pan (right drag), and polar angle restrictions.
 */
export class SmoothOrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Target point to orbit around
    this.target = new THREE.Vector3(0, 2.0, 0);

    // Spherical coordinates
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.target);
    this.radius = offset.length();
    this.theta = Math.atan2(offset.x, offset.z); // Azimuthal angle
    this.phi = Math.acos(Math.max(0.01, Math.min(1.0, offset.y / this.radius))); // Polar angle

    // Target values for smooth damping
    this.targetRadius = this.radius;
    this.targetTheta = this.theta;
    this.targetPhi = this.phi;
    this.targetLookAt = this.target.clone();

    // Limits
    this.minDistance = 4.0;
    this.maxDistance = 50.0;
    this.minPolarAngle = 0.08; // Don't flip over top
    this.maxPolarAngle = Math.PI / 2.0 - 0.04; // Don't go under ground!

    // Damping & speed
    this.dampingFactor = 0.08;
    this.rotateSpeed = 0.005;
    this.zoomSpeed = 0.0015;
    this.panSpeed = 0.015;
    this.autoRotate = false;
    this.autoRotateSpeed = 0.3; // radians per second

    // State
    this.isDragging = false;
    this.dragMode = 'rotate'; // 'rotate' | 'pan'
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.bindEvents();
  }

  bindEvents() {
    const el = this.domElement;

    el.addEventListener('mousedown', e => {
      this.isDragging = true;
      this.dragMode = (e.button === 2 || e.shiftKey) ? 'pan' : 'rotate';
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', e => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      if (this.dragMode === 'rotate') {
        this.targetTheta -= dx * this.rotateSpeed;
        this.targetPhi -= dy * this.rotateSpeed;
        this.targetPhi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.targetPhi));
      } else if (this.dragMode === 'pan') {
        const factor = this.targetRadius * 0.002;
        const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);

        this.targetLookAt.addScaledVector(right, -dx * factor);
        this.targetLookAt.addScaledVector(up, dy * factor);
      }
    });

    el.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomDelta = e.deltaY * this.zoomSpeed * (this.targetRadius * 0.1);
      this.targetRadius = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetRadius + zoomDelta));
    }, { passive: false });

    // Prevent context menu on right click drag
    el.addEventListener('contextmenu', e => e.preventDefault());

    // Touch support for mobile / touchpads
    let touchStartDist = 0;
    el.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragMode = 'rotate';
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    window.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;

        this.targetTheta -= dx * this.rotateSpeed * 1.5;
        this.targetPhi -= dy * this.rotateSpeed * 1.5;
        this.targetPhi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.targetPhi));
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const pinchDelta = (touchStartDist - dist) * 0.05;
        touchStartDist = dist;
        this.targetRadius = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetRadius + pinchDelta));
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  setPreset(targetPos, lookAtPos) {
    this.targetLookAt.copy(lookAtPos);
    const offset = new THREE.Vector3().subVectors(targetPos, lookAtPos);
    this.targetRadius = offset.length();
    this.targetTheta = Math.atan2(offset.x, offset.z);
    this.targetPhi = Math.acos(Math.max(0.01, Math.min(1.0, offset.y / this.targetRadius)));
  }

  update(delta) {
    if (this.autoRotate && !this.isDragging) {
      this.targetTheta += this.autoRotateSpeed * delta;
    }

    // Interpolate smoothly towards targets
    this.radius += (this.targetRadius - this.radius) * this.dampingFactor;
    this.theta += (this.targetTheta - this.theta) * this.dampingFactor;
    this.phi += (this.targetPhi - this.phi) * this.dampingFactor;
    this.target.lerp(this.targetLookAt, this.dampingFactor);

    // Compute spherical position
    const x = this.target.x + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.radius * Math.cos(this.phi);
    const z = this.target.z + this.radius * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
