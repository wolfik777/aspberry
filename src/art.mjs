const lines = {
  cat: '<path d="M4 12 5 4l5.5 4a13 13 0 0 1 3 0L19 4l1 8c2.5 7.8-4.7 9-8 9S1.7 19.9 4 12Z"/><path d="M7.5 13.5h.1m8.8 0h.1M10.8 16l1.2 1 1.2-1M1.4 14.6l3.2.6m-2.4 2.9 2.7-1m17.7-2.5-3.2.6m2.4 2.9-2.7-1"/>',
  twitch: '<path d="M4 3h17v12l-5 5h-5l-3 3v-3H3V5z"/><path d="M10 7v6m5-6v6"/>',
  sound: '<path d="M3 10h3.5L12 5v14l-5.5-5H3zM16 9a4.5 4.5 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
  mute: '<path d="M3 10h3.5L12 5v14l-5.5-5H3zM17 10l4 4m0-4-4 4"/>',
  menu: '<path d="M3 7h18M7 12h14M3 17h18"/>',
  flower: '<path d="M12 8c-5.5-9-11 1.5-4.6 3-9.3-1.3-6.2 9.1.9 5.2-4 8.1 6.9 8.8 6 1 4.3 7.7 11.1-.9 3.2-4.4 9.8-1.3 3.1-10.9-2.1-4.8C17-1 6-.2 12 8Z"/><circle cx="12" cy="12" r="1.4"/>',
  book: '<path d="M12 6C9.3 4.5 6 4 2.5 5v13.5c3.6-1 6.8-.4 9.5 1.2 2.7-1.6 5.9-2.2 9.5-1.2V5c-3.5-1-6.8-.5-9.5 1zm0 0v13"/>',
  sun: '<circle cx="12" cy="12" r="4.4"/><path d="M12 1.7v3m0 14.6v3m10.3-10.3h-3M4.7 12h-3M19.4 4.6l-2.2 2.2M6.8 17.2l-2.2 2.2M4.6 4.6l2.2 2.2m10.4 10.4 2.2 2.2"/>',
  spark: '<path d="M12 2c.4 6 2.8 8.8 10 10-7.2 1.2-9.6 4-10 10-.4-6-2.8-8.8-10-10 7.2-1.2 9.6-4 10-10Z"/>',
  expand: '<path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5"/>',
  chat: '<path d="M20 4H4v13h5v4l5-4h6z"/><path d="M7 10h.1m4.8 0h.1m4.7 0h.1"/>',
  heart: '<path d="M12 20S2.7 14.5 2.7 8.7a5 5 0 0 1 9.3-2.5 5 5 0 0 1 9.3 2.5C21.3 14.5 12 20 12 20Z"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
  mail: '<rect x="2" y="5" width="20" height="14" rx="1.5"/><path d="m3 6 9 7 9-7m-18 12 6-6m12 6-6-6"/>',
  close: '<path d="m5 5 14 14m0-14L5 19"/>',
  play: '<path d="m8 4 12 8-12 8z" fill="currentColor" stroke="none"/>'
};

export function icon(name, extra = '') {
  return `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${lines[name]}</svg>`;
}

export const cancellation = `<svg class="cancel-mark" viewBox="0 0 220 112" aria-hidden="true" focusable="false" fill="none" stroke="currentColor">
  <defs><path id="stamp-top" d="M16 59a38 38 0 0 1 76 0"/><path id="stamp-bottom" d="M14 54a40 40 0 0 0 80 0"/></defs>
  <circle cx="54" cy="56" r="49" stroke-width="2.1"/><circle cx="54" cy="56" r="45" stroke-width="1"/><circle cx="54" cy="56" r="27" stroke-width="1" stroke-dasharray="2 4"/>
  <g font-family="Arial,sans-serif" font-size="9" letter-spacing="1.6" fill="currentColor" stroke="none" text-anchor="middle" font-weight="bold">
    <text><textPath href="#stamp-top" startOffset="50%">ASPBERRY</textPath></text><text><textPath href="#stamp-bottom" startOffset="50%">TWITCH CLUB</textPath></text>
  </g><g transform="translate(38 40) scale(1.36)" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${lines.cat}</g>
  <g stroke-width="1.7"><path d="M96 40c23-20 37 17 63 0s38-9 54-5"/><path d="M101 49c22-19 35 18 61 1s38-10 53-5"/><path d="M102 60c22-19 35 18 61 1s37-10 52-5"/><path d="M99 71c22-19 35 18 61 1s37-10 52-5"/></g></svg>`;

export const flourish = `<svg class="flourish" viewBox="0 0 95 68" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-linecap="round"><path d="M36 6c-3 19-8 24-23 27 16 0 25 7 27 22 2-15 8-23 20-26C46 28 40 22 36 6Z" stroke-width="2"/><path d="M74 24c-1 10-5 14-13 17 8 0 13 4 16 13 0-9 3-14 11-16-8-1-12-5-14-14Z" stroke-width="1.6"/><path d="M61 5v7m-4-3h8m-49 45v7m-4-3h8" stroke-width="1.4"/></g></svg>`;
