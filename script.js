(function () {
  const themeToggle = document.getElementById('themeToggle');
  const bookingForm = document.getElementById('bookingForm');
  const toast = document.getElementById('toast');
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const header = document.querySelector('.header');

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

  const revealElements = document.querySelectorAll('.reveal');
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

  revealElements.forEach(function (el) {
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

    console.log('Заявка на бронирование:', data);
    showToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
    bookingForm.reset();
  });

  document.querySelectorAll('.apartment-card').forEach(function (card, index) {
    card.addEventListener('click', function () {
      const select = document.getElementById('apartment');
      const options = ['studio', 'two-room', 'loft'];
      select.value = options[index];
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }
})();
