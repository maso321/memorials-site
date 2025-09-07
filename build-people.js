// build-people.js — создаёт страницы из data/people/*.json
import fs from "fs";
import path from "path";
import { glob } from "glob";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "people");
const TPL_FILE = path.join(ROOT, "templates", "person.html");
const OUT_DIR = path.join(ROOT, "public", "people");

// читаем шаблон
const tpl = fs.readFileSync(TPL_FILE, "utf8");

// пробегаем по всем JSON
const files = glob.sync(path.join(DATA_DIR, "*.json"));

if (files.length === 0) {
  console.log("Нет файлов в data/people/*.json");
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const file of files) {
  const person = JSON.parse(fs.readFileSync(file, "utf8"));
  const id = person.id || path.basename(file, ".json");

  // безопасно формируем блок фото
  const photoBlock = person.photo
    ? `<p><img src="${person.photo}" alt="${person.fullName}" style="max-width:320px;height:auto;border-radius:12px"></p>`
    : "";

  // рендерим HTML
  const html = tpl
    .replace(/{{fullName}}/g, person.fullName || "")
    .replace(/{{birthDate}}/g, person.birthDate || "")
    .replace(/{{deathDate}}/g, person.deathDate || "")
    .replace(/{{bio}}/g, person.bio || "")
    .replace(/{{photo}}/g, person.photo || "")
    .replace(/{{photoBlock}}/g, photoBlock);

  const personDir = path.join(OUT_DIR, id);
  fs.mkdirSync(personDir, { recursive: true });
  fs.writeFileSync(path.join(personDir, "index.html"), html, "utf8");

  console.log(`✅ Сгенерировано: public/people/${id}/index.html`);
}

