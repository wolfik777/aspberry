import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(project, process.env.ASPBERRY_OUTPUT || 'docs');
const base = new URL(process.env.ASPBERRY_BASE_URL || 'https://wolfik777.github.io/aspberry-site/');
const read = file => readFileSync(resolve(dir, file), 'utf8');
const count = (s, pattern) => [...s.matchAll(pattern)].length;
const sitemap = read('sitemap.xml');
assert.equal(count(sitemap, /<loc>/g), 2);
assert(read('robots.txt').includes(new URL('sitemap.xml', base).href));
assert(existsSync(resolve(dir, '.nojekyll')));
assert(!readdirSync(dir).some(name=>/qa|test/i.test(name)));
for (const [lang,file] of [['ru','index.html'], ['ja','ja.html']]) {
  const html = read(file);
  const self = new URL(lang === 'ru' ? '' : file, base).href;
  assert(html.includes('<html lang="'+lang+'">'));
  assert(html.includes('rel="canonical" href="'+self+'"'));
  assert(sitemap.includes('<loc>'+self+'</loc>'));
  assert.equal(count(html, /<h1[\s>]/g), 1);
  assert.equal(count(html, /hreflang="[^"]+" href="https:/g), 3);
  assert.equal(count(html, /<time datetime=/g), 4);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), 'Missing anchor '+id);
  for (const [,asset] of html.matchAll(/\.\/([A-Za-z0-9./_-]+\.(?:jpg|webp|svg|css|js|html|mp4))/g)) assert(existsSync(resolve(dir,asset)), 'Missing '+asset);
  for (const [,target] of html.matchAll(/href="(https:[^"]+)"[^>]+target="_blank"/g)) assert(!target.includes('undefined'));
  assert(html.includes('https://www.twitch.tv/aspberry"'));
  assert(html.includes('https://steamcommunity.com/profiles/76561199697756785/'));
  assert(html.includes('https://donatex.gg/donate/aspberry'));
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  assert(data['@graph'].some(v=>v.url===self && v.inLanguage===lang));
  for (const [,image] of html.matchAll(/(<img [^>]+>)/g)) assert(/ alt="[^"]*"/.test(image));
}
for (const [,single,double,unquoted] of read('assets/site.css').matchAll(/url\((?:'([^']*)'|"([^"]*)"|([^'")]+))\)/g)) {
  const file = single || double || unquoted;
  if (!file.startsWith('data:')) assert(existsSync(resolve(dir,'assets',file)),file);
}
console.log('OK: two editions, SEO metadata, correct channel, anchors and local media.');
