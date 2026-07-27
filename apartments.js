(function () {
  const STORAGE_KEY = 'gregory-home-apartments';
  const SPLASH_IMAGE_KEY = 'gregory-home-splash-image';
  const MAX_APARTMENTS = 20;
  const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

  const DEFAULT_SPLASH_IMAGE =
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=85&auto=format&fit=crop';

  const DEFAULT_APARTMENTS = [
    {
      id: 'apt-1',
      title: 'Студия «Утро»',
      description: 'Светлая студия с панорамным окном, мягким освещением и всем необходимым для комфортного отдыха.',
      details: '1 комната · до 2 гостей · 32 м²',
      price: 'от 3 500 ₽ / ночь',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop',
    },
    {
      id: 'apt-2',
      title: 'Двухкомнатная «Вечер»',
      description: 'Просторная квартира для семьи или компании друзей. Уютная гостиная и отдельная спальня.',
      details: '2 комнаты · до 4 гостей · 58 м²',
      price: 'от 5 200 ₽ / ночь',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop',
    },
    {
      id: 'apt-3',
      title: 'Loft «Панорама»',
      description: 'Стильный loft с высокими потолками, панорамным видом и продуманным зонированием пространства.',
      details: '3 комнаты · до 6 гостей · 85 м²',
      price: 'от 7 800 ₽ / ночь',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop',
    },
  ];

  function generateId() {
    return 'apt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  function getApartments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_APARTMENTS);
      }
    } catch (e) {
      console.warn('Не удалось загрузить квартиры', e);
    }
    return DEFAULT_APARTMENTS.map(function (a) {
      return Object.assign({}, a);
    });
  }

  function saveApartments(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_APARTMENTS)));
    } catch (e) {
      throw new Error(
        'Не удалось сохранить: слишком много данных. Используйте ссылки на фото или уменьшите размер изображений.'
      );
    }
  }

  function getSplashImage() {
    return localStorage.getItem(SPLASH_IMAGE_KEY) || DEFAULT_SPLASH_IMAGE;
  }

  function setSplashImage(url) {
    try {
      if (url) {
        localStorage.setItem(SPLASH_IMAGE_KEY, url);
      } else {
        localStorage.removeItem(SPLASH_IMAGE_KEY);
      }
    } catch (e) {
      throw new Error(
        'Не удалось сохранить фото заставки. Файл слишком большой — используйте ссылку или сожмите изображение.'
      );
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function applySplashImage() {
    const url = getSplashImage();
    const splashImg = document.getElementById('splashBedroomImg');
    const heroImg = document.getElementById('heroBedroomImg');
    const thumb = document.getElementById('splashPreviewThumb');
    if (splashImg) splashImg.src = url;
    if (heroImg) heroImg.src = url;
    if (thumb) thumb.src = url;
  }

  function renderApartments() {
    const grid = document.getElementById('apartmentGrid');
    const select = document.getElementById('apartment');
    const apartments = getApartments();

    if (!grid || !select) return;

    if (apartments.length === 0) {
      grid.innerHTML =
        '<p class="apartments-empty">Квартиры пока не добавлены. Откройте «Управление квартирами» и добавьте первую.</p>';
      select.innerHTML = '<option value="" disabled selected>Нет доступных квартир</option>';
      return;
    }

    grid.innerHTML = apartments
      .map(function (apt, index) {
        return (
          '<article class="apartment-card reveal" data-id="' +
          escapeHtml(apt.id) +
          '" style="transition-delay:' +
          index * 0.1 +
          's">' +
          '<div class="apartment-image">' +
          '<img src="' +
          escapeHtml(apt.image) +
          '" alt="' +
          escapeHtml(apt.title) +
          '" loading="lazy">' +
          '</div>' +
          '<div class="apartment-info">' +
          '<h3>' +
          escapeHtml(apt.title) +
          '</h3>' +
          '<p class="apartment-details">' +
          escapeHtml(apt.details || '') +
          '</p>' +
          '<p class="apartment-description">' +
          escapeHtml(apt.description || '') +
          '</p>' +
          (apt.price
            ? '<span class="apartment-price">' + escapeHtml(apt.price) + '</span>'
            : '') +
          '</div></article>'
        );
      })
      .join('');

    select.innerHTML =
      '<option value="" disabled selected>Выберите квартиру</option>' +
      apartments
        .map(function (apt) {
          return (
            '<option value="' +
            escapeHtml(apt.id) +
            '">' +
            escapeHtml(apt.title) +
            '</option>'
          );
        })
        .join('');

    bindApartmentCards();
    observeNewReveals(grid.querySelectorAll('.reveal'));
  }

  function bindApartmentCards() {
    document.querySelectorAll('.apartment-card').forEach(function (card) {
      card.addEventListener('click', function () {
        const id = card.getAttribute('data-id');
        const select = document.getElementById('apartment');
        if (select && id) {
          select.value = id;
          document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function observeNewReveals(elements) {
    if (!window.GregoryHomeReveal) return;
    elements.forEach(function (el) {
      window.GregoryHomeReveal.observe(el);
    });
  }

  function readImageFile(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Выберите файл изображения'));
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error('Файл больше 15 МБ. Сожмите фото или укажите ссылку.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderAdminList() {
    const list = document.getElementById('adminApartmentList');
    const counter = document.getElementById('adminCounter');
    const apartments = getApartments();

    if (counter) {
      counter.textContent = apartments.length + ' / ' + MAX_APARTMENTS;
    }

    if (!list) return;

    if (apartments.length === 0) {
      list.innerHTML = '<p class="admin-empty">Список пуст. Добавьте первую квартиру.</p>';
      return;
    }

    list.innerHTML = apartments
      .map(function (apt) {
        return (
          '<div class="admin-item" data-id="' +
          escapeHtml(apt.id) +
          '">' +
          '<img class="admin-item-thumb" src="' +
          escapeHtml(apt.image) +
          '" alt="">' +
          '<div class="admin-item-body">' +
          '<strong>' +
          escapeHtml(apt.title) +
          '</strong>' +
          '<p>' +
          escapeHtml(apt.description || '') +
          '</p>' +
          '</div>' +
          '<div class="admin-item-actions">' +
          '<button type="button" class="btn btn-ghost admin-edit" data-id="' +
          escapeHtml(apt.id) +
          '">Изменить</button>' +
          '<button type="button" class="btn btn-danger admin-delete" data-id="' +
          escapeHtml(apt.id) +
          '">Удалить</button>' +
          '</div></div>'
        );
      })
      .join('');

    list.querySelectorAll('.admin-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fillEditForm(btn.getAttribute('data-id'));
      });
    });

    list.querySelectorAll('.admin-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteApartment(btn.getAttribute('data-id'));
      });
    });
  }

  function fillEditForm(id) {
    const apt = getApartments().find(function (a) {
      return a.id === id;
    });
    if (!apt) return;

    document.getElementById('adminEditId').value = apt.id;
    document.getElementById('adminAptTitle').value = apt.title;
    document.getElementById('adminDescription').value = apt.description || '';
    document.getElementById('adminDetails').value = apt.details || '';
    document.getElementById('adminPrice').value = apt.price || '';
    document.getElementById('adminImageUrl').value =
      apt.image.startsWith('data:') ? '' : apt.image;
    document.getElementById('adminImageFile').value = '';
    document.getElementById('adminFormTitle').textContent = 'Редактировать квартиру';
    document.getElementById('adminSubmitBtn').textContent = 'Сохранить изменения';
    document.getElementById('adminCancelEdit').hidden = false;

    const preview = document.getElementById('adminImagePreview');
    preview.src = apt.image;
    preview.hidden = false;

    document.getElementById('adminApartmentForm').scrollIntoView({ behavior: 'smooth' });
  }

  function resetAdminForm() {
    document.getElementById('adminEditId').value = '';
    document.getElementById('adminApartmentForm').reset();
    document.getElementById('adminFormTitle').textContent = 'Добавить квартиру';
    document.getElementById('adminSubmitBtn').textContent = 'Добавить квартиру';
    document.getElementById('adminCancelEdit').hidden = true;
    document.getElementById('adminImagePreview').hidden = true;
  }

  function deleteApartment(id) {
    if (!confirm('Удалить эту квартиру?')) return;
    const list = getApartments().filter(function (a) {
      return a.id !== id;
    });
    saveApartments(list);
    renderApartments();
    renderAdminList();
    window.GregoryHomeToast('Квартира удалена');
  }

  function initAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const openBtn = document.getElementById('openAdmin');
    const openFooterBtn = document.getElementById('openAdminFooter');
    const closeBtn = document.getElementById('closeAdmin');
    const form = document.getElementById('adminApartmentForm');
    const splashForm = document.getElementById('adminSplashForm');
    const cancelEdit = document.getElementById('adminCancelEdit');
    const imageFile = document.getElementById('adminImageFile');
    const imageUrl = document.getElementById('adminImageUrl');
    const preview = document.getElementById('adminImagePreview');
    const splashUrl = document.getElementById('adminSplashUrl');
    const splashFile = document.getElementById('adminSplashFile');
    const splashPreview = document.getElementById('adminSplashPreview');

    if (!panel) return;

    function openPanel() {
      panel.hidden = false;
      document.body.classList.add('admin-open');
      splashUrl.value = getSplashImage().startsWith('data:') ? '' : getSplashImage();
      splashPreview.src = getSplashImage();
      splashPreview.hidden = false;
      renderAdminList();
    }

    function closePanel() {
      panel.hidden = true;
      document.body.classList.remove('admin-open');
      resetAdminForm();
    }

    if (openBtn) openBtn.addEventListener('click', openPanel);
    if (openFooterBtn) openFooterBtn.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    panel.querySelector('.admin-overlay').addEventListener('click', closePanel);

    cancelEdit.addEventListener('click', resetAdminForm);

    imageFile.addEventListener('change', function () {
      const file = imageFile.files[0];
      if (!file) return;
      readImageFile(file)
        .then(function (dataUrl) {
          preview.src = dataUrl;
          preview.hidden = false;
          imageUrl.value = '';
        })
        .catch(function (err) {
          window.GregoryHomeToast(err.message);
          imageFile.value = '';
        });
    });

    imageUrl.addEventListener('input', function () {
      if (imageUrl.value.trim()) {
        preview.src = imageUrl.value.trim();
        preview.hidden = false;
        imageFile.value = '';
      }
    });

    splashFile.addEventListener('change', function () {
      const file = splashFile.files[0];
      if (!file) return;
      readImageFile(file)
        .then(function (dataUrl) {
          splashPreview.src = dataUrl;
          splashPreview.hidden = false;
          splashUrl.value = '';
        })
        .catch(function (err) {
          window.GregoryHomeToast(err.message);
          splashFile.value = '';
        });
    });

    splashUrl.addEventListener('input', function () {
      if (splashUrl.value.trim()) {
        splashPreview.src = splashUrl.value.trim();
        splashPreview.hidden = false;
        splashFile.value = '';
      }
    });

    splashForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let url = splashUrl.value.trim();
      if (!url && splashPreview.src && !splashPreview.hidden) {
        url = splashPreview.src;
      }
      if (!url) {
        window.GregoryHomeToast('Добавьте фото для заставки');
        return;
      }
      try {
        setSplashImage(url);
        applySplashImage();
        window.GregoryHomeToast('Фото заставки обновлено');
      } catch (err) {
        window.GregoryHomeToast(err.message);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const apartments = getApartments();
      const editId = document.getElementById('adminEditId').value;
      const title = document.getElementById('adminAptTitle').value.trim();
      const description = document.getElementById('adminDescription').value.trim();
      const details = document.getElementById('adminDetails').value.trim();
      const price = document.getElementById('adminPrice').value.trim();
      let image = imageUrl.value.trim();

      if (!image && preview.src && !preview.hidden) {
        image = preview.src;
      }

      if (!title || !description || !image) {
        window.GregoryHomeToast('Заполните название, описание и фото');
        return;
      }

      try {
        if (editId) {
          const index = apartments.findIndex(function (a) {
            return a.id === editId;
          });
          if (index !== -1) {
            apartments[index] = Object.assign({}, apartments[index], {
              title: title,
              description: description,
              details: details,
              price: price,
              image: image,
            });
            saveApartments(apartments);
            window.GregoryHomeToast('Квартира обновлена');
          }
        } else {
          if (apartments.length >= MAX_APARTMENTS) {
            window.GregoryHomeToast('Достигнут лимит: ' + MAX_APARTMENTS + ' квартир');
            return;
          }
          apartments.push({
            id: generateId(),
            title: title,
            description: description,
            details: details,
            price: price,
            image: image,
          });
          saveApartments(apartments);
          window.GregoryHomeToast('Квартира добавлена');
        }

        resetAdminForm();
        renderApartments();
        renderAdminList();
      } catch (err) {
        window.GregoryHomeToast(err.message);
      }
    });
  }

  window.GregoryHomeApartments = {
    init: function () {
      applySplashImage();
      renderApartments();
      initAdminPanel();
    },
    getApartments: getApartments,
    getSplashImage: getSplashImage,
  };
})();
