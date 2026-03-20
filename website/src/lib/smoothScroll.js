const ANCHOR_INTENT_EVENT = 'codecatalysts:anchor-intent';

let activeScrollFrame = null;
let pendingTargetFrame = null;
let activeAnimationToken = 0;
let detachInterrupts = null;

function clearInterrupts() {
  if (detachInterrupts) {
    detachInterrupts();
    detachInterrupts = null;
  }
}

export function cancelSmoothScroll() {
  activeAnimationToken += 1;

  if (activeScrollFrame !== null) {
    window.cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }

  if (pendingTargetFrame !== null) {
    window.cancelAnimationFrame(pendingTargetFrame);
    pendingTargetFrame = null;
  }

  clearInterrupts();
}

function easeInOutCubic(progress) {
  if (progress < 0.5) {
    return 4 * progress * progress * progress;
  }

  return 1 - ((-2 * progress + 2) ** 3) / 2;
}

function getNavOffset() {
  const navElement = document.querySelector('.site-nav');
  const navHeight = navElement?.getBoundingClientRect().height ?? 88;
  return navHeight + 16;
}

function attachInterruptListeners(token) {
  const handleInterrupt = () => {
    if (token === activeAnimationToken) {
      cancelSmoothScroll();
    }
  };

  window.addEventListener('wheel', handleInterrupt, { passive: true });
  window.addEventListener('touchstart', handleInterrupt, { passive: true });
  window.addEventListener('mousedown', handleInterrupt, { passive: true });

  detachInterrupts = () => {
    window.removeEventListener('wheel', handleInterrupt);
    window.removeEventListener('touchstart', handleInterrupt);
    window.removeEventListener('mousedown', handleInterrupt);
  };
}

function animateWindowScroll(top, durationOverride) {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const startTop = window.scrollY;
  const distance = top - startTop;

  if (Math.abs(distance) < 1) {
    window.scrollTo(0, top);
    return;
  }

  if (prefersReducedMotion) {
    window.scrollTo(0, top);
    return;
  }

  cancelSmoothScroll();

  const token = activeAnimationToken;
  const duration = durationOverride ?? Math.min(1600, Math.max(900, Math.abs(distance) * 0.72));
  let startTime = null;

  attachInterruptListeners(token);

  const step = (timestamp) => {
    if (token !== activeAnimationToken) {
      return;
    }

    if (startTime === null) {
      startTime = timestamp;
    }

    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);
    const nextTop = startTop + distance * eased;

    window.scrollTo(0, nextTop);

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(step);
      return;
    }

    activeScrollFrame = null;
    clearInterrupts();
  };

  activeScrollFrame = window.requestAnimationFrame(step);
}

export function scrollToAnchor(href, options = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (href === '#') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    animateWindowScroll(0, options.duration);
    return;
  }

  const targetId = String(href || '').replace(/^#/, '');
  if (!targetId) {
    return;
  }

  cancelSmoothScroll();

  if (options.dispatchIntent !== false) {
    window.dispatchEvent(new CustomEvent(ANCHOR_INTENT_EVENT, { detail: targetId }));
  }

  let attempts = 0;
  const maxAttempts = options.maxAttempts ?? 24;

  const resolveTargetAndScroll = () => {
    const target = document.getElementById(targetId);

    if (!target) {
      attempts += 1;
      if (attempts <= maxAttempts) {
        pendingTargetFrame = window.requestAnimationFrame(resolveTargetAndScroll);
      } else {
        pendingTargetFrame = null;
      }
      return;
    }

    pendingTargetFrame = null;

    const top = Math.max(
      window.scrollY + target.getBoundingClientRect().top - getNavOffset(),
      0
    );

    window.history.replaceState(null, '', href);
    animateWindowScroll(top, options.duration);
  };

  resolveTargetAndScroll();
}
