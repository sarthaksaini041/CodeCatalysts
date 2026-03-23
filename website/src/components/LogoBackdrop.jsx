import React, { useEffect, useId, useRef, useState } from 'react';

const HERO_LOGO_PATH = "M349.00004,682.42774 c 27.6132,-4.01546 53.6308,-13.54456 79.0271,-28.9442 18.8469,-11.42825 19.1581,-11.69871 75.9729,-66.02338 35.7334,-34.16728 46.6642,-44.05234 56.1484,-50.77691 7.7963,-5.52772 21.8761,-12.30273 33.8516,-16.28889 10.8249,-3.60319 13.4439,-6.02164 12.6926,-11.72038 -0.7419,-5.62744 -5.3888,-9.55299 -16.5268,-13.96136 -30.0508,-11.89397 -67.7452,-15.02823 -91.7117,-7.62575 -7.9491,2.45525 -8.8455,3.20213 -43.1768,35.97496 -51.9637,49.60487 -57.7405,54.37042 -78.8497,65.04647 -26.7407,13.52422 -56.6901,16.83349 -85.7139,9.47099 -39.4608,-10.01006 -70.2017,-41.91138 -80.4311,-83.46724 -2.2718,-9.22908 -2.6034,-12.63202 -2.5449,-26.11205 0.059,-13.45911 0.4163,-16.81207 2.7174,-25.46483 9.2081,-34.62534 33.4969,-62.12492 67.2475,-76.13728 22.4194,-9.30797 51.0692,-10.94006 75.1228,-4.27951 16.2852,4.50946 34.1091,14.10538 48.3561,26.03362 l 4.8073,4.0249 4.0442,-3.20308 c 5.9458,-4.70913 52.2397,-49.25745 52.7274,-50.73918 0.5576,-1.69429 -12.2554,-14.87314 -22.5978,-23.24296 -20.657,-16.71714 -52.4027,-31.41578 -79.6626,-36.88474 -49.4938,-9.92957 -101.4605,-1.11442 -143.5,24.34203 -32.5065,19.68381 -59.3344,49.21421 -75.905,83.55103 -45.678802,94.65394 -6.4168,209.81818 87.5502,256.80427 25.2892,12.64529 46.3821,18.49903 77.8548,21.60638 7.2578,0.71658 31.8156,-0.4292 42.5,-1.98291 z m 313.3928,0.0846 c 51.1335,-7.78556 95.1485,-33.72244 127.0211,-74.85006 22.9334,-29.59276 35.9383,-63.7599 38.7882,-101.90654 3.4238,-45.82739 -8.0091,-88.45242 -34.2665,-127.7557 -6.2537,-9.36077 -11.6264,-15.79072 -21.3933,-25.60321 -20.357,-20.45205 -39.5117,-33.64703 -62.6336,-43.1462 -63.7134,-26.17539 -133.2676,-17.56162 -188.5969,23.35636 -7.798,5.76692 -31.2381,27.70252 -68.2981,63.91444 -30.5245,29.82591 -40.3163,37.39535 -62.5137,48.32527 -13.8136,6.80173 -26.5019,11.1533 -32.521,11.1533 -2.5551,0 -4.9249,0.27917 -5.2661,0.62039 -0.7471,0.74713 5.4459,10.7344 9.1443,14.74666 8.4269,9.14202 23.807,17.96839 37.6428,21.60246 17.9262,4.70848 35.1662,4.68542 54,-0.0722 16.4212,-4.14824 20.9399,-7.14583 42,-27.8619 50.9446,-50.11241 62.6477,-60.39846 80,-70.31342 9.9791,-5.70199 26.3453,-11.94427 37.5,-14.30294 10.0414,-2.12328 30.2698,-2.39962 39.7875,-0.54355 22.0185,4.29394 46.0361,17.44567 60.614,33.19152 31.4854,34.00805 38.9804,85.05696 18.7096,127.43303 -19.3173,40.38266 -62.5171,64.76429 -107.1598,60.48013 -22.7723,-2.18536 -41.0434,-9.60405 -60.7097,-24.65021 l -8.2584,-6.31826 -17.2416,16.68805 c -31.9572,30.93112 -36.8637,35.79154 -38.7733,38.40891 l -1.9032,2.60861 10.0284,8.86549 c 13.6871,12.09984 24.2926,19.47271 37.9065,26.35214 14.882,7.5203 28.1705,12.44333 43.319,16.04849 10.6451,2.53343 15.55,3.34651 32.681,5.41755 6.3409,0.76657 30.3168,-0.35444 40.3928,-1.8886 z";

const HERO_LOGO_VIEWBOX = {
  minX: 90,
  minY: 230,
  width: 760,
  height: 480,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (start, end, amount) => start + ((end - start) * amount);
const easeOutCubic = (value) => 1 - ((1 - value) ** 3);
const easeInOutSine = (value) => -(Math.cos(Math.PI * value) - 1) / 2;
const toPercent = (value) => `${value.toFixed(1)}%`;
const toNumber = (value) => Number(value.toFixed(2));
const LOGO_LIGHT_RESPONSE_MS = 240;
const LOGO_LIGHT_SETTLE_THRESHOLD = 0.06;
const LOGO_LIGHT_TARGET_EPSILON = 0.02;
const SITE_LIGHT_RESPONSE_MS = 280;
const SITE_LIGHT_SETTLE_THRESHOLD = 0.004;
const SITE_LIGHT_TARGET_EPSILON = 0.002;
const STAGE_ANCHOR_RESPONSE_MS = 220;
const STAGE_ANCHOR_SETTLE_THRESHOLD = 0.5;

const DEFAULT_LOGO_LIGHTING = {
  signature: 'default',
  intensity: 0.56,
  depth: 0.62,
  fillX1: '50.0%',
  fillY1: '0.0%',
  fillX2: '50.0%',
  fillY2: '100.0%',
  highlightCx: '50.0%',
  highlightCy: '18.0%',
  highlightRadius: '54.0%',
  sheenRadius: '78.0%',
  shadowCx: '50.0%',
  shadowCy: '74.0%',
  shadowRadius: '78.0%',
  rimX1: '50.0%',
  rimY1: '0.0%',
  rimX2: '50.0%',
  rimY2: '100.0%',
  shadowDx: 0,
  shadowDy: 54,
  shadowBlur: 50,
  shadowOpacity: 0.82,
  contactShadowDx: 0,
  contactShadowDy: 19,
  contactShadowBlur: 22,
  contactShadowOpacity: 0.42,
  stageShadowDx: 0,
  stageShadowDy: 32,
  stageShadowScale: 1.02,
  stageShadowOpacity: 0.82,
  specularCoreOpacity: 0.28,
  specularOpacity: 0.22,
  specularEdgeOpacity: 0.12,
  sheenOpacity: 0.18,
  occlusionCoreOpacity: 0.34,
  occlusionOpacity: 0.28,
  rimLeadOpacity: 0.26,
  rimMidOpacity: 0.18,
  rimTailOpacity: 0.12,
  microRimOpacity: 0.08,
  undersideOpacity: 0.18,
  topGlowOpacity: 0.24,
  structuralGlowOpacity: 0.2,
};

const DEFAULT_SITE_LIGHT = {
  signature: 'default',
  expansion: 0,
  strength: 0.98,
  spread: 0.68,
  surfaceReach: 1,
  focusY: 0,
  coreOpacity: 0.96,
  haloOpacity: 0.84,
  beamOpacity: 0.82,
  washOpacity: 0.56,
  ambientOpacity: 0.58,
  pageFillOpacity: 0.01,
  shadowStrength: 1.08,
  highlightStrength: 1.12,
};

const APPLY_FIXED_SITE_LIGHT = {
  signature: 'apply-fixed',
  expansion: 0.14,
  strength: 0.7,
  spread: 0.82,
  surfaceReach: 1.04,
  focusY: 4,
  coreOpacity: 0.62,
  haloOpacity: 0.54,
  beamOpacity: 0.26,
  washOpacity: 0.24,
  ambientOpacity: 0.28,
  pageFillOpacity: 0.012,
  shadowStrength: 1.02,
  highlightStrength: 0.9,
};

const SURFACE_LIGHT_SELECTOR = [
  '.hero-title',
  '.hero-subtitle',
  '.hero-metric',
  '.hero-metric-value',
  '.hero-metric-label',
  '.heading-lg',
  '.heading-md',
  '.kicker-badge',
  '.neon-card',
  '.static-texture-card',
  '.rough-gradient-card',
  '.glass-btn',
  '.hero-metrics',
  '.site-nav',
  '.nav-logo',
  '.header-menu-toggle',
  '.header-menu-panel',
  '.header-menu-link',
  '.premium-glass-card',
  '.project-link',
  '.project-chip',
  '.project-badge',
  '.join-cta-card',
  '.join-cta-button',
  '.join-faq-shell',
  '.join-faq-item',
  '.footer-panel',
  '.footer-brand-link',
  '.footer-emblem-core',
  '.team-carousel-stage-wrap',
  '.team-carousel-card',
  '.team-carousel-nav',
  '.cyber-panel',
  '.panel-social-btn',
  '.mobile-toggle',
  '.mobile-menu',
  '.mobile-link',
].join(', ');

const SURFACE_LIGHT_PROPERTIES = [
  '--surface-light-x',
  '--surface-light-y',
  '--surface-light-strength',
  '--surface-shadow-x',
  '--surface-shadow-y',
  '--surface-shadow-blur',
  '--surface-shadow-opacity',
  '--surface-glow-opacity',
  '--surface-edge-opacity',
  '--surface-sheen-opacity',
  '--surface-occlusion-opacity',
  '--surface-drop-shadow-x',
  '--surface-drop-shadow-y',
  '--surface-drop-shadow-blur',
  '--surface-drop-shadow-opacity',
  '--surface-text-shadow-opacity',
  '--surface-text-glow-opacity',
];

function interpolateMotionValue(currentValue, targetValue, amount) {
  if (typeof currentValue === 'number' && typeof targetValue === 'number') {
    return toNumber(mix(currentValue, targetValue, amount));
  }

  if (
    typeof currentValue === 'string'
    && typeof targetValue === 'string'
    && currentValue.endsWith('%')
    && targetValue.endsWith('%')
  ) {
    return toPercent(mix(parseFloat(currentValue), parseFloat(targetValue), amount));
  }

  return targetValue;
}

function getMotionDelta(currentValue, targetValue) {
  if (typeof currentValue === 'number' && typeof targetValue === 'number') {
    return Math.abs(targetValue - currentValue);
  }

  if (
    typeof currentValue === 'string'
    && typeof targetValue === 'string'
    && currentValue.endsWith('%')
    && targetValue.endsWith('%')
  ) {
    return Math.abs(parseFloat(targetValue) - parseFloat(currentValue));
  }

  return currentValue === targetValue ? 0 : Number.POSITIVE_INFINITY;
}

function blendMotionState(currentState, targetState, amount) {
  const nextState = { signature: targetState.signature };

  Object.keys(targetState).forEach((key) => {
    if (key === 'signature') {
      return;
    }

    const currentValue = currentState?.[key] ?? targetState[key];
    nextState[key] = interpolateMotionValue(currentValue, targetState[key], amount);
  });

  return nextState;
}

function getMotionStateDelta(currentState, targetState) {
  return Object.keys(targetState).reduce((maxDelta, key) => {
    if (key === 'signature') {
      return maxDelta;
    }

    return Math.max(maxDelta, getMotionDelta(currentState?.[key], targetState[key]));
  }, 0);
}

function clearSurfaceLighting(element) {
  SURFACE_LIGHT_PROPERTIES.forEach((property) => {
    element.style.removeProperty(property);
  });
}

function getFixedSiteLight(profile) {
  if (profile === 'apply') {
    return APPLY_FIXED_SITE_LIGHT;
  }

  return DEFAULT_SITE_LIGHT;
}

function buildRenderedLightRect(siteLight) {
  if (typeof window === 'undefined') {
    return {
      left: 0,
      top: 0,
      width: 1320,
      height: 900,
    };
  }

  const viewportWidth = window.innerWidth || 1;
  const viewportHeight = window.innerHeight || 1;
  const width = Math.min(1760 * siteLight.spread, viewportWidth * 1.44);
  const height = viewportHeight * (mix(128, 182, siteLight.expansion) / 100);

  return {
    left: (viewportWidth / 2) - (width / 2),
    top: 0,
    width,
    height,
  };
}

function resolveStageFallbackPosition(fallbackTop) {
  if (typeof window === 'undefined') {
    return { left: 0, top: 0 };
  }

  const viewportWidth = window.innerWidth || 1;
  const viewportHeight = window.innerHeight || 1;

  if (fallbackTop === '50%') {
    return { left: viewportWidth / 2, top: viewportHeight / 2 };
  }

  if (fallbackTop === '0px') {
    return { left: viewportWidth / 2, top: 0 };
  }

  return {
    left: viewportWidth / 2,
    top: Number.parseFloat(fallbackTop) || 0,
  };
}

function collectSurfaceLightElements() {
  if (typeof document === 'undefined') {
    return [];
  }

  return Array.from(document.querySelectorAll(SURFACE_LIGHT_SELECTOR));
}

function applySurfaceLighting(element, lightRect, siteLight = DEFAULT_SITE_LIGHT) {
  if (typeof window === 'undefined') {
    return;
  }

  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const viewportHeight = window.innerHeight || 1;
  const viewportWidth = window.innerWidth || 1;
  const lightX = lightRect.left + (lightRect.width / 2);
  const lightY = lightRect.top + clamp(lightRect.height * 0.018, 20, 30);

  if (rect.bottom < -140 || rect.top > viewportHeight + 180) {
    clearSurfaceLighting(element);
    return;
  }

  const centerX = rect.left + (rect.width / 2);
  const centerY = rect.top + (rect.height / 2);
  const dx = centerX - lightX;
  const dy = centerY - lightY;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const nx = dx / distance;
  const ny = dy / distance;
  const reach = Math.max(
    viewportHeight * mix(1.18, 1.98, siteLight.expansion),
    viewportWidth * mix(0.82, 1.54, siteLight.expansion),
    1400,
  );
  const verticalReach = Math.max(viewportHeight * mix(1.12, 1.92, siteLight.expansion), 760);
  const centeredReach = Math.max(viewportWidth * mix(0.58, 0.96, siteLight.expansion), 420);

  const proximity = clamp(
    1 - (distance / reach),
    0,
    1,
  );
  const vertical = clamp(
    1 - (Math.max(rect.top - lightY, 0) / verticalReach),
    0,
    1,
  );
  const visibility = clamp(
    (viewportHeight - rect.top + Math.min(rect.height * 0.35, 140))
      / (viewportHeight + (rect.height * 0.42)),
    0,
    1,
  );
  const centered = clamp(
    1 - (Math.abs(dx) / centeredReach),
    0,
    1,
  );

  const strength = clamp(
    0.12
      + (proximity * mix(0.34, 0.42, siteLight.expansion))
      + (vertical * mix(0.26, 0.36, siteLight.expansion))
      + (visibility * 0.14)
      + (centered * mix(0.08, 0.12, siteLight.expansion)),
    0.12,
    1,
  );
  const highlightX = clamp(((lightX - rect.left) / rect.width) * 100, -28, 128);
  const highlightY = clamp(((lightY - rect.top) / rect.height) * 100, -86, mix(52, 72, siteLight.expansion));
  const shadowX = toNumber(nx * (10 + (strength * 14)));
  const shadowY = toNumber(Math.max(12, ny * (20 + (strength * 26))));
  const shadowBlur = toNumber(
    24
      + (strength * mix(24, 34, siteLight.expansion))
      + (Math.min(rect.height, 220) * 0.03),
  );
  const shadowOpacity = toNumber(0.18 + (strength * mix(0.18, 0.22, siteLight.expansion)));
  const glowOpacity = toNumber(0.05 + (strength * mix(0.16, 0.24, siteLight.expansion)));
  const edgeOpacity = toNumber(0.04 + (strength * mix(0.1, 0.14, siteLight.expansion)));
  const sheenOpacity = toNumber(0.05 + (strength * mix(0.09, 0.14, siteLight.expansion)));
  const dropShadowX = toNumber(nx * (6 + (strength * 12)));
  const dropShadowY = toNumber(Math.max(10, ny * (14 + (strength * 18))));
  const dropShadowBlur = toNumber(18 + (strength * 24));
  const dropShadowOpacity = toNumber(0.12 + (strength * 0.16));
  const textShadowOpacity = toNumber(0.16 + (strength * 0.14));
  const textGlowOpacity = toNumber(0.03 + (strength * 0.08));
  const occlusionOpacity = toNumber(
    0.1
      + ((1 - strength) * mix(0.12, 0.08, siteLight.expansion))
      + ((1 - vertical) * 0.04),
  );

  element.style.setProperty('--surface-light-x', `${highlightX.toFixed(1)}%`);
  element.style.setProperty('--surface-light-y', `${highlightY.toFixed(1)}%`);
  element.style.setProperty('--surface-light-strength', strength.toFixed(3));
  element.style.setProperty('--surface-shadow-x', `${shadowX.toFixed(2)}px`);
  element.style.setProperty('--surface-shadow-y', `${shadowY.toFixed(2)}px`);
  element.style.setProperty('--surface-shadow-blur', `${shadowBlur.toFixed(2)}px`);
  element.style.setProperty('--surface-shadow-opacity', shadowOpacity.toFixed(3));
  element.style.setProperty('--surface-glow-opacity', glowOpacity.toFixed(3));
  element.style.setProperty('--surface-edge-opacity', edgeOpacity.toFixed(3));
  element.style.setProperty('--surface-sheen-opacity', sheenOpacity.toFixed(3));
  element.style.setProperty('--surface-occlusion-opacity', occlusionOpacity.toFixed(3));
  element.style.setProperty('--surface-drop-shadow-x', `${dropShadowX.toFixed(2)}px`);
  element.style.setProperty('--surface-drop-shadow-y', `${dropShadowY.toFixed(2)}px`);
  element.style.setProperty('--surface-drop-shadow-blur', `${dropShadowBlur.toFixed(2)}px`);
  element.style.setProperty('--surface-drop-shadow-opacity', dropShadowOpacity.toFixed(3));
  element.style.setProperty('--surface-text-shadow-opacity', textShadowOpacity.toFixed(3));
  element.style.setProperty('--surface-text-glow-opacity', textGlowOpacity.toFixed(3));
}

function buildSiteLight() {
  if (typeof window === 'undefined') {
    return DEFAULT_SITE_LIGHT;
  }

  const viewportHeight = window.innerHeight || 1;
  const documentHeight = Math.max(
    document.documentElement?.scrollHeight || 0,
    document.body?.scrollHeight || 0,
    viewportHeight,
  );
  const maxScroll = Math.max(documentHeight - viewportHeight, 1);
  const introProgress = clamp(
    (window.scrollY || 0) / Math.max(viewportHeight * 1.08, 760),
    0,
    1,
  );
  const pageProgress = clamp((window.scrollY || 0) / maxScroll, 0, 1);
  const introEase = easeOutCubic(introProgress);
  const pageEase = easeInOutSine(pageProgress);
  const expansion = toNumber(clamp((introEase * 0.8) + (pageEase * 0.12), 0, 1));
  const strength = toNumber(clamp(mix(1, 0.78, expansion), 0.18, 1.18));
  const spread = toNumber(clamp(mix(0.68, 1.7, expansion), 0.64, 1.76));
  const surfaceReach = toNumber(mix(1, 1.54, expansion));
  const focusY = toNumber(mix(0, 12, expansion));
  const coreOpacity = toNumber(clamp(mix(0.96, 0.42, expansion), 0.14, 1.08));
  const haloOpacity = toNumber(clamp(mix(0.84, 0.62, expansion), 0.18, 0.94));
  const beamOpacity = toNumber(clamp(mix(0.82, 0.26, expansion), 0.12, 0.92));
  const washOpacity = toNumber(clamp(mix(0.56, 0.42, expansion), 0.18, 0.68));
  const ambientOpacity = toNumber(clamp(mix(0.58, 0.38, expansion), 0.2, 0.66));
  const pageFillOpacity = toNumber(clamp(mix(0.01, 0.06, expansion), 0.004, 0.07));
  const shadowStrength = toNumber(clamp(mix(1.08, 1.18, expansion), 0.72, 1.26));
  const highlightStrength = toNumber(clamp(mix(1.14, 1, expansion), 0.74, 1.24));

  return {
    signature: [
      expansion,
      strength,
      spread,
      surfaceReach,
      focusY,
      coreOpacity,
      haloOpacity,
      beamOpacity,
      washOpacity,
      ambientOpacity,
      pageFillOpacity,
      shadowStrength,
      highlightStrength,
    ].map((value) => value.toFixed(4)).join('|'),
    expansion,
    strength,
    spread,
    surfaceReach,
    focusY,
    coreOpacity,
    haloOpacity,
    beamOpacity,
    washOpacity,
    ambientOpacity,
    pageFillOpacity,
    shadowStrength,
    highlightStrength,
  };
}

function applySiteLightState(rootStyle, siteLight, surfaceElements = []) {
  if (typeof document === 'undefined') {
    return;
  }

  const lightRect = buildRenderedLightRect(siteLight);

  rootStyle.setProperty('--site-sun-strength', siteLight.strength.toFixed(3));
  rootStyle.setProperty('--site-sun-shadow-strength', siteLight.shadowStrength.toFixed(3));
  rootStyle.setProperty('--site-sun-highlight-strength', siteLight.highlightStrength.toFixed(3));

  const surfaceLightRect = {
    left: lightRect.left - (((lightRect.width * siteLight.surfaceReach) - lightRect.width) / 2),
    top: lightRect.top - (lightRect.height * mix(0.04, 0.14, siteLight.expansion)),
    width: lightRect.width * siteLight.surfaceReach,
    height: lightRect.height * mix(1, 1.36, siteLight.expansion),
  };

  surfaceElements.forEach((element) => {
    applySurfaceLighting(element, surfaceLightRect, siteLight);
  });
}

function buildLogoLighting(logoRect, lightRect) {
  if (!logoRect || !lightRect || typeof window === 'undefined') {
    return DEFAULT_LOGO_LIGHTING;
  }

  const viewportHeight = window.innerHeight || 1;
  const viewportWidth = window.innerWidth || 1;
  const lightX = lightRect.left + (lightRect.width / 2);
  const lightY = lightRect.top + clamp(lightRect.height * 0.034, 20, 34);
  const logoX = logoRect.left + (logoRect.width / 2);
  const logoY = logoRect.top + (logoRect.height * 0.42);

  const dx = logoX - lightX;
  const dy = logoY - lightY;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const nx = dx / distance;
  const ny = dy / distance;

  const proximity = clamp(1 - (distance / Math.max(viewportHeight * 1.05, 880)), 0, 1);
  const verticalProximity = clamp(
    1 - (Math.max(logoRect.top - lightY, 0) / Math.max(viewportHeight * 0.95, 620)),
    0,
    1,
  );
  const visibility = clamp(
    (viewportHeight - logoRect.top + (logoRect.height * 0.22)) / (viewportHeight + (logoRect.height * 0.28)),
    0,
    1,
  );
  const centered = clamp(1 - (Math.abs(dx) / Math.max(viewportWidth * 0.48, 380)), 0, 1);

  const intensity = clamp(
    0.28 + (proximity * 0.38) + (verticalProximity * 0.26) + (visibility * 0.2) + (centered * 0.12),
    0.28,
    1,
  );
  const depth = clamp(0.24 + (intensity * 0.72), 0.24, 1);

  const fillX1 = clamp(50 - (nx * 48), 0, 100);
  const fillY1 = clamp(34 - (ny * 42), 0, 100);
  const fillX2 = clamp(50 + (nx * 44), 0, 100);
  const fillY2 = clamp(66 + (ny * 40), 0, 100);

  const highlightCx = clamp(50 - (nx * 24), 18, 82);
  const highlightCy = clamp(45 - (ny * 24), 8, 74);
  const highlightRadius = 44 + (intensity * 14);
  const sheenRadius = 62 + (intensity * 20);

  const shadowCx = clamp(50 + (nx * 28), 12, 88);
  const shadowCy = clamp(57 + (ny * 24), 18, 92);
  const shadowRadius = 68 + (depth * 16);

  const rimX1 = clamp(50 - (nx * 56), 0, 100);
  const rimY1 = clamp(36 - (ny * 52), 0, 100);
  const rimX2 = clamp(50 + (nx * 56), 0, 100);
  const rimY2 = clamp(64 + (ny * 52), 0, 100);

  const shadowDx = toNumber(nx * (24 + (depth * 30)));
  const shadowDy = toNumber(ny * (36 + (depth * 52)));
  const shadowBlur = toNumber(34 + (depth * 20));
  const contactShadowDx = toNumber(nx * (7 + (depth * 10)));
  const contactShadowDy = toNumber(ny * (14 + (depth * 18)));
  const contactShadowBlur = toNumber(12 + (depth * 12));
  const stageShadowDx = toNumber(nx * (14 + (depth * 18)));
  const stageShadowDy = toNumber(ny * (26 + (depth * 32)));
  const stageShadowScale = toNumber(1.01 + (depth * 0.05));

  const signature = [
    intensity,
    depth,
    fillX1,
    fillY1,
    fillX2,
    fillY2,
    highlightCx,
    highlightCy,
    shadowCx,
    shadowCy,
    shadowDx,
    shadowDy,
    stageShadowDx,
    stageShadowDy,
  ].map((value) => (typeof value === 'number' ? value.toFixed(4) : value)).join('|');

  return {
    signature,
    intensity,
    depth,
    fillX1: toPercent(fillX1),
    fillY1: toPercent(fillY1),
    fillX2: toPercent(fillX2),
    fillY2: toPercent(fillY2),
    highlightCx: toPercent(highlightCx),
    highlightCy: toPercent(highlightCy),
    highlightRadius: toPercent(highlightRadius),
    sheenRadius: toPercent(sheenRadius),
    shadowCx: toPercent(shadowCx),
    shadowCy: toPercent(shadowCy),
    shadowRadius: toPercent(shadowRadius),
    rimX1: toPercent(rimX1),
    rimY1: toPercent(rimY1),
    rimX2: toPercent(rimX2),
    rimY2: toPercent(rimY2),
    shadowDx,
    shadowDy,
    shadowBlur,
    shadowOpacity: toNumber(0.56 + (intensity * 0.28)),
    contactShadowDx,
    contactShadowDy,
    contactShadowBlur,
    contactShadowOpacity: toNumber(0.24 + (intensity * 0.24)),
    stageShadowDx,
    stageShadowDy,
    stageShadowScale,
    stageShadowOpacity: toNumber(0.66 + (intensity * 0.22)),
    specularCoreOpacity: toNumber(0.16 + (intensity * 0.22)),
    specularOpacity: toNumber(0.12 + (intensity * 0.18)),
    specularEdgeOpacity: toNumber(0.06 + (intensity * 0.1)),
    sheenOpacity: toNumber(0.08 + (intensity * 0.18)),
    occlusionCoreOpacity: toNumber(0.18 + ((1 - intensity) * 0.1) + (depth * 0.08)),
    occlusionOpacity: toNumber(0.14 + ((1 - intensity) * 0.08) + (depth * 0.06)),
    rimLeadOpacity: toNumber(0.12 + (intensity * 0.18)),
    rimMidOpacity: toNumber(0.08 + (intensity * 0.14)),
    rimTailOpacity: toNumber(0.06 + (intensity * 0.08)),
    microRimOpacity: toNumber(0.04 + (intensity * 0.06)),
    undersideOpacity: toNumber(0.08 + (depth * 0.12)),
    topGlowOpacity: toNumber(0.12 + (intensity * 0.24)),
    structuralGlowOpacity: toNumber(0.08 + (intensity * 0.16)),
  };
}

function useStageAnchor(
  stageRef,
  anchorSelector,
  verticalMode,
  fallbackTop,
  { immediateOnScroll = false } = {},
) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === 'undefined') {
      return undefined;
    }

    let syncFrameId = null;
    let animationFrameId = null;
    let observer = null;
    let currentPosition = null;
    let targetPosition = null;
    let previousTimestamp = 0;
    let pendingImmediateSync = false;

    const applyPosition = (position) => {
      stage.style.left = `${position.left}px`;
      stage.style.top = `${position.top}px`;
    };

    const stopAnchorAnimation = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      previousTimestamp = 0;
    };

    const animateAnchor = (timestamp) => {
      if (!targetPosition || !currentPosition) {
        stopAnchorAnimation();
        return;
      }

      const deltaMs = Math.min(Math.max(timestamp - (previousTimestamp || timestamp), 16), 48);
      const smoothing = 1 - Math.exp(-deltaMs / STAGE_ANCHOR_RESPONSE_MS);
      previousTimestamp = timestamp;

      currentPosition = {
        left: mix(currentPosition.left, targetPosition.left, smoothing),
        top: mix(currentPosition.top, targetPosition.top, smoothing),
      };

      applyPosition(currentPosition);

      const delta = Math.max(
        Math.abs(targetPosition.left - currentPosition.left),
        Math.abs(targetPosition.top - currentPosition.top),
      );

      if (delta <= STAGE_ANCHOR_SETTLE_THRESHOLD) {
        currentPosition = { ...targetPosition };
        applyPosition(currentPosition);
        stopAnchorAnimation();
        return;
      }

      animationFrameId = window.requestAnimationFrame(animateAnchor);
    };

    const ensureAnchorAnimation = () => {
      if (animationFrameId !== null || !targetPosition) {
        return;
      }

      previousTimestamp = 0;
      animationFrameId = window.requestAnimationFrame(animateAnchor);
    };

    const syncAnchor = () => {
      syncFrameId = null;
      const shouldApplyImmediately = pendingImmediateSync;
      pendingImmediateSync = false;

      let nextPosition = resolveStageFallbackPosition(fallbackTop);

      if (anchorSelector) {
        const anchor = document.querySelector(anchorSelector);

        if (anchor) {
          const rect = anchor.getBoundingClientRect();

          if (rect.width && rect.height) {
            nextPosition = {
              left: rect.left + (rect.width / 2),
              top: verticalMode === 'top'
                ? Math.max(0, rect.top)
                : rect.top + (rect.height / 2),
            };
          }
        }
      }

      targetPosition = nextPosition;

      if (!currentPosition || shouldApplyImmediately) {
        stopAnchorAnimation();
        currentPosition = { ...nextPosition };
        applyPosition(currentPosition);
        return;
      }

      ensureAnchorAnimation();
    };

    const requestSync = (immediate = false) => {
      pendingImmediateSync = pendingImmediateSync || immediate;
      if (syncFrameId !== null) return;
      syncFrameId = window.requestAnimationFrame(syncAnchor);
    };

    const handleResize = () => {
      requestSync();
    };

    const handleScroll = () => {
      requestSync(immediateOnScroll);
    };

    requestSync();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(requestSync);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (syncFrameId !== null) {
        window.cancelAnimationFrame(syncFrameId);
      }

      stopAnchorAnimation();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, [anchorSelector, fallbackTop, immediateOnScroll, stageRef, verticalMode]);
}

const LogoBackdrop = ({
  logoAnchorSelector = null,
  lightAnchorSelector = null,
  showLogo = true,
  lightMode = 'fixed',
  fixedLightProfile = 'default',
  onReady,
}) => {
  const isReactiveLight = lightMode === 'reactive';
  const fixedSiteLight = getFixedSiteLight(fixedLightProfile);
  const initialSiteLight = isReactiveLight ? DEFAULT_SITE_LIGHT : fixedSiteLight;
  const logoStageRef = useRef(null);
  const lightStageRef = useRef(null);
  const logoLightingFrameRef = useRef(null);
  const logoLightingTargetRef = useRef(DEFAULT_LOGO_LIGHTING);
  const logoLightingCurrentRef = useRef(DEFAULT_LOGO_LIGHTING);
  const logoLightingTimeRef = useRef(0);
  const siteLightFrameRef = useRef(null);
  const siteLightTargetRef = useRef(initialSiteLight);
  const siteLightCurrentRef = useRef(initialSiteLight);
  const siteLightTimeRef = useRef(0);
  const [logoLighting, setLogoLighting] = useState(DEFAULT_LOGO_LIGHTING);
  const [siteLight, setSiteLight] = useState(initialSiteLight);
  const idBase = useId().replace(/:/g, '');
  const hasReportedReadyRef = useRef(false);

  useStageAnchor(logoStageRef, logoAnchorSelector, 'center', '50%', { immediateOnScroll: true });
  useStageAnchor(lightStageRef, lightAnchorSelector, 'top', '0px');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof onReady !== 'function' || hasReportedReadyRef.current) {
      return undefined;
    }

    let rafIdOne = null;
    let rafIdTwo = null;

    rafIdOne = window.requestAnimationFrame(() => {
      rafIdTwo = window.requestAnimationFrame(() => {
        if (hasReportedReadyRef.current) {
          return;
        }

        hasReportedReadyRef.current = true;
        onReady();
      });
    });

    return () => {
      if (rafIdOne !== null) {
        window.cancelAnimationFrame(rafIdOne);
      }
      if (rafIdTwo !== null) {
        window.cancelAnimationFrame(rafIdTwo);
      }
    };
  }, [onReady]);

  useEffect(() => {
    if (typeof window === 'undefined' || !showLogo) {
      return undefined;
    }

    const logoStage = logoStageRef.current;
    const lightStage = lightStageRef.current;
    if (!logoStage || !lightStage) {
      return undefined;
    }

    const shouldTrackScroll = Boolean(logoAnchorSelector || lightAnchorSelector);

    let frameId = null;
    let styleObserver = null;

    const stopLogoLightingAnimation = () => {
      if (logoLightingFrameRef.current !== null) {
        window.cancelAnimationFrame(logoLightingFrameRef.current);
        logoLightingFrameRef.current = null;
      }

      logoLightingTimeRef.current = 0;
    };

    const animateLogoLighting = (timestamp) => {
      const previousTimestamp = logoLightingTimeRef.current || timestamp;
      const deltaMs = Math.min(Math.max(timestamp - previousTimestamp, 16), 48);
      const smoothing = 1 - Math.exp(-deltaMs / LOGO_LIGHT_RESPONSE_MS);
      const targetLighting = logoLightingTargetRef.current;

      logoLightingTimeRef.current = timestamp;

      let nextLighting = blendMotionState(
        logoLightingCurrentRef.current,
        targetLighting,
        smoothing,
      );

      const remainingDelta = getMotionStateDelta(nextLighting, targetLighting);

      if (remainingDelta <= LOGO_LIGHT_SETTLE_THRESHOLD) {
        nextLighting = targetLighting;
        stopLogoLightingAnimation();
      } else {
        logoLightingFrameRef.current = window.requestAnimationFrame(animateLogoLighting);
      }

      logoLightingCurrentRef.current = nextLighting;

      setLogoLighting((previousLighting) => (
        getMotionStateDelta(previousLighting, nextLighting) < 0.001 ? previousLighting : nextLighting
      ));
    };

    const ensureLogoLightingAnimation = () => {
      if (logoLightingFrameRef.current !== null) {
        return;
      }

      logoLightingTimeRef.current = 0;
      logoLightingFrameRef.current = window.requestAnimationFrame(animateLogoLighting);
    };

    const syncLighting = () => {
      frameId = null;
      const nextLighting = buildLogoLighting(
        logoStage.getBoundingClientRect(),
        lightStage.getBoundingClientRect(),
      );

      if (getMotionStateDelta(logoLightingTargetRef.current, nextLighting) < LOGO_LIGHT_TARGET_EPSILON) {
        return;
      }

      logoLightingTargetRef.current = nextLighting;
      ensureLogoLightingAnimation();
    };

    const requestLightingSync = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(syncLighting);
    };

    requestLightingSync();

    window.addEventListener('resize', requestLightingSync, { passive: true });
    if (shouldTrackScroll) {
      window.addEventListener('scroll', requestLightingSync, { passive: true });
    }

    if (typeof MutationObserver === 'function') {
      styleObserver = new MutationObserver(requestLightingSync);
      styleObserver.observe(logoStage, { attributes: true, attributeFilter: ['style'] });
      styleObserver.observe(lightStage, { attributes: true, attributeFilter: ['style'] });
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      stopLogoLightingAnimation();
      window.removeEventListener('resize', requestLightingSync);
      if (shouldTrackScroll) {
        window.removeEventListener('scroll', requestLightingSync);
      }
      styleObserver?.disconnect();
    };
  }, [lightAnchorSelector, logoAnchorSelector, showLogo]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const rootStyle = document.documentElement.style;
    let surfaceObserver = null;
    let frameId = null;
    let refreshFrameId = null;
    let surfaceElements = collectSurfaceLightElements();

    const renderSiteLight = (nextSiteLight) => {
      siteLightCurrentRef.current = nextSiteLight;
      setSiteLight((previousSiteLight) => (
        getMotionStateDelta(previousSiteLight, nextSiteLight) < 0.001 ? previousSiteLight : nextSiteLight
      ));
    };

    const applySurfaceLight = (nextSiteLight) => {
      applySiteLightState(rootStyle, nextSiteLight, surfaceElements);
    };

    const refreshSurfaceElements = () => {
      surfaceElements = collectSurfaceLightElements();
    };

    const requestSurfaceRefresh = () => {
      if (refreshFrameId !== null) {
        return;
      }

      refreshFrameId = window.requestAnimationFrame(() => {
        refreshFrameId = null;
        refreshSurfaceElements();
        applySurfaceLight(siteLightCurrentRef.current);
      });
    };

    const stopSiteLightAnimation = () => {
      if (siteLightFrameRef.current !== null) {
        window.cancelAnimationFrame(siteLightFrameRef.current);
        siteLightFrameRef.current = null;
      }

      siteLightTimeRef.current = 0;
    };

    const animateSiteLight = (timestamp) => {
      const previousTimestamp = siteLightTimeRef.current || timestamp;
      const deltaMs = Math.min(Math.max(timestamp - previousTimestamp, 16), 48);
      const smoothing = 1 - Math.exp(-deltaMs / SITE_LIGHT_RESPONSE_MS);
      const targetSiteLight = siteLightTargetRef.current;

      siteLightTimeRef.current = timestamp;

      let nextSiteLight = blendMotionState(
        siteLightCurrentRef.current,
        targetSiteLight,
        smoothing,
      );

      const remainingDelta = getMotionStateDelta(nextSiteLight, targetSiteLight);

      if (remainingDelta <= SITE_LIGHT_SETTLE_THRESHOLD) {
        nextSiteLight = targetSiteLight;
        stopSiteLightAnimation();
      } else {
        siteLightFrameRef.current = window.requestAnimationFrame(animateSiteLight);
      }

      renderSiteLight(nextSiteLight);
    };

    const ensureSiteLightAnimation = () => {
      if (siteLightFrameRef.current !== null) {
        return;
      }

      siteLightTimeRef.current = 0;
      siteLightFrameRef.current = window.requestAnimationFrame(animateSiteLight);
    };

    const syncSiteLight = () => {
      frameId = null;
      const nextSiteLight = isReactiveLight
        ? buildSiteLight()
        : fixedSiteLight;

      if (getMotionStateDelta(siteLightTargetRef.current, nextSiteLight) < SITE_LIGHT_TARGET_EPSILON) {
        return;
      }

      siteLightTargetRef.current = nextSiteLight;
      applySurfaceLight(nextSiteLight);

      if (!isReactiveLight) {
        stopSiteLightAnimation();
        renderSiteLight(nextSiteLight);
        return;
      }

      ensureSiteLightAnimation();
    };

    const requestSync = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(syncSiteLight);
    };

    requestSync();

    window.addEventListener('resize', requestSync, { passive: true });
    if (isReactiveLight) {
      window.addEventListener('scroll', requestSync, { passive: true });
    }

    if (typeof MutationObserver === 'function') {
      surfaceObserver = new MutationObserver(requestSurfaceRefresh);
      surfaceObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (refreshFrameId !== null) {
        window.cancelAnimationFrame(refreshFrameId);
      }

      stopSiteLightAnimation();
      window.removeEventListener('resize', requestSync);
      if (isReactiveLight) {
        window.removeEventListener('scroll', requestSync);
      }
      surfaceObserver?.disconnect();
      rootStyle.removeProperty('--site-sun-strength');
      rootStyle.removeProperty('--site-sun-shadow-strength');
      rootStyle.removeProperty('--site-sun-highlight-strength');
      surfaceElements.forEach((element) => {
        clearSurfaceLighting(element);
      });
    };
  }, [fixedSiteLight, isReactiveLight]);

  const baseFillId = `${idBase}-hero-logo-fill`;
  const specularId = `${idBase}-hero-logo-specular`;
  const sheenId = `${idBase}-hero-logo-sheen`;
  const occlusionId = `${idBase}-hero-logo-occlusion`;
  const rimId = `${idBase}-hero-logo-rim`;
  const undersideId = `${idBase}-hero-logo-underside`;

  const logoShadowFilter = [
    `drop-shadow(${logoLighting.shadowDx}px ${logoLighting.shadowDy}px ${logoLighting.shadowBlur}px rgba(0, 0, 0, ${logoLighting.shadowOpacity}))`,
    `drop-shadow(${logoLighting.contactShadowDx}px ${logoLighting.contactShadowDy}px ${logoLighting.contactShadowBlur}px rgba(0, 10, 18, ${logoLighting.contactShadowOpacity}))`,
  ].join(' ');

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 30%, rgba(10, 18, 42, 0.95) 0%, rgba(4, 8, 22, 0.98) 34%, #020212 62%, #010103 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(24, 88, 112, 0.14) 0%, rgba(8, 14, 30, 0.34) 16%, rgba(4, 6, 14, 0.12) 34%, rgba(2, 4, 10, 0.38) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 72% 24%, rgba(255, 255, 255, 0.06) 0%, transparent 38%), radial-gradient(circle at 18% 74%, rgba(255, 255, 255, 0.035) 0%, transparent 32%)',
          backgroundSize: '100% 100%, 100% 100%',
          backgroundPosition: 'center, center',
          mixBlendMode: 'soft-light',
          opacity: 0.14,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(ellipse at 50% ${toNumber(mix(-12, 8, siteLight.expansion))}%, rgba(156, 252, 255, ${toNumber(mix(0.28, 0.36, siteLight.expansion))}) 0%, rgba(70, 232, 255, ${toNumber(mix(0.16, 0.22, siteLight.expansion))}) 18%, rgba(14, 94, 124, ${toNumber(mix(0.06, 0.12, siteLight.expansion))}) 34%, transparent ${toNumber(mix(62, 84, siteLight.expansion))}%)`,
          mixBlendMode: 'screen',
          opacity: 0.96,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(ellipse at 50% ${toNumber(mix(14, 28, siteLight.expansion))}%, rgba(108, 236, 255, ${toNumber(siteLight.pageFillOpacity)}) 0%, rgba(38, 182, 212, ${toNumber(siteLight.pageFillOpacity * 0.65)}) 24%, rgba(8, 46, 68, ${toNumber(siteLight.pageFillOpacity * 0.28)}) 44%, transparent ${toNumber(mix(62, 86, siteLight.expansion))}%)`,
          mixBlendMode: 'screen',
          opacity: toNumber(0.08 + (siteLight.expansion * 0.2)),
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(ellipse at 50% ${toNumber(mix(20, 28, siteLight.expansion))}%, rgba(2, 8, 16, 0.34) 0%, rgba(2, 8, 16, 0.24) 16%, rgba(2, 8, 16, 0.12) 32%, rgba(2, 8, 16, 0.04) 48%, transparent 70%)`,
          opacity: toNumber(0.78 - (siteLight.expansion * 0.12)),
        }}
      />

      {showLogo ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 'min(1480px, 104vw)',
              height: '78vh',
              transform: 'translate(-50%, -48%)',
              background:
                'radial-gradient(ellipse at 50% 18%, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.4) 34%, rgba(0, 0, 0, 0.7) 72%, transparent 100%)',
              filter: 'blur(46px)',
              opacity: 0.82,
            }}
          />

          <div
            ref={logoStageRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 'min(1420px, 102vw)',
              aspectRatio: '1.72 / 1',
              transform: 'translate3d(-50%, -53.5%, 0)', /* Adjusted vertical center for visual perfection */
              willChange: 'left, top',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                opacity: 0.94,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '18% 10% 1%',
                  transform: `translate(${logoLighting.stageShadowDx}px, ${logoLighting.stageShadowDy}px) scale(${logoLighting.stageShadowScale})`,
                  background:
                    'radial-gradient(ellipse at 50% 28%, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.52) 38%, rgba(0, 0, 0, 0.82) 70%, transparent 100%)',
                  filter: 'blur(64px)',
                  opacity: logoLighting.stageShadowOpacity,
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: '-12% 6% 40%',
                  background:
                    `radial-gradient(circle at ${logoLighting.highlightCx} ${logoLighting.highlightCy}, rgba(214, 253, 255, ${logoLighting.topGlowOpacity}) 0%, rgba(98, 236, 246, ${toNumber(logoLighting.topGlowOpacity * 0.56)}) 24%, rgba(28, 118, 148, ${toNumber(logoLighting.topGlowOpacity * 0.24)}) 48%, transparent 76%)`,
                  filter: 'blur(54px)',
                  opacity: 0.98,
                  mixBlendMode: 'screen',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: '2% -2% 6%',
                  background:
                    `radial-gradient(circle at ${logoLighting.shadowCx} ${logoLighting.shadowCy}, rgba(0, 0, 0, 0.995) 0%, rgba(1, 3, 8, 0.985) 18%, rgba(3, 6, 14, 0.96) 34%, rgba(4, 8, 18, 0.78) 52%, rgba(4, 8, 18, 0.28) 70%, transparent 86%)`,
                  filter: 'blur(28px)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: '14% 14% 16%',
                  background:
                    `radial-gradient(circle at ${logoLighting.shadowCx} ${logoLighting.shadowCy}, rgba(0, 1, 3, 0.99) 0%, rgba(1, 2, 6, 0.97) 20%, rgba(3, 6, 12, ${toNumber(0.76 + (logoLighting.depth * 0.12))}) 42%, rgba(4, 8, 18, 0.34) 64%, transparent 82%)`,
                  filter: 'blur(40px)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: '8% 10% 12%',
                  background:
                    `radial-gradient(circle at ${logoLighting.highlightCx} ${logoLighting.highlightCy}, rgba(92, 152, 198, ${logoLighting.structuralGlowOpacity}) 0%, rgba(34, 68, 102, ${toNumber(logoLighting.structuralGlowOpacity * 0.48)}) 30%, rgba(8, 14, 28, 0.02) 66%, transparent 78%)`,
                  filter: 'blur(72px)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: '22% 18% 24%',
                  background:
                    `radial-gradient(circle at ${logoLighting.shadowCx} ${logoLighting.shadowCy}, rgba(0, 0, 0, 0.96) 0%, rgba(1, 2, 6, 0.92) 22%, rgba(2, 5, 10, 0.72) 38%, rgba(3, 6, 14, 0.2) 58%, transparent 78%)`,
                  filter: 'blur(56px)',
                }}
              />

              <svg
                viewBox={`${HERO_LOGO_VIEWBOX.minX} ${HERO_LOGO_VIEWBOX.minY} ${HERO_LOGO_VIEWBOX.width} ${HERO_LOGO_VIEWBOX.height}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                  transform: 'translateZ(0)',
                  filter: logoShadowFilter,
                }}
              >
                <defs>
                  <linearGradient id={baseFillId} x1={logoLighting.fillX1} y1={logoLighting.fillY1} x2={logoLighting.fillX2} y2={logoLighting.fillY2}>
                    <stop offset="0%" stopColor="#31465d" stopOpacity="0.98" />
                    <stop offset="28%" stopColor="#223247" stopOpacity="0.97" />
                    <stop offset="56%" stopColor="#142133" stopOpacity="0.98" />
                    <stop offset="100%" stopColor="#060d16" stopOpacity="0.99" />
                  </linearGradient>

                  <radialGradient id={specularId} cx={logoLighting.highlightCx} cy={logoLighting.highlightCy} r={logoLighting.highlightRadius}>
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={logoLighting.specularCoreOpacity} />
                    <stop offset="14%" stopColor="#dbfdff" stopOpacity={logoLighting.specularOpacity} />
                    <stop offset="34%" stopColor="#84efff" stopOpacity={logoLighting.specularEdgeOpacity} />
                    <stop offset="100%" stopColor="#84efff" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id={sheenId} cx={logoLighting.highlightCx} cy={logoLighting.highlightCy} r={logoLighting.sheenRadius}>
                    <stop offset="0%" stopColor="#86f4ff" stopOpacity={logoLighting.sheenOpacity} />
                    <stop offset="44%" stopColor="#2f8ec8" stopOpacity={toNumber(logoLighting.sheenOpacity * 0.38)} />
                    <stop offset="100%" stopColor="#2f8ec8" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id={occlusionId} cx={logoLighting.shadowCx} cy={logoLighting.shadowCy} r={logoLighting.shadowRadius}>
                    <stop offset="0%" stopColor="#010204" stopOpacity={logoLighting.occlusionCoreOpacity} />
                    <stop offset="40%" stopColor="#050b14" stopOpacity={logoLighting.occlusionOpacity} />
                    <stop offset="100%" stopColor="#050b14" stopOpacity="0" />
                  </radialGradient>

                  <linearGradient id={rimId} x1={logoLighting.rimX1} y1={logoLighting.rimY1} x2={logoLighting.rimX2} y2={logoLighting.rimY2}>
                    <stop offset="0%" stopColor="#f3ffff" stopOpacity={logoLighting.rimLeadOpacity} />
                    <stop offset="26%" stopColor="#9ff4ff" stopOpacity={logoLighting.rimMidOpacity} />
                    <stop offset="66%" stopColor="#4c6d8e" stopOpacity={logoLighting.rimTailOpacity} />
                    <stop offset="100%" stopColor="#08111b" stopOpacity="0.18" />
                  </linearGradient>

                  <linearGradient id={undersideId} x1={logoLighting.fillX2} y1={logoLighting.fillY2} x2={logoLighting.fillX1} y2={logoLighting.fillY1}>
                    <stop offset="0%" stopColor="#000000" stopOpacity={logoLighting.undersideOpacity} />
                    <stop offset="36%" stopColor="#050b14" stopOpacity={toNumber(logoLighting.undersideOpacity * 0.72)} />
                    <stop offset="100%" stopColor="#050b14" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path d={HERO_LOGO_PATH} fill={`url(#${baseFillId})`} />
                <path d={HERO_LOGO_PATH} fill={`url(#${sheenId})`} style={{ mixBlendMode: 'screen' }} />
                <path d={HERO_LOGO_PATH} fill={`url(#${specularId})`} style={{ mixBlendMode: 'screen' }} />
                <path d={HERO_LOGO_PATH} fill={`url(#${occlusionId})`} />
                <path d={HERO_LOGO_PATH} fill={`url(#${undersideId})`} />
                <path
                  d={HERO_LOGO_PATH}
                  fill="none"
                  stroke={`url(#${rimId})`}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path
                  d={HERO_LOGO_PATH}
                  fill="none"
                  stroke="#effbff"
                  strokeOpacity={logoLighting.microRimOpacity}
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </>
      ) : null}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 48%, transparent 0%, rgba(1, 3, 8, 0.16) 54%, rgba(1, 2, 7, 0.54) 82%, rgba(0, 0, 0, 0.82) 100%)',
        }}
      />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          ref={lightStageRef}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: `min(${toNumber(1760 * siteLight.spread)}px, 144vw)`,
            height: `${toNumber(mix(128, 182, siteLight.expansion))}vh`,
            transform: 'translateX(-50%)',
            willChange: 'left, top',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: `${toNumber(mix(-36, -54, siteLight.expansion))}px`,
              left: '50%',
              width: `min(${toNumber(2100 * siteLight.spread * mix(0.82, 1.18, siteLight.expansion))}px, 200vw)`,
              height: `${toNumber(mix(76, 114, siteLight.expansion))}vh`,
              transform: 'translateX(-50%)',
              background:
                `radial-gradient(ellipse at 50% ${siteLight.focusY.toFixed(1)}%, rgba(204, 253, 255, ${toNumber(siteLight.ambientOpacity * 0.34)}) 0%, rgba(112, 240, 255, ${toNumber(siteLight.ambientOpacity * 0.22)}) 15%, rgba(16, 110, 140, ${toNumber(siteLight.ambientOpacity * 0.08)}) 34%, transparent ${toNumber(mix(68, 82, siteLight.expansion))}%)`,
              filter: `blur(${toNumber(mix(56, 86, siteLight.expansion))}px)`,
              opacity: siteLight.ambientOpacity,
              mixBlendMode: 'screen',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: `${toNumber(mix(-10, -24, siteLight.expansion))}px`,
              left: '50%',
              width: `min(${toNumber(1480 * siteLight.spread * mix(0.9, 1.22, siteLight.expansion))}px, 150vw)`,
              height: `${toNumber(mix(132, 176, siteLight.expansion))}vh`,
              transform: 'translateX(-50%)',
              background:
                `radial-gradient(ellipse at 50% ${siteLight.focusY.toFixed(1)}%, rgba(232, 255, 255, ${toNumber(siteLight.haloOpacity * 0.8)}) 0%, rgba(136, 246, 255, ${toNumber(siteLight.haloOpacity * 0.62)}) 9%, rgba(44, 226, 244, ${toNumber(siteLight.haloOpacity * 0.24)}) 24%, rgba(8, 112, 138, ${toNumber(siteLight.haloOpacity * 0.08)}) 48%, transparent ${toNumber(mix(80, 92, siteLight.expansion))}%)`,
              filter: `blur(${toNumber(mix(32, 52, siteLight.expansion))}px)`,
              opacity: siteLight.haloOpacity,
              mixBlendMode: 'screen',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: `${toNumber(mix(-2, -10, siteLight.expansion))}px`,
              left: '50%',
              width: `min(${toNumber(1320 * siteLight.spread * mix(0.88, 1.3, siteLight.expansion))}px, 166vw)`,
              height: `${toNumber(mix(132, 178, siteLight.expansion))}vh`,
              transform: 'translateX(-50%)',
              opacity: siteLight.beamOpacity,
              mixBlendMode: 'screen',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: '52%',
                height: '100%',
                transform: `translateX(-100%) rotate(${toNumber(mix(-10, -13, siteLight.expansion))}deg)`,
                transformOrigin: 'top right',
                background:
                  `linear-gradient(180deg, rgba(206, 253, 255, ${toNumber(siteLight.beamOpacity * 0.16)}) 0%, rgba(102, 242, 255, ${toNumber(siteLight.beamOpacity * 0.13)}) 14%, rgba(24, 206, 230, ${toNumber(siteLight.beamOpacity * 0.08)}) 40%, rgba(8, 108, 136, ${toNumber(siteLight.beamOpacity * 0.03)}) 70%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(36, 196, 220, ${toNumber(siteLight.beamOpacity * 0.04)}) 24%, rgba(214, 253, 255, ${toNumber(siteLight.beamOpacity * 0.16)}) 56%, rgba(76, 230, 246, ${toNumber(siteLight.beamOpacity * 0.08)}) 78%, transparent 100%)`,
                filter: `blur(${toNumber(mix(22, 30, siteLight.expansion))}px)`,
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: '52%',
                height: '100%',
                transform: `rotate(${toNumber(mix(10, 13, siteLight.expansion))}deg)`,
                transformOrigin: 'top left',
                background:
                  `linear-gradient(180deg, rgba(206, 253, 255, ${toNumber(siteLight.beamOpacity * 0.16)}) 0%, rgba(102, 242, 255, ${toNumber(siteLight.beamOpacity * 0.13)}) 14%, rgba(24, 206, 230, ${toNumber(siteLight.beamOpacity * 0.08)}) 40%, rgba(8, 108, 136, ${toNumber(siteLight.beamOpacity * 0.03)}) 70%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(76, 230, 246, ${toNumber(siteLight.beamOpacity * 0.08)}) 22%, rgba(214, 253, 255, ${toNumber(siteLight.beamOpacity * 0.16)}) 44%, rgba(36, 196, 220, ${toNumber(siteLight.beamOpacity * 0.04)}) 76%, transparent 100%)`,
                filter: `blur(${toNumber(mix(22, 30, siteLight.expansion))}px)`,
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: '30%',
                height: '100%',
                transform: 'translateX(-50%)',
                background:
                  `linear-gradient(180deg, rgba(228, 255, 255, ${toNumber(siteLight.beamOpacity * 0.18)}) 0%, rgba(120, 244, 255, ${toNumber(siteLight.beamOpacity * 0.12)}) 18%, rgba(30, 198, 224, ${toNumber(siteLight.beamOpacity * 0.06)}) 48%, transparent 100%)`,
                filter: `blur(${toNumber(mix(18, 24, siteLight.expansion))}px)`,
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: `${toNumber(mix(10, 18, siteLight.expansion))}px`,
              left: '50%',
              width: `min(${toNumber(640 * siteLight.spread * mix(0.94, 1.54, siteLight.expansion))}px, 84vw)`,
              height: `${toNumber(mix(88, 130, siteLight.expansion))}px`,
              transform: 'translateX(-50%)',
              background:
                `radial-gradient(ellipse at center, rgba(255, 255, 255, ${toNumber(siteLight.coreOpacity * 0.92)}) 0%, rgba(196, 254, 255, ${toNumber(siteLight.coreOpacity * 0.84)}) 18%, rgba(86, 238, 255, ${toNumber(siteLight.coreOpacity * 0.4)}) 48%, transparent 100%)`,
              filter: `blur(${toNumber(mix(24, 34, siteLight.expansion))}px)`,
              opacity: toNumber(siteLight.coreOpacity * 0.92),
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: `${toNumber(mix(20, 34, siteLight.expansion))}px`,
              left: '50%',
              width: `min(${toNumber(1200 * siteLight.spread * mix(0.82, 1.42, siteLight.expansion))}px, 156vw)`,
              height: `${toNumber(mix(250, 520, siteLight.expansion))}px`,
              transform: 'translateX(-50%)',
              background:
                `radial-gradient(ellipse at center, rgba(128, 246, 255, ${toNumber(siteLight.washOpacity * 0.24)}) 0%, rgba(52, 222, 242, ${toNumber(siteLight.washOpacity * 0.12)}) 42%, rgba(12, 104, 128, ${toNumber(siteLight.washOpacity * 0.04)}) 68%, transparent 100%)`,
              filter: `blur(${toNumber(mix(44, 64, siteLight.expansion))}px)`,
              opacity: siteLight.washOpacity,
              mixBlendMode: 'screen',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: `${toNumber(mix(44, 56, siteLight.expansion))}px`,
              left: '50%',
              width: `min(${toNumber(1940 * siteLight.spread * mix(0.78, 1.18, siteLight.expansion))}px, 186vw)`,
              height: `${toNumber(mix(140, 188, siteLight.expansion))}vh`,
              transform: 'translateX(-50%)',
              background:
                `linear-gradient(180deg, rgba(92, 238, 255, ${toNumber(siteLight.washOpacity * 0.14)}) 0%, rgba(28, 188, 214, ${toNumber(siteLight.washOpacity * 0.1)}) 18%, rgba(8, 82, 104, ${toNumber(siteLight.washOpacity * 0.045)}) 44%, rgba(4, 22, 38, ${toNumber(siteLight.washOpacity * 0.018)}) 68%, transparent 92%)`,
              filter: `blur(${toNumber(mix(30, 44, siteLight.expansion))}px)`,
              opacity: siteLight.washOpacity,
              mixBlendMode: 'screen',
            }}
          />

        </div>
      </div>
    </>
  );
};

export default LogoBackdrop;
