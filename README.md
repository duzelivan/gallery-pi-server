# 🖼️ Gallery Pi Server

Aplikacija za galeriju slika na Raspberry Pi 4 s USB pohranom.

## 📁 Struktura

```
gallery-pi-server/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── routes/
│   │       ├── images.js
│   │       └── users.js
│   ├── package.json
│   └── Dockerfile
├── frontend/         # Web aplikacija
│   ├── index.html    # Upload
│   ├── timeline.html # Pregled slika
│   ├── users.html    # Upravljanje korisnicima
│   ├── style.css
│   ├── timeline.css
│   ├── app.js
│   ├── timeline.js
│   └── users.js
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

## 🚀 Pokretanje

### 1. USB Postavka (na Pi-ju)

```bash
# Umetni USB, provjeri
df -h
# Trebaš vidjeti npr. /dev/sda1

# Kreiraj mount point
sudo mkdir -p /mnt/usb/gallery
sudo mkdir -p /mnt/usb/gallery/thumbnails

# Mountaj (ext4)
sudo mount /dev/sda1 /mnt/usb

# Auto-mount pri bootu
sudo nano /etc/fstab
# Dodaj: /dev/sda1 /mnt/usb ext4 defaults,noatime 0 2
```

### 2. Deploy u Portainer

1. **Stacks** → **+ Add stack**
2. **Build method**: **Git repository**
3. **Repository URL**: `https://github.com/duzelivan/gallery-pi-server`
4. **Deploy the stack**

### 3. Pristup

| URL | Opis |
|-----|------|
| `http://192.168.0.200:8080` | Frontend (Upload) |
| `http://192.168.0.200:8080/timeline.html` | Timeline |
| `http://192.168.0.200:8080/users.html` | Korisnici |
| `http://192.168.0.200:3000/api/health` | Health check |

## 🔑 Default login

- **Username**: `admin`
- **Password**: `admin123`

## 🛠️ API Endpoints

| Method | Endpoint | Opis |
|--------|----------|------|
| POST | /api/users/login | Prijava |
| GET | /api/users | Lista korisnika (admin) |
| POST | /api/users | Novi korisnik (admin) |
| POST | /api/images/upload | Upload slike |
| GET | /api/images/timeline | Sve slike (s filterima) |
| GET | /api/images/categories | Kategorije |
| GET | /api/images/years | Godine |
| DELETE | /api/images/:id | Obriši sliku |

## ⚠️ Važno

- Prilagodi `API_URL` u `frontend/app.js` ako je drugačiji IP
- Promijeni default lozinku odmah!
- Koristi USB SSD umjesto SD kartice za pohranu slika