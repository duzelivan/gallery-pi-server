function loadUsers() {
  fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      document.getElementById('noAccess').classList.remove('hidden');
      return;
    }

    const list = document.getElementById('usersList');
    list.innerHTML = data.users.map(u => `
      <div class="user-item">
        <div>
          <strong>${u.username}</strong>
          <span class="role-badge ${u.role}">${u.role}</span>
        </div>
        <button onclick="deleteUser(${u.id})" class="btn-danger">Obriši</button>
      </div>
    `).join('');
  })
  .catch(() => {
    document.getElementById('noAccess').classList.remove('hidden');
  });
}

function addUser(e) {
  e.preventDefault();
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;

  fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ username, password, role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      document.getElementById('userForm').reset();
      loadUsers();
    }
  });
}

function deleteUser(id) {
  if (!confirm('Obriši korisnika?')) return;

  fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
  .then(() => loadUsers())
  .catch(err => alert('Greška: ' + err.message));
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  if (currentUser?.role === 'admin') {
    loadUsers();
  } else {
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('noAccess').classList.remove('hidden');
  }
});