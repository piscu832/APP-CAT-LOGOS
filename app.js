/* ==============================================
   CATÁLOGO BUILDER — APP.JS
   Logo: Villalba oficial (PNG color / SVG blanco)
   State management, rendering, PDF export
   ============================================== */

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
const state = {
  empresa: {
    nombre: 'Villalba Hnos. Implantes S.A.',
    email: 'administracion@implantesvillalba.com.ar',
    telefono: '+54 9 11 4759 2261 / 11 4750 5409',
    direccion: 'F.M. Esquiú 4548 Buenos Aires, Argentina.',
    web: 'https://implantesvillalba.com.ar/',
    tagline: 'Más de 50 años en el mercado.',
  },
  producto: {
    nombre: '',
    subtitulo: 'Caja Instrumental',
    img: null,
    scale: 1,
    x: 0,
    y: 0,
    rotate: 0,
  },
  opciones: {
    titulo: 'N° Medida',
    img: null,
    cono: '',
    desc: '',
    medidas: [],      // ['35.5', '37.5-1', ...]
  },
  bandejas: [],
  // Each bandeja: { id, nombre, img, callouts:[{num,x,y}], instrumentos:[{num,nombre}] }
  currentPage: 0,
  totalPages: 0,
};

// ══════════════════════════════════════════════
//  FIREBASE CONFIG (Usuario debe completar)
// ══════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyAvZvbA36osGYvqztcu6CdxnDKeTwtVizs",
  authDomain: "catalogbuilder-v1.firebaseapp.com",
  projectId: "catalogbuilder-v1",
  storageBucket: "catalogbuilder-v1.firebasestorage.app",
  messagingSenderId: "1071691430173",
  appId: "1:1071691430173:web:c585b70fbbfba615d109f4",
  measurementId: "G-N30SYBHEZT"
};

// Inicializar Firebase
let db = null;
let analytics = null;
try {
  const app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  analytics = firebase.analytics();
  console.log("☁️ Firebase & Analytics activos");
} catch (e) {
  console.error("❌ Error Firebase:", e);
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
const $ = id => document.getElementById(id);

function openModal(id) { $(id).classList.remove('hidden'); }
function closeModal(id) { $(id).classList.add('hidden'); }

function toast(msg, duration = 2800) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), duration);
}

// ──────────────────────────────────────────────────────
//  LOGO SYSTEM — SVG Inline (paths exactos oficiales)
// ──────────────────────────────────────────────────────

/**
 * Devuelve el SVG oficial Villalba (1080x1080 viewBox).
 * variant: 'white'  → logo blanco  (portada, banners, contraportada — sobre azul)
 *          'color'  → logo azul    (toolbar — sobre fondo oscuro o claro)
 */
function villalbaLogo(size = 46, variant = 'white') {
  const col = variant === 'white' ? 'white' : '#193f89';
  const width = Math.round(size);
  const height = Math.round(size);
  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${width}" height="${height}" viewBox="0 0 1080 1080" style="display:block;">
    <polygon fill="${col}" points="540 106.67 154.29 775.24 268.57 775.24 540 304.76 868.57 874.29 97.49 874.32 97.14 874.29 40 973.33 1040 973.33 540 106.67"/>
    <g fill="${col}">
      <path d="M176.4,786.69l15.13,52.79,14.91-52.79h22.31l-26.67,77.28h-21.12l-26.99-77.28h22.42Z"/>
      <path d="M234.63,863.97v-77.28h21.23v77.28h-21.23Z"/>
      <path d="M269.13,863.97v-77.28h21.23v58.78h35.05v18.5h-56.27Z"/>
      <path d="M332.81,863.97v-77.28h21.23v58.78h35.05v18.5h-56.27Z"/>
      <path d="M414.33,786.69h23.73l24.6,77.28h-21.55l-4-15.13h-21.83l-3.99,15.13h-21.66l24.71-77.28Zm19.05,48l-7.18-27.21-7.18,27.21h14.36Z"/>
      <path d="M469.08,863.97v-77.28h21.23v58.78h35.05v18.5h-56.27Z"/>
      <path d="M598.5,844.16c0,4.64-1.25,8.42-3.76,11.32-2.5,2.9-5.86,5.04-10.07,6.42-4.21,1.38-8.85,2.07-13.93,2.07h-37.99v-77.28h44.84c3.63,0,6.77,.96,9.42,2.88,2.65,1.92,4.68,4.41,6.1,7.46s2.12,6.2,2.12,9.47c0,3.56-.92,7-2.78,10.34-1.85,3.34-4.63,5.84-8.33,7.51,4.43,1.31,7.93,3.59,10.5,6.86,2.58,3.27,3.86,7.58,3.86,12.95Zm-44.52-39.4v11.86h14.48c.94,0,1.85-.16,2.72-.49,.87-.33,1.6-.93,2.18-1.8,.58-.87,.87-2.1,.87-3.7,0-1.45-.24-2.59-.71-3.43-.47-.83-1.09-1.45-1.85-1.85-.76-.4-1.62-.6-2.56-.6h-15.13Zm22.97,35.05c0-1.31-.24-2.45-.71-3.43-.47-.98-1.11-1.76-1.9-2.34-.8-.58-1.74-.87-2.83-.87h-17.52v12.95h16.76c1.16,0,2.21-.25,3.16-.76,.94-.51,1.69-1.23,2.23-2.18,.54-.94,.82-2.07,.82-3.37Z"/>
      <path d="M624.07,786.69h23.73l24.6,77.28h-21.55l-4-15.13h-21.83l-3.99,15.13h-21.66l24.71-77.28Zm19.05,48l-7.18-27.21-7.18,27.21h14.36Z"/>
    </g>
  </svg>`;
}


function bandejaNombreSugerido(idx) {
  const names = ['BANDEJA INFERIOR', 'BANDEJA SUPERIOR', 'BANDEJA AUXILIAR', 'BANDEJA ADICIONAL'];
  return names[idx] || `BANDEJA ${idx + 1}`;
}

// ══════════════════════════════════════════════
//  UI FORM HELPERS
// ══════════════════════════════════════════════
function toggleCard(header) {
  const card = header.closest('.card');
  card.classList.toggle('collapsed');
}

function triggerUpload(inputId) {
  $(inputId) && $(inputId).click();
}

function handleImageUpload(inputId, zoneId, stateKey) {
  const file = $(inputId).files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const b64 = e.target.result;
    // Store in state
    if (stateKey === 'p-img') state.producto.img = b64;
    if (stateKey === 'op-img') state.opciones.img = b64;

    // Show thumbnail in zone
    const zone = $(zoneId);
    zone.classList.add('has-image');
    zone.querySelector('.upload-inner').innerHTML = `
      <img src="${b64}" class="thumb" alt="preview">
      <span class="upload-sub" style="margin-top:4px">Haz clic para cambiar</span>
    `;
    renderPreview();
  };
  reader.readAsDataURL(file);
}

function handleBandejaImage(inputId, zoneId, bandejaId) {
  const file = $(inputId).files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const b64 = e.target.result;
    const bnd = state.bandejas.find(b => b.id === bandejaId);
    if (bnd) bnd.img = b64;

    const zone = $(zoneId);
    zone.classList.add('has-image');
    zone.querySelector('.upload-inner').innerHTML = `
      <img src="${b64}" class="thumb" alt="bandeja">
      <span class="upload-sub" style="margin-top:4px">Haz clic para cambiar</span>
    `;
    // Rebuild callout editor
    renderCalloutEditor(bandejaId);
    renderPreview();
  };
  reader.readAsDataURL(file);
}

// ── List items ──
function addListItem(containerId, type, value = '') {
  const container = $(containerId);
  const idx = container.querySelectorAll('.list-row').length + 1;
  const row = document.createElement('div');
  row.className = 'list-row';
  row.dataset.idx = idx;

  if (type === 'medida') {
    row.innerHTML = `
      <span class="list-num">${idx}</span>
      <input class="list-input" type="text" placeholder="ej: 35.5" value="${value}"
        oninput="syncMedidas()">
      <button class="list-del" onclick="removeListItem(this,'medidas-list',true)">✕</button>
    `;
  } else if (type === 'instrumento') {
    row.dataset.bndId = containerId.replace('inst-list-', '');
    row.innerHTML = `
      <span class="list-num">${idx}</span>
      <input class="list-input" type="text" placeholder="Nombre del instrumento" value="${value}"
        oninput="syncInstrumentos('${containerId}')">
      <button class="list-del" onclick="removeListItem(this,'${containerId}',false)">✕</button>
    `;
  }
  container.appendChild(row);
}

function removeListItem(btn, containerId, isMedida) {
  btn.closest('.list-row').remove();
  renumberList(containerId);
  if (isMedida) syncMedidas();
  renderPreview();
}

function renumberList(containerId) {
  const rows = $(`${containerId}`).querySelectorAll('.list-row');
  rows.forEach((r, i) => {
    r.querySelector('.list-num').textContent = i + 1;
    r.dataset.idx = i + 1;
  });
}

function syncMedidas() {
  const rows = $('medidas-list').querySelectorAll('.list-row');
  state.opciones.medidas = Array.from(rows).map(r => r.querySelector('.list-input').value.trim()).filter(Boolean);
}

function syncInstrumentos(containerId) {
  const bandejaId = containerId.replace('inst-list-', '');
  const bnd = state.bandejas.find(b => b.id === bandejaId);
  if (!bnd) return;
  const rows = $(containerId).querySelectorAll('.list-row');
  bnd.instrumentos = Array.from(rows).map((r, i) => ({
    num: i + 1,
    nombre: r.querySelector('.list-input').value.trim()
  }));
}

function syncFormToState() {
  state.empresa.nombre = $('e-nombre').value || state.empresa.nombre;
  state.empresa.email = $('e-email').value || state.empresa.email;
  state.empresa.telefono = $('e-tel').value || state.empresa.telefono;
  state.empresa.direccion = $('e-dir').value || state.empresa.direccion;
  state.empresa.web = $('e-web').value || state.empresa.web;
  state.empresa.tagline = $('e-tag').value || state.empresa.tagline;

  state.producto.nombre = $('p-nombre').value || state.producto.nombre;
  state.producto.subtitulo = $('p-subtitulo').value || state.producto.subtitulo;

  if ($('p-scale')) state.producto.scale = parseFloat($('p-scale').value);
  if ($('p-x')) state.producto.x = parseFloat($('p-x').value);
  if ($('p-y')) state.producto.y = parseFloat($('p-y').value);
  if ($('p-rotate')) state.producto.rotate = parseFloat($('p-rotate').value);

  state.opciones.titulo = $('op-titulo').value || state.opciones.titulo;
  state.opciones.cono = $('op-cono').value;
  state.opciones.desc = $('op-desc').value;
  syncMedidas();
}

function syncStateToForm() {
  // Empresa
  $('e-nombre').value = state.empresa.nombre;
  $('e-email').value = state.empresa.email;
  $('e-tel').value = state.empresa.telefono;
  $('e-dir').value = state.empresa.direccion;
  $('e-web').value = state.empresa.web;
  $('e-tag').value = state.empresa.tagline;

  // Producto
  $('p-nombre').value = state.producto.nombre;
  $('p-subtitulo').value = state.producto.subtitulo;
  if ($('p-scale')) { $('p-scale').value = state.producto.scale; $('val-scale').innerText = state.producto.scale + 'x'; }
  if ($('p-x')) { $('p-x').value = state.producto.x; $('val-x').innerText = state.producto.x + '%'; }
  if ($('p-y')) { $('p-y').value = state.producto.y; $('val-y').innerText = state.producto.y + '%'; }
  if ($('p-rotate')) { $('p-rotate').value = state.producto.rotate; $('val-rot').innerText = state.producto.rotate + '°'; }

  // Opciones
  $('op-titulo').value = state.opciones.titulo;
  $('op-cono').value = state.opciones.cono;
  $('op-desc').value = state.opciones.desc;

  // Medidas
  const medidasList = $('medidas-list');
  medidasList.innerHTML = '';
  state.opciones.medidas.forEach(m => addListItem('medidas-list', 'medida', m));

  // Bandejas (Limpiar y reconstruir)
  $('bandejas-container').innerHTML = '';
  const currentBandejas = [...state.bandejas];
  state.bandejas = [];
  currentBandejas.forEach(b => {
    addBandeja();
    const newB = state.bandejas[state.bandejas.length - 1];
    newB.nombre = b.nombre;
    newB.img = b.img;
    newB.instrumentos = b.instrumentos;

    $(`name-${newB.id}`).value = b.nombre;
    const listId = `inst-list-${newB.id}`;
    $(listId).innerHTML = '';
    b.instrumentos.forEach(ins => addListItem(listId, 'instrumento', ins.nombre));

    if (b.img) {
      const zone = $(`zone-bnd-${newB.id}`);
      if (zone) {
        zone.classList.add('has-image');
        zone.querySelector('.upload-inner').innerHTML = `<img src="${b.img}" class="thumb">`;
      }
    }
  });

  // Images in main cards
  if (state.producto.img) {
    const pZone = $('p-upload-zone');
    pZone.classList.add('has-image');
    pZone.querySelector('.upload-inner').innerHTML = `<img src="${state.producto.img}" class="thumb">`;
  }
  if (state.opciones.img) {
    const oZone = $('op-upload-zone');
    oZone.classList.add('has-image');
    oZone.querySelector('.upload-inner').innerHTML = `<img src="${state.opciones.img}" class="thumb">`;
  }
}

// ══════════════════════════════════════════════
//  BANDEJAS
// ══════════════════════════════════════════════
function addBandeja() {
  const id = 'bnd_' + Date.now();
  const idx = state.bandejas.length;
  const nombre = bandejaNombreSugerido(idx);
  state.bandejas.push({ id, nombre, img: null, callouts: [], instrumentos: [] });
  renderBandejaBlock(id, nombre);
}

function removeBandeja(id) {
  state.bandejas = state.bandejas.filter(b => b.id !== id);
  const el = document.getElementById('bblock-' + id);
  if (el) el.remove();
  renderPreview();
}

function renderBandejaBlock(id, nombre) {
  const container = $('bandejas-container');
  const div = document.createElement('div');
  div.className = 'bandeja-block';
  div.id = 'bblock-' + id;

  const zoneId = 'zone-bnd-' + id;
  const inputId = 'up-bnd-' + id;
  const listId = 'inst-list-' + id;
  const editorId = 'callout-ed-' + id;

  div.innerHTML = `
    <div class="bandeja-block-header">
      <span class="bandeja-block-title">📷 <input
        id="name-${id}"
        style="background:transparent;border:none;color:#5BA4D4;font-weight:800;font-size:11px;font-family:inherit;text-transform:uppercase;letter-spacing:.5px;outline:none;width:160px;"
        value="${nombre}" onchange="renameBandeja('${id}', this.value)"></span>
      <button class="bandeja-del-btn" onclick="removeBandeja('${id}')">✕ Eliminar</button>
    </div>
    <div class="bandeja-block-body">
      <div class="fg"><label>Foto de la bandeja</label>
        <div class="upload-zone" id="${zoneId}" onclick="triggerUpload('${inputId}')">
          <input type="file" id="${inputId}" accept="image/*" style="display:none"
            onchange="handleBandejaImage('${inputId}','${zoneId}','${id}')">
          <div class="upload-inner">
            <span class="upload-ico">📷</span>
            <span class="upload-txt">Foto de la bandeja</span>
            <span class="upload-sub">Haz clic para posicionar callouts</span>
          </div>
        </div>
      </div>
      <div class="fg" id="${editorId}">
        <!-- Callout editor appears here after image upload -->
      </div>
      <div class="fg">
        <label>Instrumentos (uno por línea)</label>
        <div class="list-manager" id="${listId}"></div>
        <button class="btn-add-item" onclick="addListItem('${listId}','instrumento')">+ Agregar instrumento</button>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function renameBandeja(id, newName) {
  const bnd = state.bandejas.find(b => b.id === id);
  if (bnd) { bnd.nombre = newName.toUpperCase(); renderPreview(); }
}

// ══════════════════════════════════════════════
//  CALLOUT EDITOR
// ══════════════════════════════════════════════
function renderCalloutEditor(bandejaId) {
  const bnd = state.bandejas.find(b => b.id === bandejaId);
  if (!bnd || !bnd.img) return;

  const editorId = 'callout-ed-' + bandejaId;
  const editor = $(editorId);
  if (!editor) return;

  editor.innerHTML = `
    <label>Editor de Callouts <span style="color:var(--muted);font-size:9px;">(haz clic en la imagen para agregar número)</span></label>
    <div class="callout-img-wrap" id="cw-${bandejaId}">
      <img src="${bnd.img}" alt="bandeja" draggable="false">
      <div class="callout-overlay" onclick="addCallout(event,'${bandejaId}')"></div>
    </div>
    <div class="callout-hint">🖱️ Clic = agregar callout · Clic en círculo = eliminar</div>
  `;
  // Re-render callouts
  redrawCallouts(bandejaId);
}

function addCallout(event, bandejaId) {
  const bnd = state.bandejas.find(b => b.id === bandejaId);
  if (!bnd) return;
  const wrapper = event.currentTarget.parentElement;
  const rect = wrapper.querySelector('img').getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const num = bnd.callouts.length + 1;
  bnd.callouts.push({ num, x, y });
  redrawCallouts(bandejaId);
  // Auto-add instrument row if needed
  const listId = 'inst-list-' + bandejaId;
  const rows = $(listId) ? $(listId).querySelectorAll('.list-row').length : 0;
  if (rows < num) addListItem(listId, 'instrumento');
  renderPreview();
}

function removeCallout(bandejaId, num) {
  const bnd = state.bandejas.find(b => b.id === bandejaId);
  if (!bnd) return;
  bnd.callouts = bnd.callouts.filter(c => c.num !== num);
  // Re-number
  bnd.callouts.forEach((c, i) => c.num = i + 1);
  redrawCallouts(bandejaId);
  renderPreview();
}

function redrawCallouts(bandejaId) {
  const bnd = state.bandejas.find(b => b.id === bandejaId);
  const wrapper = document.getElementById('cw-' + bandejaId);
  if (!wrapper || !bnd) return;
  // Remove old dots
  wrapper.querySelectorAll('.callout-dot').forEach(d => d.remove());
  bnd.callouts.forEach(c => {
    const dot = document.createElement('div');
    dot.className = 'callout-dot';
    dot.textContent = c.num;
    dot.style.left = c.x + '%';
    dot.style.top = c.y + '%';
    dot.title = 'Clic para eliminar callout ' + c.num;
    dot.onclick = e => { e.stopPropagation(); removeCallout(bandejaId, c.num); };
    wrapper.appendChild(dot);
  });
}

// ══════════════════════════════════════════════
//  CATALOG PAGE BUILDERS
// ══════════════════════════════════════════════
function buildCoverPage() {
  const { nombre, subtitulo, img, scale, x, y, rotate } = state.producto;
  const t = `transform: translateX(-50%) translate(${x}%, ${y}%) scale(${scale}) rotate(${rotate}deg);`;
  return `
    <div class="cat-page cat-cover">
      <div class="cv-logo">
        ${villalbaLogo(112)}
      </div>
      ${img ? `<img class="cv-product-img" src="${img}" style="${t}" alt="producto">` : ''}
      <div class="cv-content">
        <p class="cv-subtitle">${escHtml(subtitulo || 'Caja Instrumental')}</p>
        <h1 class="cv-title">${escHtml(nombre || 'Nombre del Producto')}</h1>
      </div>
      <div class="cv-dots"></div>
    </div>
  `;
}

function buildOpcionesPage() {
  const { titulo, img, cono, desc, medidas } = state.opciones;
  const { nombre } = state.producto;
  const medidasHtml = medidas.length
    ? medidas.map(m => `<li>${escHtml(m)}</li>`).join('')
    : '<li style="color:#aaa;font-style:italic">Agrega medidas en el panel</li>';
  return `
    <div class="cat-page cat-inner">
      <div class="page-banner">
        <span class="page-banner-title">OPCIONES DE ${escHtml(nombre || 'PRODUCTO').toUpperCase()}</span>
        <div class="banner-logo">
          ${villalbaLogo(42)}
        </div>
      </div>
      <div class="opciones-body">
        <div class="opciones-left">
          <div class="opciones-section-title">${escHtml(titulo || 'N° Medida')}</div>
          <ul class="measure-list">${medidasHtml}</ul>
          ${desc ? `<p class="opciones-desc">${escHtml(desc)}</p>` : ''}
        </div>
        <div class="opciones-right">
          ${img ? `<img class="opciones-img" src="${img}" alt="implante">` : '<div style="color:#ccc;font-size:13px;text-align:center;">Sube la imagen<br>del implante</div>'}
          ${cono ? `<span class="opciones-cono">${escHtml(cono)}</span>` : ''}
        </div>
      </div>
      <div class="page-wave"></div>
      <div class="page-dots"></div>
    </div>
  `;
}

function buildBandejaPage(bnd) {
  const calloutDots = bnd.callouts.map(c => `
    <div class="tray-callout" style="left:${c.x}%;top:${c.y}%">${c.num}</div>
  `).join('');

  const instrHtml = bnd.instrumentos.length
    ? bnd.instrumentos.map(i => `
        <li><span class="inst-num">${i.num}.</span> ${escHtml(i.nombre)}</li>
      `).join('')
    : '<li style="color:#aaa;font-style:italic">Agrega instrumentos en el panel</li>';

  return `
    <div class="cat-page cat-inner">
      <div class="page-banner">
        <span class="page-banner-title">${escHtml(bnd.nombre)}</span>
        <div class="banner-logo">
          ${villalbaLogo(42)}
        </div>
      </div>
      <div class="bandeja-body">
        <div class="tray-photo-container">
          ${bnd.img
      ? `<img class="tray-photo" src="${bnd.img}" alt="bandeja">${calloutDots}`
      : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,.3);font-size:14px;">Sube la foto de la bandeja</div>'
    }
        </div>
        <div class="tray-desc-area">
          <div class="tray-desc-title">Descripción</div>
          <div class="tray-sep"></div>
          <ul class="instruments-list">${instrHtml}</ul>
          <div class="page-wave"></div>
          <div class="page-dots"></div>
        </div>
      </div>
    </div>
  `;
}

function buildBackCover() {
  const { nombre, email, telefono, direccion, web, tagline } = state.empresa;
  return `
    <div class="cat-page cat-backcover" style="position:relative;">
      <div class="bc-logo">
        ${villalbaLogo(144)}
      </div>
      <div class="bc-divider"></div>
      <div class="bc-contact">
        <span class="bc-company">${escHtml(nombre)}</span>
        <span class="bc-info">${escHtml(email)}</span>
        <span class="bc-info">Tel: ${escHtml(telefono)}</span>
        <span class="bc-info">${escHtml(direccion)}</span>
        <span class="bc-info">${escHtml(web)}</span>
      </div>
      <div class="bc-divider"></div>
      <div class="bc-flag">🇦🇷</div>
      <div class="bc-tagline">${escHtml(tagline)}</div>
      <div class="bc-argentina">INDUSTRIA ARGENTINA</div>
      <div class="bc-dots"></div>
    </div>
  `;
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════════
//  PAGE BUILDING
// ══════════════════════════════════════════════
function buildAllPages() {
  const pages = [];
  pages.push(buildCoverPage());
  pages.push(buildOpcionesPage());
  state.bandejas.forEach(bnd => pages.push(buildBandejaPage(bnd)));
  pages.push(buildBackCover());
  return pages;
}

// ══════════════════════════════════════════════
//  PREVIEW
// ══════════════════════════════════════════════
function renderPreview() {
  syncFormToState();
  const pages = buildAllPages();
  state.totalPages = pages.length;

  if (state.currentPage >= pages.length) state.currentPage = pages.length - 1;
  if (state.currentPage < 0) state.currentPage = 0;

  const container = $('preview-container');
  container.innerHTML = `
    <div class="preview-scale">
      ${pages[state.currentPage]}
    </div>
  `;

  // Update nav
  $('page-indicator').textContent = `Página ${state.currentPage + 1} / ${pages.length}`;
  $('btn-prev').disabled = state.currentPage === 0;
  $('btn-next').disabled = state.currentPage === pages.length - 1;
}

function prevPage() {
  if (state.currentPage > 0) { state.currentPage--; renderPreview(); }
}
function nextPage() {
  if (state.currentPage < state.totalPages - 1) { state.currentPage++; renderPreview(); }
}

// ══════════════════════════════════════════════
//  PDF EXPORT
// ══════════════════════════════════════════════
let isExporting = false;

async function exportPDF() {
  if (isExporting) return;
  syncFormToState();

  const rawName = state.producto.nombre || 'Producto';
  const cleanName = rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const defaultFilename = `catalogo_villalba_${cleanName}.pdf`;

  let fileHandle = null;
  if (window.showSaveFilePicker) {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [{
          description: 'Documento PDF',
          accept: { 'application/pdf': ['.pdf'] },
        }],
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error Picker:', err);
      return;
    }
  }

  isExporting = true;
  $('loading-overlay').classList.remove('hidden');

  const pages = buildAllPages();
  try {
    const fullHtml = `
      <div style="width: 210mm; background: white; margin:0; padding:0;">
        ${pages.join('<div class="html2pdf__page-break"></div>')}
      </div>
    `;

    const opt = {
      margin: 0,
      filename: defaultFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'legacy' }
    };

    const pdfBlob = await html2pdf().set(opt).from(fullHtml).output('blob');

    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();
      toast('✅ PDF guardado exitosamente');
    } else {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('✅ PDF exportado (Descarga clásica)');
    }
  } catch (err) {
    console.error('Error exportPDF:', err);
    toast('❌ Error en el proceso.');
  } finally {
    $('loading-overlay').classList.add('hidden');
    setTimeout(() => { isExporting = false; }, 1000);
  }
}

// ══════════════════════════════════════════════
//  DEMO DATA
// ══════════════════════════════════════════════
function loadDemo() {
  // Pre-fill form fields with demo data
  $('e-nombre').value = 'Villalba Hnos. Implantes S.A.';
  $('e-email').value = 'administracion@implantesvillalba.com.ar';
  $('e-tel').value = '+54 9 11 4759 2261 / 11 4750 5409';
  $('e-dir').value = 'F.M. Esquiú 4548 Buenos Aires, Argentina.';
  $('e-web').value = 'https://implantesvillalba.com.ar/';
  $('e-tag').value = 'Más de 50 años en el mercado.';

  $('p-nombre').value = 'Tallo Pampa';
  $('p-subtitulo').value = 'Caja Instrumental';

  if ($('p-scale')) { $('p-scale').value = '1'; $('val-scale').innerText = '1x'; }
  if ($('p-x')) { $('p-x').value = '0'; $('val-x').innerText = '0%'; }
  if ($('p-y')) { $('p-y').value = '0'; $('val-y').innerText = '0%'; }
  if ($('p-rotate')) { $('p-rotate').value = '0'; $('val-rot').innerText = '0°'; }

  $('op-titulo').value = 'N° Medida';
  $('op-cono').value = 'Cono 12/14';
  $('op-desc').value = 'El diseño incorpora tres puntos de referencia en la zona proximal de la raspa y el vástago, optimizando la selección del nivel de implantación y favoreciendo la restitución anatómica de la longitud del miembro.';

  // Add demo medidas
  const medidasList = $('medidas-list');
  medidasList.innerHTML = '';
  ['35.5', '37.5-1', '37.5-2', '44-1', '44-2'].forEach(m => addListItem('medidas-list', 'medida', m));

  // Add demo bandeja
  addBandeja();
  const bnd = state.bandejas[0];
  bnd.nombre = 'BANDEJA INFERIOR';
  bnd.instrumentos = [
    { num: 1, nombre: 'Colocador / Orientador de tallo' },
    { num: 2, nombre: 'Extractor de cabeza de fémur' },
    { num: 3, nombre: 'Mecha de acople' },
    { num: 4, nombre: 'Impactor' },
    { num: 5, nombre: 'Cureta mediana' },
    { num: 6, nombre: 'Fresa manual Ø16' },
    { num: 7, nombre: 'Fresa manual Ø12' },
    { num: 8, nombre: 'Gubia cuchara' },
  ];
  // Add instruments to the UI
  const listId = 'inst-list-' + bnd.id;
  bnd.instrumentos.forEach(i => addListItem(listId, 'instrumento', i.nombre));

  syncFormToState();
  renderPreview();
  toast('🎯 Demo cargado — Agrega imágenes para completar el catálogo');
}

// ══════════════════════════════════════════════
//  STEP NAVIGATION (scroll sidebar to section)
// ══════════════════════════════════════════════
function initStepNav() {
  document.querySelectorAll('.step-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.step-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const section = pill.dataset.step;
      const el = document.getElementById('section-' + section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Expand if collapsed
        if (el.classList.contains('collapsed')) toggleCard(el.querySelector('.card-header'));
      }
    });
  });
}

// ══════════════════════════════════════════════
//  LIVE SYNC (input events on sidebar)
// ══════════════════════════════════════════════
function initLiveSync() {
  const sidebar = $('sidebar');
  sidebar.addEventListener('input', () => {
    clearTimeout(window._syncTimer);
    window._syncTimer = setTimeout(renderPreview, 400);
  });
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initStepNav();
  initLiveSync();

  $('btn-export').addEventListener('click', exportPDF);
  $('btn-load-demo').addEventListener('click', loadDemo);

  // Cloud Events
  $('btn-save-cloud').addEventListener('click', saveToCloud);
  $('btn-cloud-list').addEventListener('click', openCloudModal);

  // Drag & drop on upload zones
  document.querySelectorAll('.upload-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const fileInput = zone.querySelector('input[type="file"]');
      if (!fileInput) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change'));
    });
  });

  // Initial render
  renderPreview();
  toast('👋 ¡Bienvenido! Usa "Cargar Demo" para ver un ejemplo o sube tus propios activos.');
});

// ══════════════════════════════════════════════
//  CLOUD ACTIONS (Firebase)
// ══════════════════════════════════════════════
async function saveToCloud() {
  if (!db) {
    console.warn("❌ db no está inicializado");
    return toast("❌ Firebase no conectado");
  }

  syncFormToState();
  const name = state.producto.nombre || "Sin Nombre";
  const btn = $('btn-save-cloud');

  try {
    console.log("☁️ Iniciando guardado en Firebase...");
    btn.innerHTML = "⌛ Guardando...";
    btn.disabled = true;

    // Clonar estado limpiando posibles nulos o undefined que Firestore no quiera
    const stateClone = JSON.parse(JSON.stringify(state));

    const docRef = await db.collection("catalogos").add({
      name,
      state: stateClone,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Guardado con ID:", docRef.id);
    toast(`✅ "${name}" guardado en la nube`);
  } catch (e) {
    console.error("❌ Error en saveToCloud:", e);
    toast("❌ Error al guardar: " + (e.message || "Fallo de conexión"));
  } finally {
    btn.innerHTML = "💾 Guardar Nube";
    btn.disabled = false;
  }
}

async function openCloudModal() {
  if (!db) return toast("❌ Firebase no configurado aún.");

  openModal('modal-cloud');
  const listEl = $('cloud-list');
  const statusEl = $('cloud-status');

  listEl.innerHTML = "";
  statusEl.innerText = "Cargando catálogos...";

  try {
    const snap = await db.collection("catalogos").orderBy("timestamp", "desc").get();

    if (snap.empty) {
      statusEl.innerText = "No hay catálogos guardados aún.";
      return;
    }

    statusEl.innerText = "";
    snap.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : "Recién guardado";

      const item = document.createElement('div');
      item.className = 'cloud-item';
      item.innerHTML = `
        <div class="cloud-item-info">
          <span class="cloud-item-name">${data.name || 'Sin Título'}</span>
          <span class="cloud-item-date">${date}</span>
        </div>
        <div class="cloud-item-actions">
          <button class="btn-cloud-load" onclick="loadFromCloud('${doc.id}')">Cargar</button>
          <button class="btn-cloud-remove" onclick="removeFromCloud('${doc.id}')">Eliminar</button>
        </div>
      `;
      listEl.appendChild(item);
    });
  } catch (e) {
    console.error(e);
    statusEl.innerText = "Error al conectar con la nube.";
  }
}

async function loadFromCloud(id) {
  try {
    const doc = await db.collection("catalogos").doc(id).get();
    if (!doc.exists) return toast("❌ El archivo ya no existe.");

    const data = doc.data();
    Object.assign(state, data.state);

    // Refresh UI & Form
    syncStateToForm();
    renderPreview();

    closeModal('modal-cloud');
    toast(`📂 Catálogo "${data.name}" cargado`);
  } catch (e) {
    console.error(e);
    toast("❌ Error al cargar");
  }
}

async function removeFromCloud(id) {
  if (!confirm("¿Seguro que quieres eliminar este catálogo de la nube?")) return;
  try {
    await db.collection("catalogos").doc(id).delete();
    toast("🗑️ Eliminado correctamente");
    openCloudModal(); // Refresh list
  } catch (e) {
    console.error(e);
    toast("❌ Error al eliminar");
  }
}
