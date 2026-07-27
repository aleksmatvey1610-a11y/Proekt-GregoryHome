(function () {
  const splash = document.getElementById('splash');
  const themeToggle = document.getElementById('themeToggle');
  const bookingForm = document.getElementById('bookingForm');
  const toast = document.getElementById('toast');
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const header = document.querySelector('.header');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  window.GregoryHomeReveal = revealObserver;

  window.GregoryHomeToast = showToast;

  initSplash();

  if (window.GregoryHomeApartments) {
    window.GregoryHomeApartments.init();
    syncSplashPreview();
  }

  function syncSplashPreview() {
    const thumb = document.getElementById('splashPreviewThumb');
    const splashImg = document.getElementById('splashBedroomImg');
    if (thumb && splashImg && splashImg.src) {
      thumb.src = splashImg.src;
    }
  }

  function initSplash() {
    if (!splash) return;

    const skipSplash = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seenSplash = sessionStorage.getItem('gregory-home-splash-seen');

    if (skipSplash || seenSplash) {
      removeSplash();
      return;
    }

    syncSplashPreview();

    const SPLASH_DURATION = 4000;
    const EXIT_DURATION = 900;

    splash.addEventListener('click', finishSplash);

    setTimeout(finishSplash, SPLASH_DURATION);

    function finishSplash() {
      if (splash.classList.contains('splash--exit')) return;

      splash.classList.add('splash--exit');
      sessionStorage.setItem('gregory-home-splash-seen', '1');

      setTimeout(removeSplash, EXIT_DURATION);
    }

    function removeSplash() {
      document.body.classList.remove('splash-active');
      splash.classList.add('splash--hidden');
      splash.remove();
    }
  }

  const savedTheme = localStorage.getItem('gregory-home-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gregory-home-theme', next);
  });

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  const today = new Date().toISOString().split('T')[0];
  checkinInput.setAttribute('min', today);
  checkoutInput.setAttribute('min', today);

  checkinInput.addEventListener('change', function () {
    checkoutInput.setAttribute('min', this.value);
    if (checkoutInput.value && checkoutInput.value <= this.value) {
      checkoutInput.value = '';
    }
  });

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());

    if (new Date(data.checkout) <= new Date(data.checkin)) {
      showToast('Дата выезда должна быть позже даты заезда');
      return;
    }

    const apartments = window.GregoryHomeApartments
      ? window.GregoryHomeApartments.getApartments()
      : [];
    const selected = apartments.find(function (a) {
      return a.id === data.apartment;
    });

    console.log('Заявка на бронирование:', Object.assign({}, data, {
      apartmentTitle: selected ? selected.title : data.apartment,
    }));

    showToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
    bookingForm.reset();
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }
})();
