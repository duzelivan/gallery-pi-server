const API_URL = 'http://localhost:3000/api';

let currentUser = null;
let authToken = localStorage.getItem('token');

function checkAuth() {
  if (authToken) {
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      currentUser = payload;
      showUploadSection();
    } catch {
      logout();
    }
  }
}

function showUploadSection() {
  document.getElementById('loginSection')?.classList.add('hidden');
  document.getElementById('uploadSection')?.classList.remove('hidden');
  document.getElementById('adminSection')?.classList.remove('hidden');
  setDefaultDate();
}

function login(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
      return;
    }
    authToken = data.token;
    localStorage.setItem('token', authToken);
    currentUser = data.user;
    location.reload();
  })
  .catch(err => alert('Greška: ' + err.message));
}

function logout() {
  localStorage.removeItem('token');
  authToken = null;
  currentUser = null;
  location.reload();
}

function uploadImage(e) {
  e.preventDefault();

  const uploadBtn = document.getElementById('uploadBtn');
  const progressWrap = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const result = document.getElementById('uploadResult');

  // Priprema FormData
  const formData = new FormData();
  formData.append('image', document.getElementById('imageFile').files[0]);
  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('date_taken', document.getElementById('dateTaken').value);

  // Onemogući gumb i pokaži progress bar
  uploadBtn.disabled = true;
  uploadBtn.textContent = '⬆ Upload u tijeku...';
  progressWrap.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
  result.className = 'result';
  result.innerHTML = '';

  // Koristimo XMLHttpRequest za progress tracking
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      progressFill.style.width = percent + '%';
      progressText.textContent = percent + '%';
    }
  });

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.error) {
          result.className = 'result error';
          result.innerHTML = `<p>Greška: ${data.error}</p>`;
        } else {
          result.className = 'result success';
          result.innerHTML = `<p>✅ Slika uspješno uploadana! ID: ${data.id}</p>`;
          document.getElementById('uploadForm').reset();
          // Ponovo postavi današnji datum nakon reset-a
          setDefaultDate();
        }
      } catch {
        result.className = 'result error';
        result.innerHTML = `<p>Greška pri parsiranju odgovora</p>`;
      }
    } else {
      result.className = 'result error';
      result.innerHTML = `<p>Greška: HTTP ${xhr.status}</p>`;
    }
    resetUploadState(uploadBtn, progressWrap);
  });

  xhr.addEventListener('error', () => {
    result.className = 'result error';
    result.innerHTML = `<p>Greška: Upload nije uspio. Provjeri vezu.</p>`;
    resetUploadState(uploadBtn, progressWrap);
  });

  xhr.addEventListener('abort', () => {
    result.className = 'result error';
    result.innerHTML = `<p>Upload prekinut.</p>`;
    resetUploadState(uploadBtn, progressWrap);
  });

  xhr.open('POST', `${API_URL}/images/upload`);
  xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
  xhr.send(formData);
}

function resetUploadState(btn, progressWrap) {
  btn.disabled = false;
  btn.textContent = '⬆ Upload';
  // Sakrij progress bar nakon 1.5s da korisnik vidi 100%
  setTimeout(() => {
    progressWrap.classList.add('hidden');
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = '0%';
  }, 1500);
}

function setDefaultDate() {
  const dateInput = document.getElementById('dateTaken');
  if (!dateInput) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

function checkUsbStatus() {
  const usbEl = document.getElementById('usbStatus');
  if (!usbEl) return;

  usbEl.innerHTML = `
    <div class="usb-item">
      <label>USB Mount</label>
      <value>/mnt/usb/gallery</value>
    </div>
    <div class="usb-item">
      <label>Status</label>
      <value style="color: #00d9ff">Aktivan</value>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  checkUsbStatus();
  setDefaultDate();
});
