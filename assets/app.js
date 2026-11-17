/* =====================================================
   Code commun à toutes les pages du site.
   Tout le contenu (articles, catégories, pages, réglages) se modifie
   depuis /admin : ce fichier n'a normalement jamais besoin d'être touché.
   ===================================================== */
(function(){
"use strict";

const PAGE = document.body.dataset.page;           // home | categorie | page | contact
const $ = id => document.getElementById(id);
const CHANNELS = [
  {key:"leboncoin", label:"Acheter sur Leboncoin", cls:"lbc"},
  {key:"vinted",    label:"Acheter sur Vinted",    cls:"vinted"},
  {key:"ebay",      label:"Acheter sur eBay",      cls:"ebay"}
];
const placeholder = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#242a4a"/><text x="200" y="215" font-size="64" text-anchor="middle" fill="#7c5cff">🎮</text></svg>');

let site = {}, products = [], categories = [], pages = [];

/* ---------- Outils ---------- */
const getJSON = f => fetch("/content/"+f+"?t="+Date.now(), {cache:"no-cache"}).then(r=>{ if(!r.ok) throw new Error(f); return r.json(); });
const slugify = s => (s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
function fixPrice(p){ p=(p||"").trim(); return /^\d+([.,]\d+)?$/.test(p) ? p.replace(".",",")+" €" : p; }
function md(el, text){
  text = text||"";
  if(window.marked && window.DOMPurify){ el.innerHTML = DOMPurify.sanitize(marked.parse(text)); }
  else { el.textContent = text; el.style.whiteSpace = "pre-wrap"; }
}
function routeSlug(kind){
  const m = location.pathname.match(new RegExp("/"+kind+"/([^/]+)"));
  if(m){ try{ return decodeURIComponent(m[1]).replace(/\.html$/,""); }catch(e){ return m[1]; } }
  return new URLSearchParams(location.search).get(kind==="categorie" ? "c" : "p") || "";
}
const catOf = p => p.categorie || "Autres";
function byLatest(a,b){
  const ha=!isNaN(a._t), hb=!isNaN(b._t);
  if(ha&&hb&&a._t!==b._t) return b._t-a._t;
  if(ha&&!hb) return -1;
  if(!ha&&hb) return 1;
  return a._i-b._i;
}
/* Catégories qui contiennent au moins un article, dans l'ordre choisi dans l'admin */
function catNames(){
  const used = new Set(products.map(catOf));
  const ordered = categories.map(c=>c.nom).filter(n=>used.has(n));
  const extra = [...used].filter(n=>!ordered.includes(n)).sort((a,b)=>a.localeCompare(b,"fr"));
  return [...ordered, ...extra];
}
function setTitle(part){ const t=(site.titre||"La Boutique du Geek"); document.title = part ? part+" – "+t : t+" – Occasions geek, jeux, collection"; }

/* ---------- Statistiques (Google Analytics) ---------- */
function track(name, params){ try{ if(window.gtag && consent()==="yes") window.gtag("event", name, params||{}); }catch(e){} }

/* ---------- Consentement cookies + chargement Google ---------- */
const CK = "bdg_consent";
function consent(){ try{ return localStorage.getItem(CK); }catch(e){ return null; } }
function setConsent(v){ try{ localStorage.setItem(CK, v); }catch(e){} }
const GA_RE=/^G-[A-Z0-9]+$/, ADS_RE=/^AW-\d+$/, PUB_RE=/^ca-pub-\d+$/, SLOT_RE=/^\d+$/;
const ids = () => ({
  ga:   GA_RE.test((site.ga_id||"").trim())   ? site.ga_id.trim()   : "",
  ads:  ADS_RE.test((site.gads_id||"").trim()) ? site.gads_id.trim() : "",
  pub:  PUB_RE.test((site.adsense_client||"").trim()) ? site.adsense_client.trim() : "",
  slot: SLOT_RE.test((site.adsense_slot||"").trim())  ? site.adsense_slot.trim()   : ""
});
let googleLoaded = false;
function loadGoogle(){
  if(googleLoaded) return; googleLoaded = true;
  const {ga, ads, pub, slot} = ids();
  const first = ga || ads;
  if(first){
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    const s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(first);
    document.head.appendChild(s);
    window.gtag("js", new Date());
    if(ga)  window.gtag("config", ga);
    if(ads) window.gtag("config", ads);
  }
  if(pub){
    const s = document.createElement("script"); s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(pub);
    document.head.appendChild(s);
    if(slot && $("ad")){
      const ins = document.createElement("ins"); ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", pub); ins.setAttribute("data-ad-slot", slot);
      ins.setAttribute("data-ad-format", "auto"); ins.setAttribute("data-full-width-responsive", "true");
      const lab = document.createElement("small"); lab.textContent = "Publicité";
      $("ad").append(lab, ins); $("ad").hidden = false;
      try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
    }
  }
}
function showBanner(){
  if($("cookies")) return;
  const b = document.createElement("div"); b.className="cookies"; b.id="cookies"; b.setAttribute("role","dialog");
  const p = document.createElement("p");
  p.textContent = "Ce site utilise des cookies de mesure d'audience et de publicité (Google), uniquement avec votre accord.";
  const ok = document.createElement("button"); ok.className="btn"; ok.textContent="Accepter";
  const no = document.createElement("button"); no.className="btn alt"; no.textContent="Refuser";
  ok.onclick = ()=>{ setConsent("yes"); b.remove(); loadGoogle(); };
  no.onclick = ()=>{ setConsent("no"); b.remove(); };
  b.append(p, ok, no); document.body.appendChild(b);
}
function initGoogle(){
  const {ga, ads, pub} = ids();
  if(!(ga||ads||pub)) return;                       // rien de configuré : aucun cookie, aucune bannière
  const c = consent();
  if(c==="yes") loadGoogle(); else if(c!=="no") showBanner();
  const btn = $("cookiebtn");
  if(btn){ btn.hidden = false; btn.onclick = ()=>{ setConsent(""); showBanner(); }; }
}

/* ---------- En-tête, menu, pied de page ---------- */
function applySite(){
  const t=(site.titre||"La Boutique du Geek").trim(), i=t.lastIndexOf(" ");
  const h=$("h1"); h.textContent="";
  if(i>0){ h.append(t.slice(0,i)+" "); const s=document.createElement("span"); s.textContent=t.slice(i+1); h.appendChild(s); } else h.textContent=t;
  if(site.accroche) $("tagline").textContent=site.accroche;
  if(site.description_seo){ const m=document.querySelector('meta[name=description]'); if(m) m.content=site.description_seo; }
  if(site.pied_de_page) $("footer").textContent=site.pied_de_page;
  const box=$("shops"); box.innerHTML="";
  [["leboncoin","Leboncoin","lbc"],["vinted","Vinted","vinted"],["ebay","eBay","ebay"]].forEach(([k,l,c])=>{
    if(!site[k]) return;
    const a=document.createElement("a"); a.href=site[k]; a.target="_blank"; a.rel="noopener";
    a.className="pill "+c; a.textContent="Ma boutique "+l; box.appendChild(a);
  });
}
function buildNav(){
  const nav=$("nav"); nav.innerHTML="";
  const slug = PAGE==="categorie" ? slugify(routeSlug("categorie")) : PAGE==="page" ? slugify(routeSlug("page")) : "";
  const items=[
    ["/","Accueil", PAGE==="home"],
    ...catNames().map(n=>["/categorie/"+slugify(n), n, PAGE==="categorie" && slugify(n)===slug]),
    ...pages.map(p=>["/page/"+slugify(p.titre), p.titre, PAGE==="page" && slugify(p.titre)===slug]),
    ["/contact","Contact", PAGE==="contact"]
  ];
  items.forEach(([href,label,on])=>{
    const a=document.createElement("a"); a.href=href; a.textContent=label; if(on) a.className="on"; nav.appendChild(a);
  });
}

/* ---------- Vignettes et fenêtre article ---------- */
function card(p){
  const b=document.createElement("button"); b.className="card"+(p.vendu?" isold":"");
  const i=document.createElement("img"); i.src=p.image||placeholder; i.alt=p.titre; i.loading="lazy";
  i.onerror=()=>{ i.onerror=null; i.src=placeholder; };
  const d=document.createElement("div"); d.className="in";
  const h=document.createElement("h3"); h.textContent=p.titre;
  const pr=document.createElement("div"); pr.className="price"; pr.textContent=p.prix||"";
  d.append(h,pr);
  if(p.categorie){ const c=document.createElement("div"); c.className="cat"; c.textContent=p.categorie; d.appendChild(c); }
  b.append(i,d);
  if(p.vendu){ const s=document.createElement("span"); s.className="sold"; s.textContent="Vendu"; b.appendChild(s); }
  b.onclick=()=>openModal(p);
  return b;
}
function renderGrid(el, list){ el.innerHTML=""; list.forEach(p=>el.appendChild(card(p))); }

function buildModal(){
  const m=document.createElement("div"); m.className="modal"; m.id="modal"; m.setAttribute("role","dialog"); m.setAttribute("aria-modal","true");
  m.innerHTML='<div class="box"><button class="close" id="close" aria-label="Fermer">×</button><img id="mimg" alt="">'
    +'<div class="in"><h2 id="mtitle"></h2><p class="price" id="mprice"></p><p class="cat" id="mcat"></p>'
    +'<p id="mdesc" style="color:var(--muted);margin:8px 0"></p><p id="mchoose"></p><div id="mbuy"></div>'
    +'<a class="ask" id="mask">Une question sur cet article ? Écrivez-moi</a></div></div>';
  document.body.appendChild(m);
  $("close").onclick=()=>m.classList.remove("open");
  m.onclick=e=>{ if(e.target===m) m.classList.remove("open"); };
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") m.classList.remove("open"); });
}
function openModal(p){
  $("mimg").src=p.image||placeholder; $("mimg").alt=p.titre; $("mimg").onerror=function(){ this.onerror=null; this.src=placeholder; };
  $("mtitle").textContent=p.titre; $("mprice").textContent=p.prix||""; $("mcat").textContent=p.categorie||"";
  $("mdesc").textContent=p.description||"";
  const box=$("mbuy"); box.innerHTML="";
  if(p.vendu){
    $("mchoose").textContent="Cet article est vendu.";
  } else {
    $("mchoose").innerHTML="<strong>Choisissez où acheter :</strong>";
    CHANNELS.forEach(c=>{
      const url=p[c.key]; if(!url) return;
      const a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener";
      a.className="buy "+c.cls; a.textContent=c.label;
      a.addEventListener("click",()=>track("clic_achat",{canal:c.key, article:p.titre, categorie:catOf(p)}));
      box.appendChild(a);
    });
  }
  $("mask").href="mailto:"+(site.email||"")+"?subject="+encodeURIComponent("Question : "+p.titre);
  $("modal").classList.add("open");
  track("voir_article",{article:p.titre, categorie:catOf(p)});
}

/* ---------- Pages ---------- */
const matches = (p,q) => (p.titre+" "+(p.description||"")).toLowerCase().includes(q);

function pageHome(){
  setTitle("");
  const bands=$("bands"), results=$("results"), empty=$("empty");
  const avail = products.filter(p=>!p.vendu).sort(byLatest);
  let shown = 0;
  catNames().forEach(name=>{
    const list = avail.filter(p=>catOf(p)===name).slice(0,4);
    if(!list.length) return;
    shown++;
    const sec=document.createElement("section"); sec.className="band";
    const head=document.createElement("div"); head.className="band-head";
    const h=document.createElement("h2"); h.textContent=name;
    const more=document.createElement("a"); more.href="/categorie/"+slugify(name); more.textContent="Voir toute la catégorie →";
    head.append(h,more);
    const g=document.createElement("div"); g.className="grid four"; renderGrid(g,list);
    sec.append(head,g); bands.appendChild(sec);
  });
  empty.textContent="Aucun article en vente pour le moment."; empty.hidden = shown>0;
  $("q").oninput=()=>{
    const q=$("q").value.trim().toLowerCase();
    if(!q){ bands.hidden=false; results.hidden=true; empty.hidden=shown>0; empty.textContent="Aucun article en vente pour le moment."; return; }
    const list=products.filter(p=>matches(p,q)).sort((a,b)=>(a.vendu-b.vendu)||byLatest(a,b));
    bands.hidden=true; results.hidden=false; renderGrid($("grid"),list);
    empty.textContent="Aucun article trouvé."; empty.hidden=list.length>0;
  };
  /* Partage + QR code */
  const url = location.origin + "/";
  $("wa").href="https://wa.me/?text="+encodeURIComponent((site.titre||"La Boutique du Geek")+" : "+url);
  $("fb").href="https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url);
  $("copy").onclick=async()=>{ try{ await navigator.clipboard.writeText(url); $("copy").textContent="Lien copié ✓"; }catch(e){ prompt("Copiez ce lien :",url); } };
  try{ new QRCode($("qr"),{text:url,width:180,height:180}); }catch(e){}
  $("dlqr").onclick=()=>{
    const c=$("qr").querySelector("canvas"), im=$("qr").querySelector("img");
    const a=document.createElement("a"); a.download="qr-boutique-du-geek.png";
    a.href=c?c.toDataURL("image/png"):(im?im.src:""); a.click();
  };
}

function pageCategorie(){
  const slug = routeSlug("categorie");
  const name = catNames().find(n=>slugify(n)===slugify(slug));
  if(!name){
    setTitle("Catégorie introuvable");
    $("ctitle").textContent="Catégorie introuvable";
    $("cdesc").textContent=""; const a=document.createElement("a"); a.href="/"; a.textContent="Retour à l'accueil"; a.className="btn"; $("cdesc").appendChild(a);
    $("ctools").hidden=true; return;
  }
  setTitle(name);
  $("ctitle").textContent=name;
  const meta=categories.find(c=>c.nom===name);
  if(meta && meta.description) $("cdesc").textContent=meta.description; else $("cdesc").hidden=true;
  const all=products.filter(p=>catOf(p)===name).sort((a,b)=>(a.vendu-b.vendu)||byLatest(a,b));
  const draw=()=>{
    const q=$("q").value.trim().toLowerCase();
    const list=all.filter(p=>!q||matches(p,q));
    renderGrid($("grid"),list); $("empty").hidden=list.length>0;
  };
  $("q").oninput=draw; draw();
}

function pageTexte(){
  const slug = routeSlug("page");
  const pg = pages.find(p=>slugify(p.titre)===slugify(slug));
  if(!pg){ setTitle("Page introuvable"); $("ptitle").textContent="Page introuvable"; return; }
  setTitle(pg.titre); $("ptitle").textContent=pg.titre; md($("pbody"), pg.contenu);
}

function pageContact(){
  setTitle("Contact");
  const mail=site.email||"";
  $("mailbtn").href="mailto:"+mail+"?subject="+encodeURIComponent("Contact depuis le site "+(site.titre||"La Boutique du Geek"));
  $("mailbtn").hidden=!mail; $("mailtxt").textContent=mail;
  md($("ctext"), site.contact_texte);
}

/* ---------- Démarrage ---------- */
if(location.hash==="#contact" && PAGE!=="contact"){ location.replace("/contact"); }
buildModal();
Promise.all([getJSON("site.json"),getJSON("articles.json"),getJSON("categories.json"),getJSON("pages.json")])
  .then(([s,a,c,p])=>{
    site = s||{};
    products = (a.articles||[]).map((x,i)=>({...x, prix:fixPrice(x.prix), vendu:!!x.vendu, _i:i, _t:Date.parse(x.date||"")})).filter(x=>x.titre);
    categories = c.categories||[];
    pages = (p.pages||[]).filter(x=>x.titre);
    applySite(); buildNav();
    ({home:pageHome, categorie:pageCategorie, page:pageTexte, contact:pageContact})[PAGE]();
    initGoogle();
  })
  .catch(()=>{ const e=$("err"); if(e) e.hidden=false; });
})();
