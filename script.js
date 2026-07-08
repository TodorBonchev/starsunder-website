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
