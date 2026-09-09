// Starfield Background Animation
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Generate stars
const stars = [];
const starCount = 200;

for (let i = 0; i < starCount; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.005
    });
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        // Twinkling effect
        star.opacity += (Math.random() - 0.5) * star.twinkleSpeed;
        star.opacity = Math.max(0.2, Math.min(1, star.opacity));
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Occasional shooting stars
        if (Math.random() > 0.998) {
            ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x + 50, star.y - 50);
            ctx.stroke();
        }
    });
}

function animateStars() {
    drawStars();
    requestAnimationFrame(animateStars);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start animation
animateStars();

// Smooth scroll to sections
function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Email form submission
function handleEmailSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    // Here you would typically send the email to a backend service
    console.log('Email submitted:', email);
    
    // Show confirmation message
    const originalText = form.querySelector('button').textContent;
    form.querySelector('button').textContent = '✓ Thanks for signing up!';
    form.querySelector('button').style.background = 'linear-gradient(135deg, #00d9ff, #7c3aed)';
    
    // Reset form
    form.reset();
    
    // Reset button after 2 seconds
    setTimeout(() => {
        form.querySelector('button').textContent = originalText;
        form.querySelector('button').style.background = '';
    }, 2000);
}

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// Add glitch effect periodically
setInterval(() => {
    const h1 = document.querySelector('h1.glitch');
    if (h1 && Math.random() > 0.95) {
        h1.style.textShadow = '2px 2px 8px rgba(0, 217, 255, 0.5), -2px -2px 8px rgba(255, 0, 110, 0.5)';
        setTimeout(() => {
            h1.style.textShadow = '';
        }, 100);
    }
}, 100);

// Add keyboard shortcuts hint (optional)
document.addEventListener('keydown', (e) => {
    if (e.key === '?') {
        alert('Starsunder Coming Soon!\n\nNavigate with smooth scrolling or click the buttons above.\nPress "?" anytime to see this message.');
    }
});

// Hero gameplay loop
// -----------------------------------------------------------------------------
// The clip is attached from JS rather than left in the markup so that it is never
// downloaded on the devices that will not show it. A <video> with a src is fetched
// even when CSS hides it, so `display: none` alone would still cost phones ~600KB.
// If anything here bails out, the hero keeps its static cover image unchanged.
// Three gameplay frames standing in for the clip. ~112KB for all three against
// the clip's 420-614KB, so this stays honest on a metered connection. Nothing is
// fetched until this runs -- the <img> tags carry data-src, not src.
function showHeroStills(hero, rotate) {
    const stills = hero.querySelector('.hero-stills');
    if (!stills) return;

    const frames = Array.prototype.slice.call(stills.querySelectorAll('.hero-still'));
    if (!frames.length) return;

    if (!rotate) stills.classList.add('is-static');

    // Reveal only once the first frame has decoded, the same rule the clip
    // follows -- otherwise the cover art crossfades out to nothing.
    const reveal = () => hero.classList.add('has-stills');
    frames.forEach((img) => { if (img.dataset.src) img.src = img.dataset.src; });

    if (frames[0].complete) {
        reveal();
    } else {
        frames[0].addEventListener('load', reveal, { once: true });
        frames[0].addEventListener('error', () => {}, { once: true });
    }
}

function initHeroVideo() {
    const video = document.querySelector('.hero-video');
    const hero = document.querySelector('.hero');
    if (!video || !hero || !video.dataset.src) return;

    const wantsLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || {};
    const frugal = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

    // Both of these deliberately skip the clip -- but skipping it should not mean
    // falling back to generic cover art. Show real gameplay either way: rotating
    // for Data Saver (which asked for fewer bytes, not less motion), and holding
    // on one frame for reduced motion (which asked for the opposite).
    if (wantsLessMotion) {
        showHeroStills(hero, false);
        return;
    }

    if (frugal) {
        showHeroStills(hero, true);
        return;
    }

    // Crossfade the still out only once frames are actually on screen, so a refused
    // autoplay or a stalled download never leaves the hero empty.
    video.addEventListener('playing', () => hero.classList.add('has-video'), { once: true });

    // Phones get a centre-cropped 560x414 cut of the same clip. The wide one is a
    // 2.47:1 frame: in a portrait hero `cover` would keep ~18% of its width (murk,
    // not gameplay) and showing it whole puts the game's touch sticks on screen as
    // grey blobs. The narrow cut is the widest crop that excludes them, it fills
    // far more of the hero, and it is 420KB against 614KB.
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    video.src = (narrow && video.dataset.srcNarrow) ? video.dataset.srcNarrow : video.dataset.src;
    video.load();

    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {
            // Autoplay refused - drop back to the cover image and free the bytes.
            hero.classList.remove('has-video');
            video.removeAttribute('src');
            video.load();
        });
    }

    // Don't decode video for a hero nobody is looking at.
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!video.src) return;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.05 }).observe(hero);
    }
}

initHeroVideo();
