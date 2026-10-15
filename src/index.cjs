'use strict';

const TAU = Math.PI * 2;
const defaults = { step: 0.16, phase: 0, color: 'auto' };

function wrapPhase(value) {
  return ((value % TAU) + TAU) % TAU;
}

function hasColor(mode) {
  if (mode !== 'auto') return mode === 'always';

  const { NO_COLOR, FORCE_COLOR, TERM } = process.env;
  if (NO_COLOR) return false;
  if (FORCE_COLOR !== undefined) return FORCE_COLOR !== '0';
  return Boolean(process.stdout.isTTY) && TERM !== 'dumb';
}

function paint(text, r, g, b) {
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

function checkText(text) {
  if (typeof text !== 'string') throw new TypeError('Expected a string.');
}

function checkNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function createHueStep(options = {}) {
  let settings = { ...defaults };

  function configure(options = {}) {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
      throw new TypeError('Expected an options object.');
    }
    for (const key of Object.keys(options)) {
      if (!Object.hasOwn(defaults, key)) throw new TypeError(`Unknown option: ${key}`);
    }

    const next = { ...settings, ...options };
    checkNumber(next.step, 'step');
    checkNumber(next.phase, 'phase');
    if (!['auto', 'always', 'never'].includes(next.color)) {
      throw new TypeError('color must be "auto", "always" or "never".');
    }
    next.phase = wrapPhase(next.phase);
    settings = next;
    return instance;
  }

  function rgb(text, r, g, b) {
    checkText(text);
    if (![r, g, b].every(value => Number.isInteger(value) && value >= 0 && value <= 255)) {
      throw new RangeError('RGB channels must be integers from 0 to 255.');
    }
    return text && hasColor(settings.color) ? paint(text, r, g, b) : text;
  }

  function gradient(text, phase = 0) {
    checkText(text);
    checkNumber(phase, 'phase');
    if (!text || !hasColor(settings.color)) return text;

    const chars = Array.from(text);
    const length = chars.filter(char => char !== '\n' && char !== '\r').length;
    const offset = wrapPhase(phase);
    let index = 0;

    return chars.map(char => {
      if (char === '\n' || char === '\r') return char;
      const t = index++ / Math.max(length - 1, 1) * Math.PI * 1.5 + offset;
      const r = Math.round(150 + 105 * Math.sin(t));
      const g = Math.round(150 + 105 * Math.sin(t + 2.1));
      const b = Math.round(150 + 105 * Math.sin(t + 4.2));
      return paint(char, r, g, b);
    }).join('');
  }

  function autorgb(text) {
    const result = gradient(text, settings.phase);
    settings.phase = wrapPhase(settings.phase + settings.step % TAU);
    return result;
  }

  function reset(phase = 0) {
    checkNumber(phase, 'phase');
    settings.phase = wrapPhase(phase);
    return instance;
  }

  const instance = {
    rgb, gradient, autorgb, configure, reset, createHueStep,
    get phase() { return settings.phase; },
    get step() { return settings.step; },
    get color() { return settings.color; }
  };

  return configure(options);
}

module.exports = createHueStep();
