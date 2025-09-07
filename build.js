const fs = require("fs");
const path = require("path");
const glob = require("glob");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data", "m");
const TPL = fs.readFileSync(path.join(ROOT, "templates", "memorial.html"), "utf8");
const PUB = path.join(ROOT, "public");
const PUB_MEM = path.join(PUB, "m");

function esc(s){return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function ensureDir(p){fs.mkdirSync(p,{recursive:true});}

function render(d){
  const photos = (d.photos||[]).map(u=>`<img loading="lazy" src="${esc(u)}" alt="photo">`).join("");
  const videos = (d.videoEmbeds||[]).map(u=>`<iframe loading="lazy" src="${esc(u)}" allowfullscreen></iframe>`).join("");
  return TPL
    .replaceAll("{{fullName}}", esc(d.fullName))
    .replaceAll("{{birthDate}}", esc(d.birthDate||""))
    .replaceAll("{{deathDate}}", esc(d.deathDate||""))
    .replace("{{bioHtml}}", esc(d.bio||"").replace(/\n/g,"<br/>"))
    .replace("{{photos}}", photos?`<section class="gallery">${photos}</section>`:"")
    .replace("{{videos}}", videos?`<section class="videos">${videos}</section>`:"")
    .replace("{{noindex}}", d.seoIndexing ? "" : `<meta name="robots" content="noindex, noarchive">`);
}

function build(){
  ensureDir(PUB); ensureDir(PUB_MEM);
  const files = glob.sync(path.join(DATA_DIR, "*.json"));
  for (const f of files){
    const d = JSON.parse(fs.readFileSync(f,"utf8"));
    if(!d.id) throw new Error(`Нет id в ${f}`);
    const dir = path.join(PUB_MEM, d.id);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir,"index.html"), render(d));
  }
  const index = files.map(f=>{
    const d = JSON.parse(fs.readFileSync(f,"utf8"));
    return `<a class="card" href="/m/${esc(d.id)}/"><b>${esc(d.fullName)}</b></a>`;
  }).join("");
  fs.writeFileSync(path.join(PUB,"index.html"),
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="/assets/site.css"/><title>Мемориалы</title></head><body><main class="wrap"><h1>Мемориалы</h1><div class="index-list">${index}</div></main></body></html>`
  );
  console.log(\`Built \${files.length} memorial(s).\`);
}
build();
