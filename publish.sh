#!/usr/bin/env bash
set -euo pipefail

# Publishes the ready-made docs/ directory to one specific GitHub repository.
asp_root=$(cd -- "$(dirname -- "$0")" && pwd)
asp_owner=wolfik777
asp_repo=aspberry-site
asp_full="$asp_owner/$asp_repo"
asp_settings="https://github.com/$asp_full/settings/pages"
asp_url="https://wolfik777.github.io/aspberry-site/"
fail() { echo "$*" >&2; exit 1; }
for asp_file in docs/index.html docs/ja.html docs/.nojekyll .aspberry-site; do
  test -f "$asp_root/$asp_file" || fail "В архиве отсутствует $asp_file. Распакуйте ZIP целиком."
done
for asp_tool in git gh curl; do
  command -v "$asp_tool" >/dev/null && continue
  command -v pkg >/dev/null || fail "Установите $asp_tool и запустите команду ещё раз."
  pkg install -y "$asp_tool"
done
export GH_HOST=github.com
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo "Войдите в GitHub как $asp_owner в открывшемся окне. Код подтверждается только на GitHub."
  gh auth login --hostname github.com --git-protocol https --web
fi
asp_account=$(gh api user --jq '.login')
test "$asp_account" = "$asp_owner" || fail "Сейчас выбран $asp_account. Выполните gh auth switch --user $asp_owner или войдите в нужный аккаунт."
gh auth setup-git --hostname github.com
asp_work=$(mktemp -d)
trap 'rm -rf -- "$asp_work"' EXIT
asp_err="$asp_work/api-error"
asp_endpoint="repos/$asp_full"
if ! asp_visibility=$(gh api "$asp_endpoint" --jq '.visibility' 2>"$asp_err"); then
  if ! grep -Fq 'HTTP 404' "$asp_err"; then cat "$asp_err" >&2; fail "GitHub не подтвердил доступ к репозиторию."; fi
  gh repo create "$asp_full" --public --description "Фан-журнал о Twitch-канале aspberry на русском и японском"
  asp_visibility=public
fi
test "$asp_visibility" = public || fail "Репозиторий $asp_full не публичный. Его видимость оставлена без изменений."
asp_checkout="$asp_work/source"
git clone --quiet "https://github.com/$asp_full.git" "$asp_checkout"
cd "$asp_checkout"
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  test "$(git branch --show-current)" = main || fail "Основная ветка существующего репозитория отличается от main. Публикация остановлена."
  if ! cmp -s .aspberry-site "$asp_root/.aspberry-site"; then
    if test "$(git ls-tree -r --name-only HEAD)" != README.md || ! grep -Eiq '^# *aspberry-site[[:space:]]*$' README.md || test "$(grep -c '[^[:space:]]' README.md)" != 1; then
      fail "В $asp_full уже есть другой проект. Его файлы не изменены."
    fi
  fi
else
  git checkout -q -B main
fi
for asp_item in docs src scripts README.md publish.sh .aspberry-site; do
  cp -R "$asp_root/$asp_item" .
done
chmod +x publish.sh
git add -- docs src scripts README.md publish.sh .aspberry-site
if ! git diff --cached --quiet; then
  if ! git config user.name >/dev/null; then git config user.name "$asp_owner"; fi
  if ! git config user.email >/dev/null; then
    asp_id=$(gh api user --jq '.id')
    git config user.email "$asp_id+$asp_owner@users.noreply.github.com"
  fi
  git commit -qm "Publish aspberry fan journal in Russian and Japanese"
fi
git push --set-upstream origin main

if asp_source=$(gh api "$asp_endpoint/pages" --jq '[.build_type, (.source.branch // ""), (.source.path // ""), (.cname // "")] | join("|")' 2>"$asp_err"); then
  case "$asp_source" in *'|') ;; *) fail "У Pages уже настроен собственный домен. Проверьте его вручную: $asp_settings";; esac
  if test "$asp_source" != 'legacy|main|/docs|'; then
    gh api --silent -X PUT "$asp_endpoint/pages" -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/docs' || fail "Файлы загружены. В Settings → Pages выберите Deploy from a branch, main, /docs: $asp_settings"
  fi
else
  if ! grep -Fq 'HTTP 404' "$asp_err"; then cat "$asp_err" >&2; fail "Не удалось прочитать настройки Pages: $asp_settings"; fi
  gh api --silent -X POST "$asp_endpoint/pages" -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/docs' || fail "Файлы загружены. Для включения Pages нужны права администратора: $asp_settings"
fi
echo "Файлы в main, GitHub Pages настроен на /docs. Проверяю обе опубликованные страницы…"
asp_sha=$(git rev-parse HEAD)
for asp_attempt in $(seq 1 18); do
  if curl -fsSL --max-time 8 "$asp_url?rev=$asp_sha" -o "$asp_work/ru" 2>/dev/null &&
     cmp -s docs/index.html "$asp_work/ru" &&
     curl -fsSL --max-time 8 "$asp_url""ja.html?rev=$asp_sha" -o "$asp_work/ja" 2>/dev/null &&
     cmp -s docs/ja.html "$asp_work/ja"; then
    echo "Опубликовано и проверено: $asp_url"
    exit 0
  fi
  sleep 4
done
echo "GitHub принял файлы. Появление этой версии по адресу $asp_url пока не подтверждено."
echo "Статус публикации: $asp_settings"
