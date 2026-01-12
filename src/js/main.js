import { initEffects } from './effects.js';

initEffects();

// Scroll Reveal
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// Magnetic Buttons
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// Init immediately
setTimeout(initScrollReveal, 100);

const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbw6EHGG1htZkSJodEyXEGb0IXKXvpyGmsYqRNPSwqolnhBPG4cT3QfDXWAuqEpAXJzR/exec";
const form = document.getElementById("weddingForm");
const message = document.getElementById("mensaje");
const formFields = ['inputNombre', 'inputTelefono', 'inputAlergias', 'inputCancion'];
let pantallaActual = document.querySelector('.pantalla.activa');
let transicionEnProgreso = false;

window.irA = function (id) {
    if (transicionEnProgreso) return;
    const siguiente = document.getElementById(id);
    if (!siguiente || pantallaActual === siguiente) return;

    transicionEnProgreso = true;

    // Smooth scroll to top before transition
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fluid Parallax Transition
    // 1. Prepare next screen (Enter from Bottom)
    siguiente.classList.add('preparando');

    // 2. Animate Current (Exit to darker background)
    pantallaActual.classList.add('saliendo');
    pantallaActual.classList.remove('activa');

    // Force reflow
    void siguiente.offsetWidth;

    // 3. Trigger Entry
    requestAnimationFrame(() => {
        siguiente.classList.remove('preparando');
        siguiente.classList.add('activa');
    });

    // 4. Cleanup
    setTimeout(() => {
        pantallaActual.classList.remove('saliendo');

        // Update references
        pantallaActual = siguiente;
        transicionEnProgreso = false;

        // Reset scroll position for new page
        window.scrollTo(0, 0);
        if (siguiente.scrollTop) siguiente.scrollTop = 0;

        actualizarProgreso();
        initScrollReveal();
        updateBottomNav(id); // Update the new bottom nav

        // Accessibility focus
        const heading = siguiente.querySelector('h1, h2');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
        }

        // Specific page logic
        if (id === 'p6') {
            message.textContent = "";
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) submitBtn.disabled = false;
            setTimeout(() => cargarDatosGuardados(), 100);
        }
        if (id === 'p8') personalizarGracias();

    }, 1000); // 1s sync with visual.css transition
}

const menuBtn = document.getElementById('menuBtn');
const menuOpciones = document.getElementById('menuOpciones');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const abierto = menuOpciones.style.display === 'flex';
        menuOpciones.style.display = abierto ? 'none' : 'flex';
        menuBtn.setAttribute('aria-expanded', !abierto);
    });
}
if (menuOpciones) {
    menuOpciones.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
            irA(b.dataset.target);
            menuOpciones.style.display = 'none';
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    menuOpciones.addEventListener('keydown', function (e) {
        const buttons = Array.from(menuOpciones.querySelectorAll('button'));
        const currentIndex = buttons.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % buttons.length;
            buttons[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            buttons[prevIndex].focus();
        } else if (e.key === 'Escape') {
            menuOpciones.style.display = 'none';
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.focus();
        }
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpciones.style.display === 'flex') {
        menuOpciones.style.display = 'none';
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
    }
});

const fechaBoda = new Date('2026-06-27T18:00:00');

window.actualizarContador = function () {
    const ahora = new Date();
    const diff = fechaBoda - ahora;
    const container = document.getElementById('countdownContainer');

    if (diff <= 0) {
        if (container) container.innerHTML =
            '<div style="font-size:2rem;color:var(--dorado);animation:pulse 2s ease-in-out infinite">¡Hoy es el gran día! 🎊</div>';
        clearInterval(intervaloContador);
        lanzarConfetti();
        return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    animateNumber('countDays', days);
    animateNumber('countHours', hours);
    animateNumber('countMinutes', minutes);
    animateNumber('countSeconds', seconds);
}

function animateNumber(id, newValue) {
    const element = document.getElementById(id);
    if (!element) return;

    const oldValue = parseInt(element.textContent) || 0;
    if (oldValue !== newValue) {
        element.classList.add('flip');
        setTimeout(() => {
            element.textContent = newValue;
            setTimeout(() => element.classList.remove('flip'), 600);
        }, 300);
    }
}
const intervaloContador = setInterval(actualizarContador, 1000);
actualizarContador();
lanzarConfetti();

function lanzarConfetti() {
    const colors = ['#5c7d62', '#cfa670', '#f6f2ec'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = 'position:fixed;width:10px;height:10px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';left:' + Math.random() * 100 + 'vw;top:-10px;opacity:' + Math.random() + ';transform:rotate(' + Math.random() * 360 + 'deg);animation:fall ' + (2 + Math.random() * 3) + 's linear;pointer-events:none;z-index:9999';
        confetti.setAttribute('aria-hidden', 'true');
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

const inputNombre = document.getElementById('inputNombre');
const inputTelefono = document.getElementById('inputTelefono');
const radioAsistencia = document.querySelectorAll('input[name="asistencia"]');

if (inputNombre) {
    inputNombre.addEventListener('blur', function () {
        const errorMsg = document.getElementById('errorNombre');
        if (this.value.trim().length < 3) {
            this.classList.add('invalid');
            this.classList.remove('valid');
            errorMsg.textContent = 'El nombre debe tener al menos 3 caracteres';
            this.setAttribute('aria-invalid', 'true');
        } else {
            this.classList.remove('invalid');
            this.classList.add('valid');
            errorMsg.textContent = '';
            this.setAttribute('aria-invalid', 'false');
        }
    });
}

if (inputTelefono) {
    inputTelefono.addEventListener('blur', function () {
        const errorMsg = document.getElementById('errorTelefono');
        const pattern = /^[0-9+]{9,15}$/;
        if (!pattern.test(this.value.replace(/\s/g, ''))) {
            this.classList.add('invalid');
            this.classList.remove('valid');
            errorMsg.textContent = 'Formato: 9-15 dígitos (ejemplo: 612345678)';
            this.setAttribute('aria-invalid', 'true');
        } else {
            this.classList.remove('invalid');
            this.classList.add('valid');
            errorMsg.textContent = '';
            this.setAttribute('aria-invalid', 'false');
        }
    });
}

radioAsistencia.forEach(radio => {
    radio.addEventListener('change', function () {
        const errorMsg = document.getElementById('errorAsistencia');
        if (errorMsg) errorMsg.textContent = '';
    });
});

function cargarDatosGuardados() {
    try {
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const savedValue = localStorage.getItem('form_' + fieldId);
            if (savedValue && field) field.value = savedValue;
        });
        const savedAsistencia = localStorage.getItem('form_asistencia');
        if (savedAsistencia) {
            const radio = document.querySelector('input[name="asistencia"][value="' + savedAsistencia + '"]');
            if (radio) radio.checked = true;
        }
    } catch (e) {
        console.log('Error al cargar datos guardados:', e);
    }
}

formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('input', function () {
            try {
                localStorage.setItem('form_' + fieldId, this.value);
            } catch (e) {
                console.log('Error al guardar:', e);
            }
        });
    }
});

radioAsistencia.forEach(radio => {
    radio.addEventListener('change', function () {
        try {
            localStorage.setItem('form_asistencia', this.value);
        } catch (e) {
            console.log('Error al guardar:', e);
        }
    });
});

function limpiarDatosGuardados() {
    try {
        formFields.forEach(fieldId => {
            localStorage.removeItem('form_' + fieldId);
        });
        localStorage.removeItem('form_asistencia');
    } catch (e) {
        console.log('Error al limpiar datos:', e);
    }
}

window.enviarFormulario = async function (e) {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    message.textContent = "Enviando respuesta...";
    message.style.color = "var(--verde)";

    const nombre = inputNombre.value.trim();
    const telefono = inputTelefono.value.trim();

    if (nombre.length < 3) {
        message.textContent = "Por favor, ingresa tu nombre completo";
        message.style.color = "#c62828";
        submitBtn.disabled = false;
        return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    try {
        await fetch(GOOGLE_SHEETS_ENDPOINT, {
            method: "POST",
            mode: 'no-cors',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (data.asistencia === "No") {
            message.innerHTML = "<p>💔 Sentimos que no puedas venir, ¡te mandamos un abrazo enorme!</p>";
        } else {
            message.innerHTML = '<div class="checkmark">✓</div><p>💖 ¡Gracias! Hemos recibido tu confirmación.</p>';
        }
        message.style.color = "var(--verde)";
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        const nombreCompleto = data.nombre || '';
        const primerNombre = nombreCompleto.trim().split(' ')[0];
        if (primerNombre) {
            try {
                localStorage.setItem('nombreInvitado', primerNombre);
            } catch (e) {
                console.log('Error al guardar nombre:', e);
            }
        }

        limpiarDatosGuardados();
        form.reset();
        setTimeout(() => irA('p8'), 2000);
    } catch (error) {
        console.error('Error al enviar:', error);
        message.textContent = "❌ Error al enviar. Inténtalo más tarde.";
        message.style.color = "#c62828";
        submitBtn.disabled = false;
    }
}

// 5. Interactive Leaflet Map


function personalizarGracias() {
    try {
        const nombreInvitado = localStorage.getItem('nombreInvitado');
        if (nombreInvitado) {
            const titulo = document.getElementById('tituloGracias');
            if (titulo) titulo.textContent = '¡Gracias, ' + nombreInvitado + '!';
        }
    } catch (e) {
        console.log('Error al personalizar:', e);
    }
}

window.agregarAlCalendario = function () {
    const titulo = "Boda de Laura y Raúl";
    const descripcion = "¡Nos casamos! Palacete de la Ochava, Valdilecha";
    const ubicacion = "Palacete de la Ochava, Calle Alcalá 65, 28511 Valdilecha, Madrid";
    const inicio = "20260627T160000";
    const fin = "20260628T123000";
    const googleCalUrl = 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(titulo) + '&dates=' + inicio + '/' + fin + '&details=' + encodeURIComponent(descripcion) + '&location=' + encodeURIComponent(ubicacion) + '&sf=true&output=xml';
    const icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Laura & Raúl//Boda//ES\nBEGIN:VEVENT\nUID:' + Date.now() + '@bodalauraraul.com\nDTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z\nDTSTART:' + inicio + '\nDTEND:' + fin + '\nSUMMARY:' + titulo + '\nDESCRIPTION:' + descripcion + '\nLOCATION:' + ubicacion + '\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR';
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isApple) {
        const blob = new Blob([icsContent], {
            type: 'text/calendar;charset=utf-8'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'boda-laura-raul.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } else {
        window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
    }
}

function actualizarProgreso() {
    const pantallas = ['p1', 'p2', 'p3', 'p4', 'pInfo', 'p5', 'p6', 'p8'];
    if (!pantallaActual) return;
    const actual = pantallaActual.id;
    const indice = pantallas.indexOf(actual);
    if (indice < 1) {
        document.getElementById('progressBar').style.width = '0%';
        return;
    }
    const progreso = ((indice + 1) / pantallas.length) * 100;
    document.getElementById('progressBar').style.width = progreso + '%';
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registrado:', registration.scope);
        }).catch(error => {
            console.log('SW no disponible:', error);
        });
    });
}

actualizarProgreso();

const NUMERO_CUENTA_REAL = "ES12 3456 7890 1234 5678";
let cuentaRevelada = false;

window.revelarYCopiar = function () {
    const spanNumero = document.getElementById('numeroCuenta');
    const icono = document.getElementById('iconoCuenta');
    const mensaje = document.getElementById('mensajeCuenta');
    const boton = document.getElementById('copiarCuenta');

    if (!cuentaRevelada) {
        spanNumero.textContent = NUMERO_CUENTA_REAL;
        icono.textContent = '📋';
        boton.setAttribute('aria-label', 'Copiar número de cuenta al portapapeles');
        cuentaRevelada = true;
        mensaje.textContent = 'Haz clic de nuevo para copiar';
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(NUMERO_CUENTA_REAL.replace(/\s/g, '')).then(() => {
            mensaje.textContent = '¡Número copiado al portapapeles! 💛';
            icono.textContent = '✓';
            if (navigator.vibrate) navigator.vibrate(100);
            setTimeout(() => {
                mensaje.textContent = '';
                icono.textContent = '📋';
            }, 3000);
        }).catch(err => {
            console.error('Error al copiar:', err);
            mensaje.textContent = 'Copia manualmente: ' + NUMERO_CUENTA_REAL;
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = NUMERO_CUENTA_REAL.replace(/\s/g, '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            mensaje.textContent = '¡Número copiado! 💛';
            icono.textContent = '✓';
            setTimeout(() => {
                mensaje.textContent = '';
                icono.textContent = '📋';
            }, 3000);
        } catch (err) {
            mensaje.textContent = 'Copia manualmente: ' + NUMERO_CUENTA_REAL;
        }
        document.body.removeChild(textArea);
    }
}

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        themeToggle.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {
            console.log('Error al guardar tema:', e);
        }
    });
}

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

// Swipe Navigation
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;

    // Check if it's mostly vertical or horizontal
    const isHorizontal = Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY);

    const screens = ['p1', 'p2', 'p3', 'p4', 'pInfo', 'p5', 'p6', 'p8'];
    if (!pantallaActual) return;
    const currentIndex = screens.indexOf(pantallaActual.id);
    if (currentIndex === -1) return;

    if (isHorizontal) {
        // ... (Keep existing horizontal logic if desired, or remove if strictly vertical is requested. 
        // User asked for vertical specifically, but keeping horizontal as fallback or additional is often good UX. 
        // However, let's prioritize vertical as requested)
        return;
    }

    // Vertical Swipe Logic
    if (Math.abs(swipeDistanceY) < minSwipeDistance) return;

    // Check scroll position to avoid conflict
    const isAtTop = window.scrollY <= 5;
    const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5;

    if (swipeDistanceY < 0) {
        // Swipe UP (Navigate Next)
        // Only trigger if we are at the bottom of the content OR content fits screen
        if (isAtBottom && currentIndex < screens.length - 1) {
            irA(screens[currentIndex + 1]);
        }
    } else {
        // Swipe DOWN (Navigate Back - "Volver")
        // Only trigger if we are at the top
        if (isAtTop && currentIndex > 0) {
            irA(screens[currentIndex - 1]);
        }
    }
}

// Envelope Logic
const envelopeOverlay = document.getElementById('envelope-overlay');
const waxSeal = document.getElementById('waxSeal');
const envelopeWrapper = document.getElementById('envelopeWrapper');

if (waxSeal && envelopeWrapper && envelopeOverlay) {
    // Check if already seen (optional session storage)
    if (sessionStorage.getItem('envelopeOpened') === 'true') {
        envelopeOverlay.classList.add('hidden');
        envelopeOverlay.style.display = 'none';
    } else {
        waxSeal.addEventListener('click', () => {
            // 1. OPEN (Flap opens UP)
            envelopeWrapper.classList.add('open');
            if (navigator.vibrate) navigator.vibrate(50);

            // 2. PRE-REVEAL HERO (Instant)
            // Ensure ScrollReveal elements are active immediately so there's no blank space
            initScrollReveal();

            // 3. SLIDE DOWN (The Reveal)
            // Start sliding JUST as the flap finishes its momentum (around 400ms it looks "open enough")
            // This creates a continuous flow rather than Open -> Stop -> Slide
            setTimeout(() => {
                envelopeWrapper.classList.add('slide-down');
            }, 500); // 500ms is sweet spot for "alive" feel

            // 4. CLEANUP DOM
            setTimeout(() => {
                envelopeOverlay.classList.add('hidden'); // Ensure it fades if slide didn't hide all
            }, 2000);

            setTimeout(() => {
                envelopeOverlay.style.display = 'none';
                sessionStorage.setItem('envelopeOpened', 'true');
            }, 2500);
        });
    }
} else {
    // If elements missing (e.g. removed), ensure overlay is gone
    if (envelopeOverlay) envelopeOverlay.style.display = 'none';
}

// --- 100/100 FEATURES & RECOVERY ---

// 1. Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            // Start envelope animation hint 
            const wax = document.getElementById('waxSeal');
            if (wax) wax.style.transform = "translate(-50%, -50%) scale(1.1)";
            setTimeout(() => { if (wax) wax.style.transform = "" }, 300);
        }, 800); // Small buffer
    }
});

// 2. Lightbox (Full Screen Zoom)
function initLightbox() {
    // Only target images that make sense (exclude icons, logo if any)
    const images = document.querySelectorAll('.img-container img, .fullscreen');

    // Create overlay if not exists
    let overlay = document.querySelector('.lightbox-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = '<span class="lightbox-close">&times;</span><img class="lightbox-img" src="" alt="Zoom">';
        document.body.appendChild(overlay);
    }

    const imgInOverlay = overlay.querySelector('.lightbox-img');
    const closeBtn = overlay.querySelector('.lightbox-close');

    function closeLightbox() {
        overlay.classList.remove('active');
        setTimeout(() => { if (imgInOverlay) imgInOverlay.src = ''; }, 300);
    }

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (imgInOverlay) imgInOverlay.src = img.src;
            overlay.classList.add('active');
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);
}

// 3. Touch Ripples (Global)
function initRipples() {
    document.addEventListener('click', function (e) {
        // Don't ripple on buttons/interactive sometimes needed, but let's do global for "monolithic" feel
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        document.body.appendChild(ripple);

        const size = 60;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - size / 2) + 'px';
        ripple.style.top = (e.clientY - size / 2) + 'px';

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// 4. Audio Visualizer (Update Icon)
function updateMusicVisualizer(isPlaying) {
    const musicBtn = document.getElementById('btnMusica') || document.getElementById('navMusicHelper');
    // We have two buttons (desktop/mobile maybe?). Let's target both via class or IDs
    const buttons = [document.getElementById('btnMusica'), document.getElementById('navMusicHelper')];

    buttons.forEach(btn => {
        if (!btn) return;

        // Inject bars if missing
        if (!btn.querySelector('.equalizer-bars')) {
            const iconContainer = btn.querySelector('.music-icon') || btn.querySelector('svg');
            if (iconContainer) {
                const bars = document.createElement('div');
                bars.className = 'equalizer-bars';
                bars.innerHTML = '<div class="bar"></div><div class="bar"></div><div class="bar"></div>';
                bars.style.display = 'none';
                // Insert bars, hide icon
                btn.insertBefore(bars, iconContainer);
            }
        }

        const bars = btn.querySelector('.equalizer-bars');
        const icon = btn.querySelector('.music-icon') || btn.querySelector('svg');

        if (isPlaying) {
            btn.classList.add('playing');
            btn.classList.add('active'); // for bottom nav styling
            if (bars) bars.style.display = 'flex';
            if (icon) icon.style.display = 'none';
        } else {
            btn.classList.remove('playing');
            btn.classList.remove('active');
            if (bars) bars.style.display = 'none';
            if (icon) icon.style.display = 'block'; // or flex
        }
    });
}

// Hook into existing music logic
// The existing event listeners on 'musica' (lines 383-389) handle class toggling.
// Let's EXTEND them.
// Hook into existing music logic
const musicPlayer = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');

if (musicPlayer && btnMusica) {
    // Toggle Music on Click
    btnMusica.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (musicPlayer.paused) {
            musicPlayer.play().catch(err => {
                console.error("Play error:", err);
                // Interact with user first usually required, but this is a click handler so it should work
            });
        } else {
            musicPlayer.pause();
        }
    };

    // Update UI on State Change
    musicPlayer.addEventListener('play', () => updateMusicVisualizer(true));
    musicPlayer.addEventListener('pause', () => updateMusicVisualizer(false));
}

// 5. Interactive Leaflet Map
function initMap() {
    const mapElement = document.getElementById('mapa');
    if (!mapElement) return;

    // Wait until visible to render correctly (fix grey box issue)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!mapElement._leaflet_id) { // load once
                    loadMap();
                }
            }
        });
    }, { rootMargin: '200px' });

    observer.observe(document.getElementById('p4'));

    function loadMap() {
        // Valdilecha Coordinates (Palacete de la Ochava Exact)
        const lat = 40.2975;
        const lng = -3.3005;

        const map = L.map('mapa', {
            center: [lat, lng],
            zoom: 16, /* Ampliado/Zoomed in as requested */
            zoomControl: false,
            attributionControl: false,
            dragging: !L.Browser.mobile, // Disable dragging on mobile to prevent scroll trap
            tap: !L.Browser.mobile
        });

        // Custom "Monolithic" Theme (CartoDB Voyager or similar clean style)
        // Using a reliable open tile server. Stamen is gone, CartoDB is good.
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(map);

        // Custom Gold Marker
        const iconHtml = `
            <div style="
                background: #d4af37;
                width: 24px;
                height: 24px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 3px solid white;
            "></div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-pin',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        const marker = L.marker([40.2975, -3.3005], { icon: customIcon }).addTo(map);
        marker.bindPopup("<b>Palacete de la Ochava</b><br>¡Aquí nos casamos!").openPopup();

        // Add zoom control manually at preferred position
        L.control.zoom({ position: 'bottomright' }).addTo(map);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
    initRipples();
    initMap();
});

// Bottom Nav Helper (Refined)
function updateBottomNav(currentId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        const onClick = item.getAttribute('onclick');
        if (onClick && onClick.includes(`'${currentId}'`)) {
            item.classList.add('active');
        }
    });

    // Ensure music button state is correct on page change
    const player = document.getElementById('musica');
    if (player && !player.paused) {
        updateMusicVisualizer(true);
    }
}

window.updateBottomNav = updateBottomNav;
window.lanzarConfetti = lanzarConfetti; // Ensure export
