let currentImages = [];
let selectedImageId = null;

function loadTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '<p class="loading">Učitavanje...</p>';

  const year = document.getElementById('yearFilter').value;
  const month = document.getElementById('monthFilter').value;
  const category = document.getElementById('categoryFilter').value;

  let url = `${API_URL}/images/timeline?`;
  if (year) url += `year=${year}&`;
  if (month) url += `month=${month}&`;
  if (category) url += `category=${category}&`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      currentImages = data.images;
      renderTimeline(data.images);
    })
    .catch(err => {
      timeline.innerHTML = `<p class="error">Greška: ${err.message}</p>`;
    });
}

function renderTimeline(images) {
  const timeline = document.getElementById('timeline');

  if (images.length === 0) {
    timeline.innerHTML = '<p class="empty">Nema slika za prikaz</p>';
    return;
  }

  const groups = {};
  images.forEach(img => {
    const date = new Date(img.date_taken || img.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(img);
  });

  let html = '';
  Object.keys(groups).sort().reverse().forEach(key => {
    const [year, month] = key.split('-');
    const monthNames = ['Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj', 
                       'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'];

    html += `<div class="timeline-group">
      <h3>${monthNames[parseInt(month)-1]} ${year}</h3>
      <div class="timeline">`;

    groups[key].forEach(img => {
      const thumbFile = img.thumbnail_path ? img.thumbnail_path.split('/').pop() : '';
      html += `
        <div class="timeline-item" onclick="openLightbox(${img.id})">
          <img src="/images/thumbnails/${thumbFile}" 
               alt="${img.title || ''}" 
               onerror="this.style.display='none'; this.parentElement.innerHTML+='<div style=\'padding:80px;text-align:center;color:#666\'>Nema slike</div>'">
          <div class="info">
            <h4>${img.title || 'Bez naslova'}</h4>
            <p>${img.description || ''}</p>
            <span class="date">${img.category || ''}</span>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
  });

  timeline.innerHTML = html;
}

function openLightbox(id) {
  const img = currentImages.find(i => i.id === id);
  if (!img) return;

  selectedImageId = id;
  document.getElementById('lightboxImg').src = `/images/${img.filename}`;
  document.getElementById('lightboxTitle').textContent = img.title || 'Bez naslova';
  document.getElementById('lightboxDesc').textContent = img.description || '';
  document.getElementById('lightbox').classList.remove('hidden');
}

function closeLightbox(e) {
  if (e.target === e.currentTarget) {
    document.getElementById('lightbox').classList.add('hidden');
    selectedImageId = null;
  }
}

function deleteImage() {
  if (!selectedImageId || !confirm('Obriši sliku?')) return;

  fetch(`${API_URL}/images/${selectedImageId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
  .then(() => {
    closeLightbox({ target: document.getElementById('lightbox'), currentTarget: document.getElementById('lightbox') });
    loadTimeline();
  })
  .catch(err => alert('Greška: ' + err.message));
}

function loadFilters() {
  fetch(`${API_URL}/images/years`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('yearFilter');
      data.years.forEach(year => {
        select.innerHTML += `<option value="${year}">${year}</option>`;
      });
    });

  fetch(`${API_URL}/images/categories`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('categoryFilter');
      data.categories.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
      });
    });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadFilters();
  loadTimeline();
});