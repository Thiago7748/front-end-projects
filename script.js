// ===== CONFIG =====
const CAROUSEL_INTERVAL = 7000; // 7 segundos entre slides

document.addEventListener('DOMContentLoaded', () => {

  // Forçar início no topo da página
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // ===== SPA ROUTER =====
  const navLinks = document.querySelectorAll('.nav-link, .logo, .btn[data-target]');
  const sections = document.querySelectorAll('section');

  function navigateTo(targetId) {
    sections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => {
      if (link.classList.contains('nav-link')) {
        link.classList.remove('active');
      }
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetId && link.classList.contains('nav-link')) {
        link.classList.add('active');
      }
    });

    window.scrollTo(0, 0);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      if (targetId) {
        e.preventDefault();
        navigateTo(targetId);
      }
    });
  });

  // ===== HERO CAROUSEL =====
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let carouselTimer = null;

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }

  function startCarousel() {
    carouselTimer = setInterval(nextSlide, CAROUSEL_INTERVAL);
  }

  // Clique nos dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(carouselTimer);
      goToSlide(parseInt(dot.dataset.slide));
      startCarousel(); // reinicia o timer
    });
  });

  // Inicia o carrossel automático
  if (slides.length > 1) {
    startCarousel();
  }

  // --- Lógica de Arrastar (Drag to Scroll) + Auto-Scroll (Ping-Pong) ---
  function initDragToScroll() {
    const rows = document.querySelectorAll('.gallery-row');
    
    rows.forEach((row, index) => {
      let isDown = false;
      let startX;
      let scrollLeft;
      
      // Auto Scroll Setup (Usando pixels por segundo ao invés de p/ frame para garantir 60fps==120fps)
      let speedPXPerSecond = index === 0 ? 15 : 20; 
      let moveDir = index === 0 ? 1 : -1;
      
      if (index !== 0) {
         moveDir = 1;
      }
      
      let exactScroll = row.scrollLeft; 
      let lastTime = performance.now();
      let pauseUntil = 0; // Proteção essencial para a inércia suave do iOS Safari não brigar com JS

      const playAutoScroll = (currentTime) => {
        if (!currentTime) currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Pausar auto-scroll durante interação ou enquanto o pause de inércia estiver ativo
        if (!isDown && !row.matches(':hover') && !row.matches(':active') && currentTime > pauseUntil) {
          const walk = (speedPXPerSecond * (deltaTime / 1000)) * moveDir;
          exactScroll += walk;
          row.scrollLeft = Math.round(exactScroll);
          
          if (row.scrollLeft >= (row.scrollWidth - row.clientWidth - 1)) {
            moveDir = -1;
            exactScroll = row.scrollLeft;
          } else if (row.scrollLeft <= 0) {
            moveDir = 1;
            exactScroll = 0;
          }
        } else {
          // Mantém sincronizado para evitar "pulo" no momento que o JS retomar controle
          exactScroll = row.scrollLeft;
        }
        window.requestAnimationFrame(playAutoScroll);
      };
      
      window.requestAnimationFrame(playAutoScroll);

      // --- Eventos de Mouse (Desktop) ---
      row.addEventListener('mousedown', (e) => {
        isDown = true;
        row.classList.add('active');
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      });
      row.addEventListener('mouseleave', () => {
        isDown = false;
        row.classList.remove('active');
        exactScroll = row.scrollLeft;
        pauseUntil = performance.now() + 1000; // Desktop precisa de menos tempo de desengate
      });
      row.addEventListener('mouseup', () => {
        isDown = false;
        row.classList.remove('active');
        exactScroll = row.scrollLeft;
        pauseUntil = performance.now() + 1000;
      });
      row.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        const x = e.pageX - row.offsetLeft;
        const walk = (x - startX) * 2; 
        row.scrollLeft = scrollLeft - walk;
        exactScroll = row.scrollLeft;
      });

      // --- Eventos de Touch (Mobile/iOS & Android) ---
      row.addEventListener('touchstart', () => {
        isDown = true;
      }, { passive: true });
      
      row.addEventListener('touchend', () => {
        isDown = false;
        exactScroll = row.scrollLeft;
        // Tempo mágico: Permite o momentum/inércia nativo de iPhones e Androids rolar por ~1.5s antes do JS assumir
        pauseUntil = performance.now() + 1500; 
      });

      row.addEventListener('touchcancel', () => {
        isDown = false;
        exactScroll = row.scrollLeft;
        pauseUntil = performance.now() + 1500;
      });
    });
  }

  initDragToScroll();
});
