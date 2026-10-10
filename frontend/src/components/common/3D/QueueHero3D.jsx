import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const QueueHero3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 6.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for whole 3D interactive assembly
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Holographic Core
    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerSphere);

    // 2. Concentric Holographic Rings (Torus)
    const ring1Geo = new THREE.TorusGeometry(1.6, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.3, 0.025, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    mainGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(3.0, 0.018, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.45 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 2.3;
    mainGroup.add(ring3);

    // 3. Orbiting Queue Nodes / Counters
    const nodeCount = 6;
    const nodes = [];
    const nodeGeometry = new THREE.BoxGeometry(0.24, 0.24, 0.24);

    for (let i = 0; i < nodeCount; i++) {
      const nodeMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xa855f7,
        emissive: i % 2 === 0 ? 0x0284c7 : 0x7e22ce,
        roughness: 0.3,
        metalness: 0.8,
      });
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMat);
      mainGroup.add(nodeMesh);
      nodes.push({
        mesh: nodeMesh,
        speed: 0.015 + (i * 0.005),
        radius: 1.8 + (i * 0.25),
        angle: (i / nodeCount) * Math.PI * 2,
        inclination: (i % 3) * 0.4 - 0.4,
      });
    }

    // 4. Ambient Particle Swarm
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x38bdf8, 3, 20);
    pointLight1.position.set(3, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x818cf8, 2.5, 20);
    pointLight2.position.set(-3, -3, 3);
    scene.add(pointLight2);

    // Mouse Interaction for 3D parallax tilt
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.4;
      targetRotationX = -y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate core
      coreMesh.rotation.x = elapsedTime * 0.3;
      coreMesh.rotation.y = elapsedTime * 0.4;

      // Pulse core scale gently
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.05;
      coreMesh.scale.set(pulse, pulse, pulse);
      innerSphere.scale.set(pulse, pulse, pulse);

      // Rotate rings in opposing directions
      ring1.rotation.z = elapsedTime * 0.25;
      ring2.rotation.z = -elapsedTime * 0.3;
      ring3.rotation.z = elapsedTime * 0.15;

      // Orbit nodes
      nodes.forEach((node) => {
        node.angle += node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = Math.sin(node.angle * 2) * node.inclination;
        node.mesh.rotation.x += 0.02;
        node.mesh.rotation.y += 0.03;
      });

      // Slowly rotate particle field
      particles.rotation.y = elapsedTime * 0.05;

      // Smooth mouse tilt interpolation
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeometry.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] flex items-center justify-center pointer-events-auto">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full min-h-[420px]" />

      {/* Floating 3D Hologram Metric Badge 1 */}
      <div className="absolute top-6 left-2 sm:-left-4 z-10 glass-panel-3d p-3 sm:p-4 border border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-float-3d">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
            3D Sync Active
          </span>
        </div>
        <p className="text-xs font-semibold text-white mt-1">Multi-Counter Mesh</p>
        <p className="text-[10px] text-slate-400 font-mono">0.04s latency • WebSocket</p>
      </div>

      {/* Floating 3D Hologram Metric Badge 2 */}
      <div className="absolute bottom-8 right-2 sm:-right-4 z-10 glass-panel-3d p-3 sm:p-4 border border-indigo-500/30 shadow-2xl backdrop-blur-xl animate-float-3d-slow">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">
            #
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300">A-057</span>
        </div>
        <p className="text-xs font-semibold text-white mt-1">Next Token Called</p>
        <p className="text-[10px] text-emerald-400 font-mono">Counter 3 • Ready</p>
      </div>
    </div>
  );
};

export default QueueHero3D;
