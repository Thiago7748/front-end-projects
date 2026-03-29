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
      let speed = index === 0 ? 0.4 : 0.6; // Linhas com velocidades levemente diferentes
      let moveDir = index === 0 ? 1 : -1; // Top vai = / Bottom pode começar diferente mas logo ajusta
      
      // Forçar scroll start dependendo da direcao default
      if (index !== 0) {
         // Pequeno delay pra bottom ir pro fim e voltar? Melhor deixar as duas começarem normal mas em velocidades diferentes
         moveDir = 1;
      }
      
      const playAutoScroll = () => {
        // Pausar se o utilizador estiver focando ou interagindo
        if (!isDown && !row.matches(':hover')) {
          row.style.scrollSnapType = 'none'; // Desligar snap enquanto auto-scrolla para nao travar
          row.scrollLeft += (speed * moveDir);
          
          // Reverte direção ao bater nos extremos
          if (row.scrollLeft >= (row.scrollWidth - row.clientWidth - 1)) {
            moveDir = -1;
          } else if (row.scrollLeft <= 0) {
            moveDir = 1;
          }
        }
        window.requestAnimationFrame(playAutoScroll);
      };
      // Inicia auto-scroll
      window.requestAnimationFrame(playAutoScroll);

      row.addEventListener('mousedown', (e) => {
        isDown = true;
        row.classList.add('active');
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
      });
      row.addEventListener('mouseleave', () => {
        isDown = false;
        row.classList.remove('active');
        row.style.scrollSnapType = 'x mandatory'; 
      });
      row.addEventListener('mouseup', () => {
        isDown = false;
        row.classList.remove('active');
        row.style.scrollSnapType = 'x mandatory'; 
      });
      row.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        row.style.scrollSnapType = 'none'; 
        const x = e.pageX - row.offsetLeft;
        const walk = (x - startX) * 2; 
        row.scrollLeft = scrollLeft - walk;
      });
    });
  }

  initDragToScroll();
});
