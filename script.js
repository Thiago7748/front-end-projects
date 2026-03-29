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
      
      // Auto Scroll Setup
      let speed = index === 0 ? 0.6 : 0.8; // Velocidade ajustada para fluidez
      let moveDir = index === 0 ? 1 : -1;
      
      if (index !== 0) {
         moveDir = 1;
      }
      
      let exactScroll = row.scrollLeft; // Tracker preciso para resolver iOS Safari truncando float

      const playAutoScroll = () => {
        // Pausar auto-scroll durante interação (mouse hover, touch, ou clique ativo)
        if (!isDown && !row.matches(':hover') && !row.matches(':active')) {
          exactScroll += (speed * moveDir);
          row.scrollLeft = Math.round(exactScroll);
          
          // Reverte direção ao bater nos extremos
          // Uma margem segura de 1px ajuda evitar stucks
          if (row.scrollLeft >= (row.scrollWidth - row.clientWidth - 1)) {
            moveDir = -1;
            exactScroll = row.scrollLeft;
          } else if (row.scrollLeft <= 0) {
            moveDir = 1;
            exactScroll = 0;
          }
        } else {
          // Sincronizar watcher interno com o usuário arrastando via scroll nativo/mouse
          exactScroll = row.scrollLeft;
        }
        window.requestAnimationFrame(playAutoScroll);
      };
      
      // Inicia auto-scroll
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
      });
      row.addEventListener('mouseup', () => {
        isDown = false;
        row.classList.remove('active');
        exactScroll = row.scrollLeft;
      });
      row.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        const x = e.pageX - row.offsetLeft;
        const walk = (x - startX) * 2; 
        row.scrollLeft = scrollLeft - walk;
        exactScroll = row.scrollLeft;
      });

      // --- Eventos de Touch (Mobile/iOS) ---
      // Imprescindível para o auto-scroll saber que o usuário está tocando na tela
      row.addEventListener('touchstart', () => {
        isDown = true;
      }, { passive: true });
      
      row.addEventListener('touchend', () => {
        isDown = false;
        exactScroll = row.scrollLeft;
      });
    });
  }

  initDragToScroll();
});
