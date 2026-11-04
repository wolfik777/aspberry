import { cp, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editions, links, milestones, commands, games } from '../src/edition.mjs';
import { icon, cancellation, flourish } from '../src/art.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, process.env.ASPBERRY_OUTPUT || 'dist');
const base = new URL(process.env.ASPBERRY_BASE_URL || 'https://wolfik777.github.io/aspberry-site/');
if (!base.pathname.endsWith('/')) base.pathname += '/';
const htmlEscape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const external = 'target="_blank" rel="noopener noreferrer"';
const pageUrl = language => new URL(language === 'ja' ? 'ja.html' : '', base).href;

const recordings = [
  {
    asset: 'vod-halloween.webp', duration: '5:45:30',
    ru: 'Криповый косплей в честь Хэллоуина', ja: 'ハロウィーンのちょっと怖いコスプレ',
    type: 'vod', url: 'https://www.twitch.tv/videos/2915898357', source: 'Twitch · aspberry'
  },
  {
    asset: 'clip-pirate.webp', duration: '00:23',
    ru: 'По большей части Серёга пират', ja: '「だいたいセリョーガ・ピラート」',
    type: 'clip', url: 'https://www.twitch.tv/aspberry/clip/SmallWimpyBaboonPlanking-8EXbA0t5qBMa1x8t?range=7d', source: 'rob0cop28'
  },
  {
    asset: 'clip-water.webp', duration: '00:23',
    ru: 'Ватердроп', ja: 'ウォータードロップ',
    type: 'clip', url: 'https://www.twitch.tv/aspberry/clip/ArtisticVenomousPorcupineBudStar-3gOk1CRICEKbABSt?range=7d', source: 'veqlvet1'
  }
];

function render(language) {
  const t = editions[language];
  const isJapanese = language === 'ja';
  const self = pageUrl(language);
  const sourceNote = isJapanese
    ? 'プロフィールと節目の日付は本人のTwitch紹介欄より。Steamの活動とフォロワー数は2026年11月4日時点。表紙の猫の写真は、このファン通信のために提供されたものです。'
    : 'История и даты — из описания Тани на Twitch. Фолловеры и активность Steam — снимок на 4 ноября 2026 года. Фотографию с котятами предоставил зритель, предложивший этот фан-журнал.';
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': base.href + '#website', name: 'aspberry · ' + t.fanNote, url: base.href, inLanguage: ['ru', 'ja'] },
      { '@type': 'WebPage', '@id': self + '#page', name: t.title, description: t.description, url: self, inLanguage: language, isPartOf: { '@id': base.href + '#website' }, dateModified: '2026-11-04', about: { '@type': 'Person', name: 'Таня', alternateName: 'aspberry', sameAs: [links.twitch] } }
    ]
  };
  const poster = `<picture><source type="image/webp" srcset="./assets/sakura-512.webp 512w, ./assets/sakura-896.webp 896w, ./assets/sakura-1360.webp 1360w" sizes="(max-width: 700px) 92vw, (max-width: 1020px) 55vw, 660px"><img src="./assets/sakura-cats.jpg" width="1536" height="1136" alt="${t.heroAlt}" fetchpriority="high"></picture>`;
  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlEscape(t.title)}</title>
  <meta name="description" content="${htmlEscape(t.description)}">
  <meta name="theme-color" content="#f5f5f0">
  <meta name="color-scheme" content="light">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${self}">
  <link rel="alternate" hreflang="ru" href="${pageUrl('ru')}">
  <link rel="alternate" hreflang="ja" href="${pageUrl('ja')}">
  <link rel="alternate" hreflang="x-default" href="${pageUrl('ru')}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="aspberry · fan journal">
  <meta property="og:title" content="${htmlEscape(t.title)}">
  <meta property="og:description" content="${htmlEscape(t.description)}">
  <meta property="og:url" content="${self}">
  <meta property="og:locale" content="${t.locale}">
  <meta property="og:locale:alternate" content="${isJapanese ? 'ru_RU' : 'ja_JP'}">
  <meta property="og:image" content="${new URL('assets/social-sakura.jpg', base).href}">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${t.heroAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${htmlEscape(t.title)}">
  <meta name="twitter:description" content="${htmlEscape(t.description)}">
  <meta name="twitter:image" content="${new URL('assets/social-sakura.jpg', base).href}">
  <link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">
  <link rel="stylesheet" href="./assets/site.css">
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
  <script defer src="./assets/site.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">${t.skip}</a>
  <div class="airmail" aria-hidden="true"></div>
  <header class="masthead wrap" id="top">
    <a class="brand" href="#top" aria-label="aspberry">
      <span class="brand-icon">${icon('cat')}</span><span>aspberry<span class="brand-sub">FAN JOURNAL</span></span>
    </a>
    <nav class="main-nav" aria-label="${t.navLabel}">
      <a href="#tanya">${t.nav[0]}</a><a href="#broadcast">${t.nav[1]}</a><a href="#chat">${t.nav[2]}</a>
    </nav>
    <div class="head-controls">
      <div class="languages" role="group" aria-label="${t.languageLabel}">
        <a href="./index.html" lang="ru" hreflang="ru" ${!isJapanese ? 'aria-current="page"' : ''}>RU</a><span aria-hidden="true">/</span><a href="./ja.html" lang="ja" hreflang="ja" ${isJapanese ? 'aria-current="page"' : ''}>日本語</a>
      </div>
      <button class="sound icon-button" type="button" aria-pressed="false" aria-label="${t.soundOff}" data-off="${t.soundOff}" data-on="${t.soundOn}" hidden>${icon('mute', 'sound-muted')}${icon('sound', 'sound-playing')}</button>
    </div>
  </header>
  <main id="main">
    <section class="hero wrap" aria-labelledby="hello-title">
      <div class="hero-copy">
        <p class="eyebrow">${icon('flower')} ${t.heroKicker} <span class="issue">/ ${t.issue}</span></p>
        <h1 id="hello-title">${t.heroTitle[0]}<br><em>${t.heroTitle[1]}</em>${flourish}</h1>
        <p class="intro">${t.heroDesc}</p>
        <div class="hero-actions"><a class="button primary" href="${links.twitch}" ${external}>${icon('twitch')}${t.twitchCta}</a><a class="text-link" href="#tanya">${t.journalCta}</a></div>
        <p class="hero-footer"><span class="fine-dots" aria-hidden="true">•••</span> ${t.month} <span>/</span> TWITCH @ASPBERRY</p>
      </div>
      <figure class="cover">
        <div class="photo-sheet" data-tilt>
          <div class="photo-topline"><span>${t.coverLabel}</span><span class="photo-stars" aria-hidden="true">✧ · ♡ · ✧</span><span>ASPBERRY</span></div>
          <a class="photo-open" href="./assets/sakura-cats.jpg" aria-label="${t.photoOpen}">${poster}<span class="expand-label">${icon('expand')}<span>${t.photoOpen}</span></span></a>
          <figcaption><span>${t.photoNo}</span><span>${t.photoCaption}</span>${icon('flower')}</figcaption>
        </div>
        <span class="stamp-label" aria-hidden="true">${t.printMark}<b>16.05<br>2024</b></span>
        ${cancellation}
        <span class="cover-side" aria-hidden="true">A LITTLE SOFTER, A LITTLE CLOSER</span>
      </figure>
    </section>
    <div class="facts wrap" aria-label="${t.fanNote}">
      <div><span class="tiny">${t.facts[0]}</span><strong>16.05.24</strong></div>
      <div><span class="tiny">${t.facts[1]}</span><strong>${t.followers}</strong></div>
      <div><span class="tiny">${t.facts[2]}</span><strong class="word-stat">${t.streamLanguage}</strong></div>
      <span class="facts-art" aria-hidden="true">${icon('spark')} <span>soft days<br>good company</span></span>
    </div>

    <section class="story section wrap" id="tanya" aria-labelledby="story-title">
      <div class="section-head"><p class="eyebrow"><span class="section-number">01</span> ${t.storyKicker}</p><span class="margin-label" aria-hidden="true">PROFILE / 01</span></div>
      <div class="story-grid">
        <div class="story-copy"><h2 id="story-title">${t.storyHeading}</h2><p class="pull-quote" lang="ru">${t.hello}</p><p class="quote-credit">${t.helloNote}</p>${t.storyBody.map(p => `<p>${p}</p>`).join('')}<div class="birthday">${icon('sun')}<span><span class="tiny">${t.birthdayLabel}</span><strong>${t.birthday}</strong></span></div></div>
        <div class="timeline-sheet">
          <p class="sheet-kicker">${icon('book')} ${t.timeline}</p>
          <ol class="timeline">${milestones.map((m, i) => `<li><span class="timeline-index" aria-hidden="true">0${i + 1}</span><div><time datetime="${m[0]}">${m[isJapanese ? 2 : 1]}</time><h3>${m[isJapanese ? 4 : 3]}</h3></div>${icon(i === 3 ? 'heart' : 'spark')}</li>`).join('')}</ol>
          <a href="${links.about}" class="source-link" ${external}>${t.sourceAbout}</a>
          <span class="paper-pin" aria-hidden="true"></span>
        </div>
      </div>
    </section>

    <section class="broadcast section" id="broadcast" aria-labelledby="broadcast-title">
      <div class="wrap"><div class="section-head"><p class="eyebrow"><span class="section-number">02</span> ${t.archiveKicker}</p><span class="margin-label" aria-hidden="true">REPLAY / 02</span></div>
      <div class="section-intro"><h2 id="broadcast-title">${t.archiveHeading}</h2><p>${t.archiveIntro}</p></div>
      <div class="replays">${recordings.map((r, i) => `<article class="replay ${i === 0 ? 'replay-featured' : ''}">
        <a href="${htmlEscape(r.url)}" ${external} class="replay-picture" aria-label="${r[language]} — ${r.type === 'vod' ? t.openVod : t.openClip}">
          <img src="./assets/${r.asset}" width="${i === 0 ? '320' : '800'}" height="${i === 0 ? '180' : '450'}" loading="lazy" decoding="async" alt="${htmlEscape(r[language])}">
          <span class="play">${icon('play')}</span><span class="timecode" aria-label="${t.timeLabel} ${r.duration}">${r.duration}</span>
        </a><div class="replay-caption"><p class="tiny">${r.type === 'vod' ? t.vodSource : t.clipSource} <span>· ${r.source}</span></p><h3><a href="${htmlEscape(r.url)}" ${external}>${r[language]}</a></h3><a class="small-link" href="${htmlEscape(r.url)}" ${external}>${r.type === 'vod' ? t.openVod : t.openClip}</a></div></article>`).join('')}</div>
      <div class="archive-footer"><a href="${links.clips}" ${external}>${t.allClips}</a><a href="${links.video}" ${external}>${t.allVods}</a><a href="${links.schedule}" ${external}>${t.schedule}</a></div></div>
    </section>

    <section class="video-letter section wrap" id="video" aria-labelledby="video-title">
      <div class="section-head"><p class="eyebrow"><span class="section-number">✦</span> ${t.videoKicker}</p><span class="margin-label" aria-hidden="true">VIDEO / 05</span></div>
      <div class="video-letter-grid">
        <div><h2 id="video-title">${t.videoHeading}</h2><p>${t.videoIntro}</p><div class="video-actions"><a class="button primary" href="./assets/926.mp4" target="_blank" rel="noopener">${icon('play')}${t.videoOpen}</a><a class="text-link" href="https://github.com/wolfik777/aspberry-site/blob/main/docs/assets/926.mp4" target="_blank" rel="noopener">${t.videoGithub}</a></div></div>
        <video class="tribute-video" controls preload="metadata" playsinline poster="./assets/social-sakura.jpg"><source src="./assets/926.mp4" type="video/mp4"><a href="./assets/926.mp4">${t.videoOpen}</a></video>
      </div>
    </section>

    <section class="games section wrap" aria-labelledby="games-title">
      <div class="section-head"><p class="eyebrow"><span class="section-number">03</span> ${t.gamesKicker}</p><a class="source-link" href="${links.steam}" ${external}>${t.gameSource}</a></div>
      <div class="games-grid"><div class="games-copy"><h2 id="games-title">${t.gamesHeading}</h2><p>${t.gameDesc}</p><div class="mini-postcard" aria-hidden="true"><span>PLAY, REST,<br>REPEAT.</span>${icon('cat')}<span class="postcard-star">✧</span></div></div>
      <ol class="game-list">${games.map((g, i) => `<li><a href="${g.url}" ${external}><span class="game-index">0${i + 1}</span><img src="./assets/${g.asset}" width="184" height="69" loading="lazy" alt="${htmlEscape(g.name)}"><span class="game-info"><strong>${htmlEscape(g.name)}</strong><span>${t.lastPlayed} ${isJapanese ? t.monthShort + Number(g.day) + '日' : g.day + ' ' + t.monthShort}</span></span><span class="game-hours">${g.hours[isJapanese ? 1 : 0]}<small>${t.hours}</small></span></a></li>`).join('')}</ol></div>
    </section>

    <section class="chat-section section" id="chat" aria-labelledby="chat-title">
      <div class="wrap"><div class="section-head"><p class="eyebrow"><span class="section-number">04</span> ${t.chatKicker}</p><span class="margin-label" aria-hidden="true">CHAT / 04</span></div>
      <div class="chat-grid"><div class="chat-copy"><h2 id="chat-title">${t.chatHeading}</h2><p>${t.chatDesc}</p>
      <div class="command-tabs" role="group" aria-label="${t.cmdGroup}" hidden>${commands.slice(0,4).map((c, i) => `<button type="button" data-command="${c[0]}" data-description="${htmlEscape(c[isJapanese ? 2 : 1])}" aria-pressed="${i === 0}">${c[0]}</button>`).join('')}</div><noscript><p>${t.nojs}</p></noscript></div>
      <div class="chat-window">
        <div class="window-chrome"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>TWITCH / ASPBERRY</span>${icon('chat')}</div>
        <div class="chat-screen"><span class="bot-avatar" aria-hidden="true">${icon('cat')}</span><div><p class="bot-label">${isJapanese ? 'ブーブリクのコマンド帳' : 'Бублик · справочник команд'}</p><code id="selected-command">!обнять</code><p id="command-description">${commands[0][isJapanese ? 2 : 1]}</p></div></div>
        <button class="copy-command" type="button" data-copied="${t.copied}" data-failure="${t.copyFail}" hidden>${icon('copy')}<span>${t.copy}</span></button>
      </div></div>
      <div class="accordions">
        <details><summary>${t.allCommands}<span aria-hidden="true">+</span></summary><dl class="command-list">${commands.map(c=>`<div><dt><code>${c[0]}</code></dt><dd>${c[isJapanese ? 2 : 1]}</dd></div>`).join('')}</dl></details>
        <details><summary>${t.rulesTitle}<span aria-hidden="true">+</span></summary><ul class="rules">${t.rules.map(p=>`<li>${p}</li>`).join('')}</ul></details>
        <details><summary>${t.gearTitle}<span aria-hidden="true">+</span></summary><p>${t.gear}</p></details>
      </div></div>
    </section>

    <section class="farewell section wrap" aria-labelledby="farewell-title">
      <p class="eyebrow">${icon('flower')} ${t.farewellKicker}</p><h2 id="farewell-title">${t.farewell}</h2><p>${t.farewellText}</p>
      <div class="community-links"><a class="button primary" href="${links.twitch}" ${external}>${icon('twitch')}Twitch</a><a class="button outline" href="${links.telegram}" ${external}>Telegram</a><a class="button outline" href="${links.discord}" ${external}>Discord</a></div>
      <div class="support"><a href="${links.donate}" class="support-link" ${external}>${icon('heart')}${t.donate}</a><p>${t.donateNote}</p></div>
      <aside class="dedication"><span aria-hidden="true">✧</span><p>${t.dedication}</p><span>${t.dedicationNote}</span></aside>
    </section>
  </main>
  <footer class="footer"><div class="wrap"><div class="footer-top"><a href="#top" class="brand">${icon('cat')}<span>aspberry</span></a><p>${t.fanNote}<span>${t.published}</span></p><a href="#top" class="text-link">${t.back}</a></div>
    <details class="credits"><summary>${t.credits}</summary><p>${sourceNote}</p><div><a href="${links.about}" ${external}>Twitch</a><a href="${links.steam}" ${external}>Steam</a><a href="${links.donate}" ${external}>DonateX</a></div></details>
    <div class="footer-bottom"><span>ASPBERRY / FAN JOURNAL / 2026</span><div class="languages"><a lang="ru" hreflang="ru" href="./index.html">Русский</a><span>/</span><a lang="ja" hreflang="ja" href="./ja.html">日本語</a></div><span aria-hidden="true">MADE WITH CARE ♡</span></div>
  </div></footer>
  <dialog id="photo-dialog" aria-label="${t.photoCaption}"><button class="close-dialog icon-button" aria-label="${t.photoClose}">${icon('close')}</button><img src="./assets/sakura-cats.jpg" width="1536" height="1136" alt="${t.heroAlt}" loading="lazy"><p>${t.photoCaption}</p></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
</body></html>`;
}

await mkdir(output, { recursive: true });
const sourceAssets = resolve(root, existsSync(resolve(root, 'assets')) ? 'assets' : 'docs/assets');
if (sourceAssets !== resolve(output, 'assets')) await cp(sourceAssets, resolve(output, 'assets'), { recursive: true });
for (const language of ['ru', 'ja']) {
  await writeFile(resolve(output, language === 'ru' ? 'index.html' : 'ja.html'), render(language));
}
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${pageUrl('ru')}</loc><lastmod>2026-11-04</lastmod></url>
  <url><loc>${pageUrl('ja')}</loc><lastmod>2026-11-04</lastmod></url>
</urlset>
`);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: ${new URL('sitemap.xml', base).href}
`);
await writeFile(resolve(output, '.nojekyll'), '');
console.log(`Rendered RU + JA at ${output}; canonical base ${base.href}`);
