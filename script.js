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
    if (!el) return;
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
    const heroParentsEl = $('#heroParents');
    if (heroParentsEl) heroParentsEl.innerHTML = parentsHTML;

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

      const dEl = $('#countdown-days'), hEl = $('#countdown-hours'), mEl = $('#countdown-minutes'), sEl = $('#countdown-seconds');
      if (!dEl || !hEl || !mEl || !sEl) return;

      if (diff <= 0) {
        dEl.textContent = '0'; hEl.textContent = '0'; mEl.textContent = '0'; sEl.textContent = '0';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      dEl.textContent = days; hEl.textContent = hours; mEl.textContent = minutes; sEl.textContent = seconds;
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
      Calendar (Google Cal & ICS)
      ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    const googleBtn = $('#googleCalBtn');
    if (googleBtn) googleBtn.href = gcalUrl;

    const icsBtn = $('#icsDownloadBtn');
    if (icsBtn) {
      icsBtn.addEventListener('click', () => {
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Wedding//Invitation//KO',
          'BEGIN:VEVENT',
          `DTSTART:${startDate}`,
          `DTEND:${endDate}`,
          `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
          `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
          'DESCRIPTION:결혼식에 초대합니다.',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding.ics';
        a.click();
        URL.revokeObjectURL(url);
        showToast('캘린더 파일이 다운로드됩니다');
      });
    }
  }

  /* ═══════════════════════════════════════════
      Music (새로 추가됨)
      ═══════════════════════════════════════════ */

  function initMusic() {
    const audio = $('#bgMusic');
    const playBtn = $('#musicButton');
    
    // 오디오나 버튼 중 하나라도 없으면 그냥 조용히 넘어갑니다.
    if (!audio || !playBtn) return;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(e => console.warn("자동 재생이 차단되었습니다."));
        playBtn.classList.add('playing');
      } else {
        audio.pause();
        playBtn.classList.remove('playing');
      }
    });
  }

  /* ═══════════════════════════════════════════
      Story Section
      ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    const titleEl = $('#storyTitle'), contentEl = $('#storyContent');
    if (titleEl) titleEl.textContent = CONFIG.story.title;
    if (contentEl) contentEl.textContent = CONFIG.story.content;

    const topContainer = $('#storyPhotos');
    const bottomContainer = $('#storyPhotosBottom');
    if (!topContainer || !bottomContainer) return;

    $$('.loading-placeholder', topContainer).forEach(p => p.remove());
    $$('.loading-placeholder', bottomContainer).forEach(p => p.remove());

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story-image-container fade-in-left';
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(storyImages, i));

      if (i === 0) {
        topContainer.appendChild(div);
      } else {
        div.className = 'story-image-container ' + (i % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
        bottomContainer.appendChild(div);
      }
    });

    observeNewElements();
  }

  /* ═══════════════════════════════════════════
      Gallery Section
      ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    if (!grid) return;

    $$('.loading-placeholder', grid).forEach(p => p.remove());

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

    const totalEl = $('#totalCount');
    if (totalEl) totalEl.textContent = galleryImages.length;

    observeNewElements();
  }

  /* ═══════════════════════════════════════════
      Photo Viewer
      ═══════════════════════════════════════════ */

  let viewerImages = [];
  let viewerIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function openViewer(images, index) {
    viewerImages = images;
    viewerIndex = index;
    showViewerImage();
    const viewer = $('#photoViewer');
    if (viewer) viewer.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeViewer() {
    const viewer = $('#photoViewer');
    if (viewer) viewer.classList.remove('active');
    document.body.classList.remove('no-scroll');
    const img = $('#viewerImage');
    if (img) img.style.transform = '';
  }

  function showViewerImage() {
    const img = $('#viewerImage'), loading = $('#viewerLoading'), cur = $('#currentIndex'), tot = $('#totalCountViewer');
    if (!img || !loading) return;
    
    loading.classList.remove('hidden');
    img.style.opacity = '0';
    img.src = viewerImages[viewerIndex];
    if (cur) cur.textContent = viewerIndex + 1;
    // 갤러리 섹션의 totalCount와 헷갈리지 않게 뷰어 전용 ID 사용 권장
    if (tot) tot.textContent = viewerImages.length; 
  }

  function navigateViewer(direction) {
    const img = $('#viewerImage');
    if (!img) return;
    img.classList.add('fade-out');

    setTimeout(() => {
      if (direction === 'prev') {
        viewerIndex = (viewerIndex - 1 + viewerImages.length) % viewerImages.length;
      } else {
        viewerIndex = (viewerIndex + 1) % viewerImages.length;
      }
      showViewerImage();
      img.classList.remove('fade-out');
    }, 200);
  }

  function initPhotoViewer() {
    const viewer = $('#photoViewer'), vi = $('#viewerImage'), vl = $('#viewerLoading');
    if (!viewer) return;

    const closeBtn = $('#viewerClose'), prevBtn = $('#viewerPrev'), nextBtn = $('#viewerNext');
    if (closeBtn) closeBtn.addEventListener('click', closeViewer);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateViewer('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateViewer('next'));

    if (vi) {
        vi.addEventListener('load', () => { if(vl) vl.classList.add('hidden'); vi.style.opacity = '1'; });
        vi.addEventListener('error', () => { if(vl) vl.classList.add('hidden'); vi.style.opacity = '1'; });
    }

    document.addEventListener('keydown', (e) => {
      if (!viewer.classList.contains('active')) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') navigateViewer('prev');
      if (e.key === 'ArrowRight') navigateViewer('next');
    });

    const content = $('#viewerContent');
    if (content) {
        content.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
        }, { passive: true });

        content.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].clientX;
          const diffX = touchStartX - touchEndX;
          if (Math.abs(diffX) > 50) diffX > 0 ? navigateViewer('next') : navigateViewer('prev');
        });
    }
  }

  /* ═══════════════════════════════════════════
      Location & Accounts & Footer
      ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    const vEl = $('#locationVenue'), aEl = $('#locationAddress'), mEl = $('#locationMapImg');
    if (vEl) vEl.textContent = w.venue;
    if (aEl) aEl.textContent = w.address;
    if (mEl) mEl.src = 'images/location/1.jpg';
    
    const kBtn = $('#kakaoMapBtn'), nBtn = $('#naverMapBtn');
    if (kBtn) kBtn.href = w.mapLinks.kakao || '#';
    if (nBtn) nBtn.href = w.mapLinks.naver || '#';

    const copyBtn = $('#copyAddressBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(w.address, '주소가 복사되었습니다'));
  }

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    if (!container) return;
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      const accountStr = `${acc.bank} ${acc.number}`;
      item.innerHTML = `<p class="account-role">${acc.role}</p><p class="account-info">${accountStr}</p><button class="copy-btn" data-account="${accountStr}">복사</button>`;
      container.appendChild(item);
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');
    $$('.accordion-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('active')));
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item .copy-btn');
      if (btn) copyToClipboard(btn.dataset.account, '계좌번호가 복사되었습니다');
    });
  }

  function initFooter() {
    const dt = getWeddingDateTime();
    const fText = $('#footerText');
    if (fText) fText.textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
  }

  /* ═══════════════════════════════════════════
      Scroll Animations
      ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const animTargets = ['.story-text', '.gallery-title', '.gallery-subtitle', '.location-title', '.location-info', '.location-map-container', '.account-title', '.account-subtitle'];
    animTargets.forEach(sel => {
        const el = $(sel);
        if (el) el.classList.add(sel.includes('story') ? 'fade-in-right' : (sel.includes('map') ? 'scale-in' : 'fade-in'));
    });

    $$('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => scrollObserver.observe(el));
  }

  function observeNewElements() {
    if (!scrollObserver) return;
    $$('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
      if (!el.classList.contains('visible')) scrollObserver.observe(el);
    });
  }

  function showLoadingPlaceholders() {
    const html = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';
    const sP = $('#storyPhotos'), gG = $('#galleryGrid');
    if (sP) sP.innerHTML = html;
    if (gG) gG.innerHTML = html;
  }

  /* ═══════════════════════════════════════════
      실행 (Init) - 핵심 안정성 확보
      ═══════════════════════════════════════════ */

  async function init() {
    // 1. 기초 설정 (에러나도 진행)
    try { setMetaTags(); } catch(e) {}
    try { initCurtain(); } catch(e) {}
    try { initHero(); } catch(e) {}
    try { initCountdown(); } catch(e) {}
    try { initCalendar(); } catch(e) {}
    
    // 2. 비이미지 섹션 초기화
    initPhotoViewer();
    initLocation();
    initAccounts();
    initFooter();
    initScrollAnimations();
    initPetals();
    
    // 3. 음악 로직 (안전 장치: 버튼 없어도 사진 로직 방해 안 함)
    try { initMusic(); } catch(e) { console.warn("Music init failed", e); }

    // 4. 사진 로딩 (가장 중요)
    showLoadingPlaceholders();
    const [storyImages, galleryImages] = await Promise.all([
      loadImagesFromFolder('story'),
      loadImagesFromFolder('gallery')
    ]);

    initStory(storyImages);
    initGallery(galleryImages);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
