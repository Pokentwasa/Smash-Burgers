(function () {
  'use strict';

  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // ===== THREE.JS SCENE =====
  const canvas = document.getElementById('webgl');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a1a1a, 0.04);
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const rim = new THREE.DirectionalLight(0xe8ff00, 1.2);
  rim.position.set(3, 2, -1);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xff3b30, 0.6);
  fill.position.set(-3, -1, 3);
  scene.add(fill);

  // Fluid blob — icosahedron with displaced vertices
  const blobGeo = new THREE.IcosahedronGeometry(1.8, 5);
  const blobMat = new THREE.MeshStandardMaterial({ color: 0xe8ff00, metalness: 0.4, roughness: 0.3, flatShading: false });
  const blob = new THREE.Mesh(blobGeo, blobMat);
  blob.position.set(2.5, 0, 0);
  scene.add(blob);

  const origPositions = blobGeo.attributes.position.array.slice();

  // Secondary blob
  const blob2Geo = new THREE.IcosahedronGeometry(0.9, 4);
  const blob2Mat = new THREE.MeshStandardMaterial({ color: 0xff3b30, metalness: 0.5, roughness: 0.25 });
  const blob2 = new THREE.Mesh(blob2Geo, blob2Mat);
  blob2.position.set(-3, -2, -1);
  scene.add(blob2);

  // Particles
  const pCount = 300;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) { pPositions[i*3] = (Math.random()-0.5)*20; pPositions[i*3+1] = (Math.random()-0.5)*20; pPositions[i*3+2] = (Math.random()-0.5)*15; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xe8ff00, size: 0.04, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(pGeo, pMat));

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animate
  const clock = new THREE.Clock();
  let scrollSpeed = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Deform blob vertices
    const pos = blobGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = origPositions[i], oy = origPositions[i+1], oz = origPositions[i+2];
      const noise = Math.sin(ox * 2.5 + t * 1.2 + scrollSpeed) * Math.cos(oy * 2.5 + t * 0.8) * 0.18;
      const mouseInfluence = Math.sin(ox * 3 + mouse.x * 2) * Math.cos(oy * 3 + mouse.y * 2) * 0.08;
      pos[i] = ox + (noise + mouseInfluence) * ox * 0.15;
      pos[i+1] = oy + (noise + mouseInfluence) * oy * 0.15;
      pos[i+2] = oz + noise * oz * 0.1;
    }
    blobGeo.attributes.position.needsUpdate = true;

    blob.rotation.y = t * 0.12;
    blob.rotation.x = t * 0.06;
    blob2.rotation.y = t * 0.2;
    blob2.rotation.z = t * 0.15;

    // Mouse parallax
    blob.position.x = 2.5 + mouse.x * 0.5;
    blob.position.y = mouse.y * 0.3;

    scrollSpeed *= 0.95;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('scroll', () => { scrollSpeed += 0.3; });

  // ===== GSAP =====
  window.addEventListener('load', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero text reveal
    document.querySelectorAll('.hero .split-text .word').forEach((w, i) => {
      gsap.to(w, { y: 0, opacity: 1, duration: 0.8, delay: 0.3 + i * 0.1, ease: 'power3.out' });
    });

    // Section text reveals
    document.querySelectorAll('section:not(.hero) .split-text .word').forEach((w) => {
      gsap.to(w, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: w.closest('.split-text'), start: 'top 85%' } });
    });

    // Fade-in elements
    document.querySelectorAll('.fade-in').forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // Camera transitions
    gsap.to(camera.position, { y: -1.5, x: -0.5, z: 5, scrollTrigger: { trigger: '[data-section="menu"]', start: 'top bottom', end: 'top top', scrub: 1.5 } });
    gsap.to(camera.position, { y: -3, x: 1, z: 7, scrollTrigger: { trigger: '[data-section="about"]', start: 'top bottom', end: 'center center', scrub: 1.5 } });
    gsap.to(camera.position, { y: -4.5, z: 4, scrollTrigger: { trigger: '[data-section="location"]', start: 'top bottom', end: 'top top', scrub: 1.5 } });

    // Count-up stats
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count);
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => {
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / 1200, 1);
          el.textContent = Math.round((1 - Math.pow(1-p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }});
    });
  });
})();
