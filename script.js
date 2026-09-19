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
document.querySelectorAll('.feature-card, .reel-rail').forEach(card => {
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

// Gameplay reel
// -----------------------------------------------------------------------------
// Same rules as the hero: nothing is fetched until someone is actually looking,
// only one clip ever decodes at a time, and every fallback (reduced motion, Data
// Saver, refused autoplay, a 404) lands on real gameplay -- a poster -- plus an
// explicit Play. Two <video> elements exist so desktop can buffer the next clip
// under the current one, but only the .is-front element ever plays.
function initGameplayReel() {
    const section = document.querySelector('.reel');
    if (!section) return;
    const stage = section.querySelector('.reel-stage');
    const videos = Array.prototype.slice.call(section.querySelectorAll('.reel-video'));
    const poster = section.querySelector('.reel-poster');
    const toggle = section.querySelector('.reel-toggle');
    const sizeLabel = section.querySelector('.reel-toggle-size');
    const expand = section.querySelector('.reel-expand');
    const status = section.querySelector('.reel-status');
    const rail = section.querySelector('.reel-rail');
    const tabs = Array.prototype.slice.call(section.querySelectorAll('.reel-tab'));
    if (!stage || videos.length !== 2 || !poster || !toggle || !sizeLabel || !expand || !status || !rail || !tabs.length) return;

    const wantsLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || {};
    const frugal = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const canPlay = !!(videos[0].canPlayType && videos[0].canPlayType('video/mp4; codecs="avc1.640028"'));
    // Data Saver gets the small cut on any viewport; only desktop broadband buffers ahead.
    const useMobileCut = narrow || frugal;
    const prefetchAhead = fine && !narrow && !frugal;
    // auto: play on arrival and chain through the five clips while on screen.
    // manual: poster plus an explicit Play, no chaining. A refused autoplay flips to manual.
    let mode = (wantsLessMotion || frugal || !canPlay) ? 'manual' : 'auto';
    if (!canPlay) stage.classList.add('no-video');
    if (frugal) stage.classList.add('is-frugal');

    let current = 0, front = 0, armed = false, inView = false, userPaused = false;
    let cutToken = 0, armTimer = 0, nativeFs = false;
    const warmed = {};
    const noop = () => {};

    const srcFor = (tab) => (useMobileCut && tab.dataset.srcMobile) || tab.dataset.src;
    const mbFor = (tab) => useMobileCut ? tab.dataset.mbMobile : tab.dataset.mb;
    const frontVideo = () => videos[front];
    const attached = (v) => !!v.getAttribute('src');
    const has = (cls) => stage.classList.contains(cls);

    function setLabel() {
        const tab = tabs[current];
        const playing = has('is-playing') && !has('is-paused') && attached(frontVideo());
        const mb = mbFor(tab);
        toggle.setAttribute('aria-label', playing ? 'Pause gameplay reel'
            : 'Play clip: ' + tab.dataset.title + (frugal && mb ? ' (' + mb + ' MB)' : ''));
        sizeLabel.textContent = (frugal && mb) ? '\u2248 ' + mb + ' MB' : '';
    }
    function progress(tab, frac) {
        tab.querySelector('.reel-tab-progress').style.transform = 'scaleX(' + frac + ')';
    }

    // Resolves once the poster has decoded, or after 400ms: a slow poster never holds a cut.
    function showPoster(tab) {
        return new Promise((resolve) => {
            let done = false;
            const finish = () => { if (done) return; done = true; stage.classList.add('has-poster'); resolve(); };
            if (poster.getAttribute('src') !== tab.dataset.poster) poster.src = tab.dataset.poster;
            if (poster.decode) {
                poster.decode().then(finish, finish);
            } else {
                poster.onload = finish;
                poster.onerror = finish;
                if (poster.complete) finish();
            }
            setTimeout(finish, 400);
        });
    }
    function attach(v, i, preload) {
        v.preload = preload || 'auto';
        v.dataset.clip = String(i);
        v.src = srcFor(tabs[i]);
        v.load();
    }
    // Frees the decoder and its buffer; the HTTP cache keeps the bytes for the next lap.
    function release(v) {
        v.pause();
        if (attached(v)) { v.removeAttribute('src'); v.load(); }
        delete v.dataset.clip;
    }
    function toIdle(failed) {
        release(frontVideo());
        stage.classList.remove('is-loading', 'is-playing', 'is-paused', 'is-cutting', 'is-cutting-user');
        stage.classList.add('is-idle');
        if (failed) {
            stage.classList.add('is-error');
            status.textContent = "Couldn't load that clip. Press play to try again.";
        }
        setLabel();
    }
    function tryPlay(v) {
        stage.classList.add('is-loading');
        stage.classList.remove('is-idle', 'is-error');
        status.textContent = '';
        const attempt = v.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch((err) => {
                const name = (err && err.name) || '';
                if (name === 'AbortError') return;                       // a newer cut or a pause interrupted it: expected
                if (name === 'NotSupportedError') { toIdle(true); return; } // the file itself failed to load
                mode = 'manual';                                         // autoplay refused: keep the poster, free the bytes
                toIdle(false);
            });
        }
    }
    function select(i) {
        current = i;
        tabs.forEach((t, k) => {
            const on = k === i;
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
            progress(t, 0);
        });
        stage.setAttribute('aria-labelledby', tabs[i].id);
        // Keep the active tab in view on the phone rail. Only the rail scrolls, never the page.
        if (rail.scrollWidth > rail.clientWidth) {
            const left = tabs[i].offsetLeft - (rail.clientWidth - tabs[i].offsetWidth) / 2;
            if (!wantsLessMotion && 'scrollBehavior' in document.documentElement.style) {
                rail.scrollTo({ left: left, behavior: 'smooth' });
            } else {
                rail.scrollLeft = left;
            }
        }
    }

    // Everything happens under the closed shutter: the old clip is released, the two
    // elements swap roles, the poster and clip are swapped, and the shutter opens on
    // the target's first frame. Only the latest cut is allowed to reopen it.
    function swapNow(i, token) {
        const old = videos[front];
        const next = videos[1 - front];
        release(old);
        front = 1 - front;
        old.classList.remove('is-front');
        next.classList.add('is-front');
        stage.classList.remove('is-playing', 'is-paused', 'is-error', 'is-loading');
        status.textContent = '';
        const ready = showPoster(tabs[i]);
        if (mode === 'auto') {
            userPaused = false;
            if (next.dataset.clip !== String(i)) attach(next, i);
            tryPlay(next);
        } else {
            stage.classList.add('is-idle');
        }
        setLabel();
        ready.then(() => { if (token === cutToken) stage.classList.remove('is-cutting', 'is-cutting-user'); });
    }
    function cutTo(i, byUser) {
        const token = ++cutToken;
        select(i);
        armed = true;
        if (wantsLessMotion) { swapNow(i, token); return; }
        stage.classList.add('is-cutting');
        if (byUser) stage.classList.add('is-cutting-user');
        setTimeout(() => { if (token === cutToken) swapNow(i, token); }, 130);
    }
    // First show: no shutter, the poster is already up and the clip fades in over it.
    function arm() {
        if (armed) return;
        armed = true;
        if (mode === 'auto') { attach(frontVideo(), current); tryPlay(frontVideo()); }
        setLabel();
    }
    function sync() {
        const v = frontVideo();
        if (!attached(v) || has('is-idle')) return;
        if (inView && !document.hidden) {
            if (!userPaused && !v.ended && v.paused) { const p = v.play(); if (p && p.catch) p.catch(noop); }
        } else {
            v.pause();
        }
    }

    videos.forEach((v) => {
        v.addEventListener('playing', () => {
            if (v !== frontVideo()) return;
            stage.classList.add('is-playing');
            stage.classList.remove('is-loading', 'is-paused', 'is-error');
            status.textContent = '';
            setLabel();
            // Warm only the NEXT poster (~60KB) so the coming cut opens on a frame, not on black.
            const n = (current + 1) % tabs.length;
            if (mode === 'auto' && !warmed[n]) { warmed[n] = true; (new Image()).src = tabs[n].dataset.poster; }
        });
        v.addEventListener('timeupdate', () => {
            if (v !== frontVideo() || !v.duration) return;
            progress(tabs[current], v.currentTime / v.duration);
            // Desktop only: buffer the next clip in the standby element. It never plays until it is front.
            const n = (current + 1) % tabs.length;
            const standby = videos[1 - front];
            if (prefetchAhead && mode === 'auto' && !nativeFs && standby.dataset.clip !== String(n)
                && v.currentTime / v.duration > 0.6) {
                attach(standby, n, 'auto');
            }
        });
        v.addEventListener('ended', () => {
            if (v !== frontVideo()) return;
            // Inside the iPhone's native player a cut would dump the viewer back inline; loop in place instead.
            if (nativeFs) { v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(noop); return; }
            if (mode === 'auto') cutTo((current + 1) % tabs.length, false);
            else toIdle(false);
        });
        v.addEventListener('error', () => {
            if (v !== frontVideo() || !attached(v)) return;
            toIdle(true);
        });
        v.addEventListener('webkitbeginfullscreen', () => { nativeFs = true; });
        v.addEventListener('webkitendfullscreen', () => { nativeFs = false; sync(); });
    });

    toggle.addEventListener('click', () => {
        const v = frontVideo();
        // Manual mode, a refusal or an error: this tap is the consent.
        if (has('is-idle') || !attached(v)) {
            armed = true;
            userPaused = false;
            if (v.dataset.clip !== String(current)) attach(v, current);
            tryPlay(v);
            setLabel();
            return;
        }
        if (v.paused) {
            userPaused = false;
            stage.classList.remove('is-paused');
            tryPlay(v);
        } else {
            userPaused = true;
            v.pause();
            stage.classList.add('is-paused');
            stage.classList.remove('is-loading');
        }
        setLabel();
    });

    tabs.forEach((t, i) => {
        t.addEventListener('click', () => {
            const v = frontVideo();
            if (i === current && attached(v) && !v.paused && !has('is-idle')) return;
            cutTo(i, true);
        });
        // Manual activation: arrows and Home/End move focus only, Enter/Space cut via the native click.
        t.addEventListener('keydown', (e) => {
            const target = e.key === 'ArrowRight' ? (i + 1) % tabs.length
                : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length
                : e.key === 'Home' ? 0
                : e.key === 'End' ? tabs.length - 1
                : -1;
            if (target < 0) return;
            e.preventDefault();
            tabs.forEach((x, k) => { x.tabIndex = k === target ? 0 : -1; });
            tabs[target].focus();
        });
    });

    // Fullscreen goes on the stage so the toggle and the cuts keep working; iPhone can only fullscreen the <video>.
    const fsReq = stage.requestFullscreen || stage.webkitRequestFullscreen;
    const iosFs = !fsReq && !!videos[0].webkitEnterFullscreen;
    if (iosFs) stage.classList.add('ios-fs');
    if (!fsReq && !iosFs) stage.classList.add('no-fullscreen');
    expand.addEventListener('click', () => {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            return;
        }
        if (fsReq) { const p = fsReq.call(stage); if (p && p.catch) p.catch(noop); return; }
        const v = frontVideo();
        if (!attached(v)) return;
        const go = () => { try { v.webkitEnterFullscreen(); } catch (e) {} };
        if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
    });
    function onFs() {
        const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
        stage.classList.toggle('is-fullscreen', on);
        expand.setAttribute('aria-label', on ? 'Exit fullscreen' : 'View fullscreen');
    }
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);

    // Boot: tab 1 selected, the idle glyph only in manual mode, nothing fetched yet.
    select(0);
    if (mode === 'manual') stage.classList.add('is-idle');
    setLabel();

    if ('IntersectionObserver' in window) {
        // Warm poster 1 a screen early so the stage is never empty when it arrives. No video bytes.
        const warm = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) { showPoster(tabs[0]); warm.disconnect(); } });
        }, { rootMargin: '300px 0px' });
        warm.observe(stage);
        // Arrival gate: at least half visible for 350ms attaches clip 1, so a smooth-scroll
        // fly-by past the stage costs nothing. Under 15% pauses; back above resumes.
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
                if (!armed && entry.intersectionRatio >= 0.5) {
                    if (!armTimer) armTimer = setTimeout(() => { armTimer = 0; arm(); }, 350);
                } else if (armTimer) {
                    clearTimeout(armTimer);
                    armTimer = 0;
                }
                sync();
            });
        }, { threshold: [0, 0.15, 0.5] }).observe(stage);
    } else {
        showPoster(tabs[0]);
        inView = true;
        arm();
    }
    document.addEventListener('visibilitychange', sync);
}

initGameplayReel();
