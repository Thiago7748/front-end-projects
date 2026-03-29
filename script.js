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
      let isHovered = false; 
      let startX;
      let scrollLeft;
      
      // Setup de Velocidade Uniforme e Suave (Aumentado base para nao dar impressao de 'carroça/demora')
      let speedPXPerSecond = index === 0 ? 30 : 35; 
      let moveDir = 1; // As duas começam fluindo p/ direita para n buggar o limite inicial (scrollLeft = 0)
      
      let exactScroll = 0; 
      let lastTime = null;
      let pauseUntil = 0; 

      const playAutoScroll = (currentTime) => {
        if (!lastTime) lastTime = currentTime;
        let deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Impede pulos monstruosos se a tab ficar em background (max 50ms = 20fps cap p/ calculo)
        if (deltaTime > 50) deltaTime = 50; 

        // Se está livre (sem toque, mouse ou inércia pendente)
        if (!isDown && !isHovered && currentTime > pauseUntil) {
          const walk = (speedPXPerSecond * (deltaTime / 1000)) * moveDir;
          exactScroll += walk;
          
          // Omitindo Math.round! Chrome renderiza sub-pixels (suavidade impecável). 
          // iOS visualmente descarta mas o "exactScroll" não perde nada!
          row.scrollLeft = exactScroll; 
          
          // Bounce (com margem de 1.5px de proteção p/ evitar travamento)
          if (row.scrollLeft >= (row.scrollWidth - row.clientWidth - 1.5)) {
            moveDir = -1;
            exactScroll = row.scrollLeft;
          } else if (row.scrollLeft <= 0) {
            moveDir = 1;
            exactScroll = 0;
          }
        } else {
          // Mantém perfeitamente equalizado pro JS nao tentar voltar a imagens anteriores quando o usuario soltar
          exactScroll = row.scrollLeft;
        }
        window.requestAnimationFrame(playAutoScroll);
      };
      
      window.requestAnimationFrame(playAutoScroll);

      // --- Eventos Híbridos (Mouses reias no Desktop evitam conflitos do Safari) ---
      // IMPORTANTE: pointerenter só define hover se for mouse fisicamente, o Safari simula mouse ao tocar, isso ignora.
      row.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') isHovered = true;
      });
      row.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') isHovered = false;
        isDown = false;
        row.classList.remove('active');
        pauseUntil = performance.now() + 1000;
      });

      // --- Eventos de Interação Mista ---
      row.addEventListener('pointerdown', (e) => {
        isDown = true;
        row.classList.add('active');
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      });
      row.addEventListener('pointerup', () => {
        isDown = false;
        row.classList.remove('active');
        pauseUntil = performance.now() + 1500; // Tempo de inércia para todas as plataformas
      });
      row.addEventListener('pointercancel', () => {
        isDown = false;
        row.classList.remove('active');
        pauseUntil = performance.now() + 1500;
      });
      row.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        // Evitar prevenir default em touch, senao bloqueia zoom/scroll de aba? Nao, pointermove p/ drag e safe
        if (e.pointerType === 'mouse') e.preventDefault(); 
        
        const x = e.pageX - row.offsetLeft;
        const walk = (x - startX) * 2; 
        row.scrollLeft = scrollLeft - walk;
        exactScroll = row.scrollLeft;
      });

      // --- Eventos de Touch dedicados apenas para segurança do pause de inércia Apple ---
      row.addEventListener('touchstart', () => { isDown = true; }, { passive: true });
    });
  }

  initDragToScroll();
});
