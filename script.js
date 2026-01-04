document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Glow Effect
    const cursorGlow = document.querySelector('.cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        cursorGlow.style.left = x + 'px';
        cursorGlow.style.top = y + 'px';
    });

    // Add CSS for cursor glow dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .cursor-glow {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent 70%);
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 9999;
            transition: opacity 0.3s ease;
            mix-blend-mode: screen;
        }
    `;
    document.head.appendChild(style);

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('.stat-card, .service-card, .about-text, .section-header');
    
    // Add initial styles for animation
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    const animationStyle = document.createElement('style');
    animationStyle.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(animationStyle);

    // ------------------------------------------------------------
    // 3D TILT EFFECT FOR CARDS
    // ------------------------------------------------------------
    const tiltCards = document.querySelectorAll('.service-card, .stat-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // Glitch Text Effect (Simple Random Character Swap)
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        const originalText = glitchText.getAttribute('data-text');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*';
        
        let interval = null;

        glitchText.onmouseover = event => {  
            let iteration = 0;
            
            clearInterval(interval);
            
            interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                    .split("")
                    .map((letter, index) => {
                        if(index < iteration) {
                            return originalText[index];
                        }
                    
                        return chars[Math.floor(Math.random() * 26)];
                    })
                    .join("");
                
                if(iteration >= originalText.length){ 
                    clearInterval(interval);
                }
                
                iteration += 1 / 3;
            }, 30);
        }
    }

    // ------------------------------------------------------------
    // THREE.JS SHARP TECH INTERACTIVE BACKGROUND
    // ------------------------------------------------------------
    
    function initThreeJS() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        // Scene Setup
        const scene = new THREE.Scene();
        // Dark fog for depth
        scene.fog = new THREE.FogExp2(0x000000, 0.0015);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 1000;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // GRID / MATRIX SYSTEM
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Structured grid-like random positions
            const x = (Math.random() * 2000) - 1000;
            const y = (Math.random() * 2000) - 1000;
            const z = (Math.random() * 2000) - 1000;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            sizes[i] = Math.random() * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Sharp White Particles
        const material = new THREE.PointsMaterial({
            size: 3,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // CONNECTING LINES (Network Effect)
        // We create a separate set of points that form a "wireframe" feel
        const wireGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(10, 2));
        const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        
        // Create multiple floating geometric shapes
        const shapes = [];
        for(let i=0; i<5; i++) {
            const shape = new THREE.LineSegments(wireGeo, wireMat);
            shape.position.set(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000
            );
            shape.scale.setScalar(Math.random() * 10 + 5);
            scene.add(shape);
            shapes.push(shape);
        }

        // Interaction Variables
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation Loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;

            // Sharp, responsive rotation
            particles.rotation.y += 0.002;
            particles.rotation.x += 0.001;
            
            // Mouse influence is stronger and snappier
            particles.rotation.y += 0.1 * (targetX - particles.rotation.y);
            particles.rotation.x += 0.1 * (targetY - particles.rotation.x);

            // Animate geometric shapes
            shapes.forEach((shape, i) => {
                shape.rotation.x += 0.002 * (i + 1);
                shape.rotation.y += 0.002 * (i + 1);
                // Gentle floating
                shape.position.y += Math.sin(elapsedTime * 0.5 + i) * 0.2;
            });

            renderer.render(scene, camera);
        }

        animate();
    }

    // Check if THREE is loaded
    if (typeof THREE !== 'undefined') {
        initThreeJS();
    } else {
        // Fallback or retry
        window.onload = initThreeJS;
    }
});
