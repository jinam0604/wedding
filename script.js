/**
 * Original Warm Wedding Invitation
 * Korean Mobile 청첩장 - Script
 * (Original aiWedding-main design, new architecture)
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDateShort(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? 'AM' : 'PM';
    const h12 = hours % 12 || 12;
    const minuteStr = String(minutes).padStart(2, '0');
    return `${year}. ${month}. ${date} ${day} ${period} ${h12}:${minuteStr}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00+09:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'twitter:title', m.title);
    setMeta('name', 'twitter:description', m.description);
    setMeta('name', 'twitter:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtainOverlay');
    if (!curtain) return;

    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      return;
    }

    setTimeout(() => {
      curtain.classList.add('hidden');
    }, 2200);
  }

  /* ═══════════════════════════════════════════
     Petal Animation
     ═══════════════════════════════════════════ */

  function initPetals() {
    function createPetalsContainer() {
      const container = document.createElement('div');
      container.className = 'petals-container';
      document.body.appendChild(container);
      return container;
    }

    function createPetal(container) {
      const petal = document.createElement('div');
      petal.className = 'petal';

      const startX = Math.random() * 100;
      const size = Math.random() * 8 + 8;
      const duration = Math.random() * 4 + 6;
      const delay = Math.random() * 0.5;

      petal.style.left = startX + 'vw';
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.animationDuration = duration + 's';
      petal.style.animationDelay = delay + 's';

      container.appendChild(petal);

      setTimeout(() => {
        petal.remove();
      }, (duration + delay) * 1000 + 100);
    }

    const container = createPetalsContainer();
    let petalCount = 0;
    const maxPetals = 40;

    const interval = setInterval(() => {
      if (petalCount >= maxPetals) {
        clearInterval(interval);
        setTimeout(() => {
          container.remove();
        }, 12000);
        return;
      }
      createPetal(container);
      if (Math.random() > 0.5) createPetal(container);
      petalCount++;
    }, 400);
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    const heroImg = $('#heroImage');
    if (heroImg) heroImg.src = 'images/hero/1.jpg';

    $('#heroDate').textContent = formatDateShort(CONFIG.wedding.date, CONFIG.wedding.time);
    $('#heroNames').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name}`;
    $('#heroVenue').textContent = CONFIG.wedding.venue;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentSpan(name, deceased) {
      return deceased ? `<span class="parent-names deceased">${name}</span>` : `<span class="parent-names">${name}</span>`;
    }

    const parentsHTML = `
      <p class="parent-line">${parentSpan(g.father, g.fatherDeceased)} · ${parentSpan(g.mother, g.motherDeceased)}의 아들 <span class="child-name">${g.name}</span></p>
      <p class="parent-line">${parentSpan(b.father, b.fatherDeceased)} · ${parentSpan(b.mother, b.motherDeceased)}의 딸 <span class="child-name">${b.name}</span></p>
    `;
    $('#heroParents').innerHTML = parentsHTML;

    const heroContainer = $('.hero-image-container');
    if (heroContainer) {
      const setFixedHeight = () => {
        heroContainer.style.height = heroContainer.offsetHeight + 'px';
      };
      if (document.readyState === 'complete') {
        setFixedHeight();
      } else {
        window.addEventListener('load', setFixedHeight);
      }
    }
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        $('#countdown-days').textContent = '0';
        $('#countdown-hours').textContent = '0';
        $('#countdown-minutes').textContent = '0';
        $('#countdown-seconds').textContent = '0';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      $('#countdown-days').textContent = days;
      $('#countdown-hours').textContent = hours;
      $('#countdown-minutes').textContent = minutes;
      $('#countdown-seconds').textContent = seconds;
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Music
     ═══════════════════════════════════════════ */

  function initMusic() {
    const audio = $('#bgMusic');
    const playBtn = $('#musicButton');
    if (!audio || !playBtn) return;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playBtn.classList.add('playing');
      } else {
        audio.pause();
        playBtn.classList.remove('playing');
      }
    });
  }

  /* ═══════════════════════════════════════════
     Story Section (중복 제거 포함)
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    const topContainer = $('#storyPhotos');
    const bottomContainer = $('#storyPhotosBottom');

    // 기존 이미지 초기화 (중복 방지)
    topContainer.innerHTML = '';
    bottomContainer.innerHTML = '';

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story-image-container ' + (i === 0 ? 'fade-in-left' : (i % 2 === 0 ? 'fade-in-left' : 'fade-in-right'));
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(storyImages, i));

      if (i === 0) topContainer.appendChild(div);
      else bottomContainer.appendChild(div);
    });

    observeNewElements();
  }

  /* ═══════════════════════════════════════════
     Gallery Section (중복 제거 포함)
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');

    // 기존 이미지 초기화 (중복 방지)
    grid.innerHTML = '';

    if (galleryImages.length === 0) {
      const section = $('#gallerySection');
      if (section) section.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item scale-in';
      div.style.setProperty('--delay', i);
      div.setAttribute('data-index', i);
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(galleryImages, i));
      grid.appendChild(div);
    });

    $('#totalCount').textContent = galleryImages.length;

    observeNewElements();
  }

  /* ═══════════════════════════════════════════
     Initialize Everything
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initCurtain();
    initPetals();
    initHero();
    initCountdown();
    initMusic();

    const storyImages = await loadImagesFromFolder('story');
    const galleryImages = await loadImagesFromFolder('gallery');

    initStory(storyImages);
    initGallery(galleryImages);
  }

  document.addEventListener('DOMContentLoaded', init);

})();
