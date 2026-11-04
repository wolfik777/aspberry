(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const toast = document.querySelector('#toast');
  let toastTimer;
  let audio;
  let soundEnabled = false;

  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('shown');
    toastTimer = setTimeout(() => toast.classList.remove('shown'), 2600);
  }

  function chime() {
    if (!soundEnabled || !audio) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audio.currentTime + .08);
    volume.gain.setValueAtTime(.0001, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(.025, audio.currentTime + .012);
    volume.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .18);
    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .2);
    oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
  }

  const sound = document.querySelector('.sound');
  if (window.AudioContext || window.webkitAudioContext) {
    sound.hidden = false;
    sound.addEventListener('click', () => {
      try {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        soundEnabled = !soundEnabled;
        sound.setAttribute('aria-pressed', String(soundEnabled));
        sound.setAttribute('aria-label', soundEnabled ? sound.dataset.on : sound.dataset.off);
        if (soundEnabled) chime();
      } catch {
        soundEnabled = false;
        sound.setAttribute('aria-pressed', 'false');
        sound.setAttribute('aria-label', sound.dataset.off);
      }
    });
  }

  document.addEventListener('click', event => {
    const action = event.target.closest('button, a, summary');
    if (!action) return;
    if (action !== sound) chime();
    if (reduceMotion.matches || event.detail === 0) return;
    const star = document.createElement('span');
    star.className = 'sparkle';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = '✧';
    star.style.left = event.clientX - 9 + 'px';
    star.style.top = event.clientY - 12 + 'px';
    star.style.setProperty('--drift', '13px');
    document.body.append(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
    setTimeout(() => star.remove(), 900);
  });

  const dialog = document.querySelector('#photo-dialog');
  const openPhoto = document.querySelector('.photo-open');
  const closePhoto = dialog.querySelector('.close-dialog');
  if (typeof dialog.showModal === 'function') {
    openPhoto.addEventListener('click', event => {
      event.preventDefault();
      dialog.showModal();
      dialog.classList.add('photo-reveal');
      document.body.style.overflow = 'hidden';
      closePhoto.focus();
    });
    closePhoto.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      dialog.classList.remove('photo-reveal');
      openPhoto.focus();
    });
  }

  const commandButtons = Array.from(document.querySelectorAll('[data-command]'));
  const selectedCommand = document.querySelector('#selected-command');
  const description = document.querySelector('#command-description');
  const copyButton = document.querySelector('.copy-command');
  document.querySelector('.command-tabs').hidden = false;
  copyButton.hidden = false;
  commandButtons.forEach(button => {
    button.addEventListener('click', () => {
      commandButtons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      selectedCommand.textContent = button.dataset.command;
      description.textContent = button.dataset.description;
      if (!reduceMotion.matches) description.animate([{ opacity: .25, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
    });
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(selectedCommand.textContent);
      notify(copyButton.dataset.copied + ' · ' + selectedCommand.textContent);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(selectedCommand);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* The text stays selected for manual copying. */ }
      notify(copied ? copyButton.dataset.copied + ' · ' + selectedCommand.textContent : copyButton.dataset.failure);
    }
  });

  const sheet = document.querySelector('[data-tilt]');
  let frame;
  sheet.addEventListener('pointermove', event => {
    if (reduceMotion.matches || !finePointer.matches) return;
    const bounds = sheet.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      sheet.style.transform = 'rotate(1deg) rotateY(' + x * 5 + 'deg) rotateX(' + -y * 4 + 'deg)';
    });
  });
  sheet.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    sheet.style.transform = '';
  });
  if (!reduceMotion.matches) {
    document.querySelectorAll('.hero-copy, .cover').forEach(element => element.classList.add('entrance'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible-enter');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.story-grid, .replay, .games-grid, .chat-grid, .farewell').forEach(element => observer.observe(element));
  }
})();
