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
      Story Section (원본 로직 복구)
      ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    const topContainer = $('#storyPhotos');
    const bottomContainer = $('#storyPhotosBottom');

    if (!topContainer || !bottomContainer) return;

    // 로딩 자리 비우기
    topContainer.innerHTML = '';
    bottomContainer.innerHTML = '';

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      // 원본 방식: 0번은 상단, 나머지는 하단 배치
      if (i === 0) {
        div.className = 'story-image-container fade-in-left';
        div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
        div.addEventListener('click', () => openViewer(storyImages, i));
        topContainer.appendChild(div);
      } else {
        // 지그재그 애니메이션 효과
        const animClass = (i % 2 === 0) ? 'fade-in-left' : 'fade-in-right';
        div.className = `story-image-container ${animClass}`;
        div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
        div.addEventListener('click', () => openViewer(storyImages, i));
        bottomContainer.appendChild(div);
      }
    });

    observeNewElements();
  }

  /* ═══════════════════════════════════════════
      Gallery Section (원본 로직 복구)
      ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    if (!grid) return;

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
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openViewer(galleryImages, i));
      grid.appendChild(div);
    });

    $('#totalCount').textContent = galleryImages.length;
    observeNewElements();
  }

  /* ═══════════════════════════════════════════
      Music (에러 방지 처리)
      ═══════════════════════════════════════════ */

  function initMusic() {
    const audio = $('#bgMusic');
    const playBtn = $('#musicButton');
    if (!audio || !playBtn) return;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {}); 
        playBtn.classList.add('playing');
      } else {
        audio.pause();
        playBtn.classList.remove('playing');
      }
    });
  }

  /* ═══════════════════════════════════════════
      Initialize (순서 조정 및 안정화)
      ═══════════════════════════════════════════ */

  async function init() {
    // 1. 기본 메타 및 화면 설정
    try { setMetaTags(); } catch(e) {}
    try { initCurtain(); } catch(e) {}
    try { initHero(); } catch(e) {}
    try { initPetals(); } catch(e) {}

    // 2. 이미지 감지 및 렌더링 (가장 중요)
    const storyImages = await loadImagesFromFolder('story');
    const galleryImages = await loadImagesFromFolder('gallery');
    
    initStory(storyImages);
    initGallery(galleryImages);

    // 3. 기타 기능 (에러가 나도 서로 방해받지 않게 분리)
    try { initCountdown(); } catch(e) {}
    try { initMusic(); } catch(e) {}
    try { initLocation(); } catch(e) {}
    try { initAccounts(); } catch(e) {}
    try { initFooter(); } catch(e) {}
    try { initPhotoViewer(); } catch(e) {}
  }

  // 나머지 기능(initHero, initCountdown, observeNewElements 등)은 기존 원본 코드 유지
  // ... (생략된 기존 원본 함수들) ...

  document.addEventListener('DOMContentLoaded', init);

})();
