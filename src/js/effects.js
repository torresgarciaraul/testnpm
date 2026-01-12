import * as THREE from 'three';

export function initEffects() {
    initHeroParticles();
    initTiltEffect();
}

function initHeroParticles() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Remove existing CSS particles if we are replacing them, or keep them as fallback?
    // Let's clear the container for the Three.js canvas
    container.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles (Petals/Confetti style)
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const rotations = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color('#5c7d62'), // Verde
        new THREE.Color('#cfa670'), // Dorado
        new THREE.Color('#f6f2ec'), // Crema
        new THREE.Color('#ffffff')  // Blanco
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15; // X
        positions[i * 3 + 1] = Math.random() * 10 - 5; // Y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z

        rotations[i * 3] = Math.random() * Math.PI;
        rotations[i * 3 + 1] = Math.random() * Math.PI;
        rotations[i * 3 + 2] = Math.random() * Math.PI;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create random rotations for each particle instancing would be better but keeping simple with points/sprites
    // Actually, to make them look like petals, we need geometry. Let's use PlaneGeometry instanced or simple Points.
    // Points are easiest for performance on mobile.

    const textureLoader = new THREE.TextureLoader();
    // Using a generated round gradient texture or similar would be good, but standard square points are fast.
    // Let's create a circle texture programmatically.
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    const circleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        map: circleTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    // Mouse interaction
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Rotate entire system slowly
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;

        // Gentle falling effect simulation by moving camera or particles
        // Let's wave the particles
        const positions = particles.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            // Waving motion
            positions[i * 3 + 1] -= delta * 0.2; // Fall down

            // Interaction
            positions[i * 3] += (mouseX - positions[i * 3]) * 0.05 * delta;
            positions[i * 3 + 1] += (mouseY - positions[i * 3 + 1]) * 0.05 * delta;

            // Reset if too low
            if (positions[i * 3 + 1] < -5) {
                positions[i * 3 + 1] = 5;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initTiltEffect() {
    const heroImg = document.getElementById('heroImage');
    const container = document.querySelector('.hero-content');
    if (!heroImg || !container) return;

    container.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = container.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        // 3D Tilt
        const rotateX = y * -20; // Max 10 deg
        const rotateY = x * 20;

        heroImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    container.addEventListener('mouseleave', () => {
        heroImg.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
    });

    // Smooth transition style is already in CSS for transform
}
