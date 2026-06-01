const API_URL = 'http://192.168.0.200:3000/api';

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
  const formData = new FormData();
  formData.append('image', document.getElementById('imageFile').files[0]);
  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('date_taken', document.getElementById('dateTaken').value);

  fetch(`${API_URL}/images/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    const result = document.getElementById('uploadResult');
    if (data.error) {
      result.className = 'result error';
      result.innerHTML = `<p>Greška: ${data.error}</p>`;
    } else {
      result.className = 'result success';
      result.innerHTML = `<p>✅ Slika uploadana! ID: ${data.id}</p>`;
      document.getElementById('uploadForm').reset();
    }
  })
  .catch(err => {
    document.getElementById('uploadResult').innerHTML = `<p class="error">Greška: ${err.message}</p>`;
  });
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
});