/**
 * KeroMega Main Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (navLinks.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // Close menu when clicking link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  // 2. Navbar Scrolled Style
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. ScrollSpy for Active Nav Link
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-links a[href*='${sectionId}']`);

      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetLink.classList.add('active');
        } else {
          targetLink.classList.remove('active');
        }
      }
    });
  });

  // 4. Subtle 3D Card Hover Tilt
  const cards = document.querySelectorAll('.channel-card, .support-card, .about-main-card, .community-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      card.style.transform = `perspective(1000px) rotateX(${-deltaY * 3}deg) rotateY(${deltaX * 3}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 5. Kick Stream Live Status Real-time Checker
  const livePill = document.getElementById('liveStatusPill');
  const liveStatusText = document.getElementById('liveStatusText');
  const navKickText = document.getElementById('navKickText');

  function updateLiveStatusUI(isLive) {
    if (!livePill) return;

    if (isLive) {
      livePill.classList.remove('is-offline');
      livePill.classList.add('is-live');
      if (liveStatusText) liveStatusText.textContent = 'LIVE ON KICK · بث مباشر الآن 🔴';
      if (navKickText) navKickText.textContent = 'شاهد البث الآن 🔥';
      livePill.title = 'اضغط لمشاهدة البث المباشر على Kick';
    } else {
      livePill.classList.remove('is-live');
      livePill.classList.add('is-offline');
      if (liveStatusText) liveStatusText.textContent = 'OFFLINE · ترقبوا البث القادم 💤';
      if (navKickText) navKickText.textContent = 'قناة كيك · KeroMega';
      livePill.title = 'كيرو غير متصل حالياً - اضغط لزيارة القناة';
    }
  }

  // Fetch status.json (updated automatically by GitHub Action)
  function checkKickStatus() {
    fetch('./status.json?_nocache=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('status.json unreachable');
        return res.json();
      })
      .then(data => {
        updateLiveStatusUI(Boolean(data.isLive));
      })
      .catch(err => {
        console.log('Using default offline status:', err);
        updateLiveStatusUI(false);
      });
  }

  checkKickStatus();

  console.log('⚡ KeroMega Official Website Loaded Successfully! Welcome, gamers!');
});
