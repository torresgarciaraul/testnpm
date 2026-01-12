import * as THREE from 'three';

export function initEffects() {
    initDreamyField();
    initGlobalTilt();
}

// Advanced 3D Background: A "Dreamy Field" of floating particles that react to cursor
function initDreamyField() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    container.innerHTML = '';

    const scene = new THREE.Scene();
    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0xfdfbf7, 0.05);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create Particles (Soft Circles)
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3); // Store origin for rubber-banding
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
        new THREE.Color('#5c7d62'), // Verde
        new THREE.Color('#8fa693'), // Verde claro
        new THREE.Color('#d4af37'), // Dorado
        new THREE.Color('#ffffff')  // Blanco
    ];

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 20;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        originalPositions[i * 3] = x;
        originalPositions[i * 3 + 1] = y;
        originalPositions[i * 3 + 2] = z;

        sizes[i] = Math.random() * 0.5 + 0.1;
        speeds[i] = Math.random() * 0.2 + 0.1;

        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Shader Material for "Soft Glow"
    const textureLoader = new THREE.TextureLoader();
    // Generate simple soft circle data URI
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const startTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.5,
        map: startTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    // Track mouse in normalized coordinates AND world space approximation
    document.addEventListener('mousemove', (e) => {
        // -1 to 1 normal
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = -(e.clientY / window.innerHeight) * 2 + 1;

        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Device Orientation for mobile parallax
    window.addEventListener('deviceorientation', (e) => {
        if (e.beta && e.gamma) {
            // Map tilt to similar range as mouse
            targetX = Math.min(Math.max(e.gamma / 20, -1), 1);
            targetY = Math.min(Math.max(e.beta / 20 - 1, -1), 1);
        }
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // 1. Gently rotate entire cloud
        particles.rotation.y = time * 0.05;

        // 2. Interactive ripples
        const positions = particles.geometry.attributes.position.array;

        // Improve interaction: Mouse creates a "repel" or "attract" force? 
        // Let's do a gentle "flow" where particles move away from cursor (Magic Dust)

        // We need to unproject mouse to world Z roughly. 
        // Simpler: Just shift positions based on targetX/Y (Parallax)
        particles.rotation.x += (targetY * 0.2 - particles.rotation.x) * 0.05;
        particles.rotation.y += (targetX * 0.2 - particles.rotation.y) * 0.05;

        // Animate individual particles (float up/down)
        for (let i = 0; i < particleCount; i++) {
            // Bobbing
            positions[i * 3 + 1] = originalPositions[i * 3 + 1] + Math.sin(time + originalPositions[i * 3]) * 0.5;
        }

        particles.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }
    animate();

    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Apply 3D Tilt to ALL Glass Cards (Monolithic Feel)
function initGlobalTilt() {
    const cards = document.querySelectorAll('.info-card, .timeline-content, .hero-img, .countdown-box, .radio-tile');

    if (!cards.length) return;

    // Helper to apply tilt
    const handleMove = (e, el) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Limit rotation to small angles for elegance
        const rotateX = ((y - centerY) / centerY) * -5; // Max -5 to 5 deg
        const rotateY = ((x - centerX) / centerX) * 5;

        // Add glare effect if we wanted, but simple tilt is cleaner
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleLeave = (el) => {
        el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`; // Return to base
    };

    // Attach listeners
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => handleMove(e, card));
        card.addEventListener('mouseleave', () => handleLeave(card));
        // Add transition for smoothness
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease'; // Fast transform for responsiveness
    });
}
