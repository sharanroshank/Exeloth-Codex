// assets/js/admin.js - V2 (Unified Content Management & Profile Logic)

let adminPanelInitialized = false;
let allGamesData = []; // Menyimpan data lokal untuk tabel
let currentPage = 1;
const itemsPerPage = 5;

// Initialize admin panel
function initAdminPanel() {
    if (adminPanelInitialized) return;
    adminPanelInitialized = true;
    
    console.log('🚀 Initializing admin panel V2...');
    
    // Setup Form Listeners
    document.getElementById('game-form')?.addEventListener('submit', handleGameSubmitV2);
    document.getElementById('chapter-form')?.addEventListener('submit', handleChapterSubmit);
    
    // Auto-generate slug
    const gameTitleInput = document.getElementById('game-title');
    if (gameTitleInput) {
        gameTitleInput.addEventListener('input', function() {
            if (!document.getElementById('edit-game-id').value) { // Hanya jika bukan edit mode
                document.getElementById('game-slug').value = generateSlug(this.value);
            }
        });
    }

    // Search & Filter Listeners (Tabel)
    document.getElementById('search-game')?.addEventListener('input', () => { currentPage = 1; renderTable(); });
    document.getElementById('filter-status')?.addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.getElementById('sort-game')?.addEventListener('change', () => { renderTable(); });

    // Preview Image Listeners
    setupImagePreview('game-thumbnail', 'preview-thumbnail', 'txt-thumbnail');
    setupImagePreview('game-logo', 'preview-logo', 'txt-logo');
    setupImagePreview('game-bg', 'preview-bg', 'txt-bg');
    
    console.log('✅ Admin panel initialization complete');
}

// --- GOOGLE CONNECTION LOGIC ---

function updateGoogleUI(user) {
    const nameEl = document.getElementById('g-conn-name');
    const emailEl = document.getElementById('g-conn-email');
    const statusText = document.getElementById('g-conn-text');
    const statusIcon = document.getElementById('g-conn-icon');
    const statusBadge = document.getElementById('g-conn-status-badge');
    const hoverText = document.getElementById('g-hover-text');

    if (user) {
        // STATE: TERHUBUNG
        nameEl.textContent = user.displayName || 'Google User';
        nameEl.className = 'mb-0 text-white fw-bold';
        
        emailEl.textContent = user.email;
        emailEl.style.display = 'block';

        statusText.textContent = 'Terhubung';
        statusBadge.className = 'd-flex align-items-center gap-2 text-success fw-bold'; // Hijau
        
        statusIcon.className = 'bi bi-link-45deg fs-5'; // Icon Rantai Nyambung
        
        if(hoverText) hoverText.textContent = "Putuskan Sambungan";
    } else {
        // STATE: TIDAK TERHUBUNG / TERPUTUS
        nameEl.textContent = 'Tidak terhubung dengan Google';
        nameEl.className = 'mb-0 text-secondary fw-bold';
        
        emailEl.style.display = 'none'; // Sembunyikan email

        statusText.textContent = 'Terputus';
        statusBadge.className = 'd-flex align-items-center gap-2 text-secondary fw-bold'; // Abu-abu
        
        statusIcon.className = 'bi bi-slash-circle fs-5'; // Icon Rantai Putus / Slash
        
        if(hoverText) hoverText.textContent = "Hubungkan Akun";
    }
}

// Fungsi yang dipanggil saat kartu diklik
async function handleGoogleConnection() {
    if (currentUser) {
        // Jika sedang login -> Logout (Putuskan)
        if (confirm('Putuskan sambungan dari akun Google ini? Anda akan logout.')) {
            await auth.signOut();
            // UI akan otomatis update lewat auth state listener, atau redirect ke home
            updateGoogleUI(null); 
            showNotification('Sambungan Google diputuskan.', 'info');
        }
    } else {
        // Jika tidak login -> Login (Hubungkan)
        showNotification('Mengalihkan ke Google Sign-In...', 'info');
        // Panggil fungsi login dari auth-system.js
        if (typeof showGoogleSignIn === 'function') {
            showGoogleSignIn();
        } else {
            console.error('Fungsi login tidak ditemukan');
        }
    }
}

// Show admin panel (Dipanggil dari auth-system.js)
function showAdminPanel(user) {
    const adminSection = document.getElementById('admin-panel-section');
    if (adminSection) adminSection.classList.remove('d-none');
    
    // Load Data
    updateGoogleUI(user);
    updateUserInfo(user);
    loadAdminList();
    loadSections(); 
    loadGameSlugs(); // Untuk dropdown chapter
    loadGamesTable(); // LOAD TABEL UTAMA
    
    console.log('✅ Admin panel shown for:', user.email);
}

// --- TABLE & DATA LOGIC ---

async function loadGamesTable() {
    const tableBody = document.getElementById('game-table-body');
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading data from Firebase...</td></tr>';

    try {
        const snapshot = await db.collection("games").get();
        allGamesData = [];

        snapshot.forEach(doc => {
            let data = doc.data();
            data.id = doc.id;
            
            // LOGIKA 7 HARI (NEW RELEASE -> ONGOING)
            if (data.status === 'new_release' && data.createdAt) {
                const createdDate = data.createdAt.toDate();
                const now = new Date();
                const diffTime = Math.abs(now - createdDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays > 7) {
                    data.status = 'ongoing'; // Update di tampilan lokal
                    // Opsional: Update ke firebase di background
                    // db.collection('games').doc(doc.id).update({status: 'ongoing'});
                }
            }
            allGamesData.push(data);
        });

        renderTable();

    } catch (error) {
        console.error("Error loading games:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error: ${error.message}</td></tr>`;
    }
}

function renderTable() {
    const searchTerm = document.getElementById('search-game').value.toLowerCase();
    const filterStatus = document.getElementById('filter-status').value;
    const sortType = document.getElementById('sort-game').value;

    // 1. Filtering
    let filteredData = allGamesData.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);
        let matchesStatus = true;
        
        if (filterStatus === 'coming_soon') {
            matchesStatus = game.isComingSoon === true;
        } else if (filterStatus !== 'all') {
            matchesStatus = (game.status === filterStatus) && (!game.isComingSoon);
        }
        
        return matchesSearch && matchesStatus;
    });

    // 2. Sorting
    filteredData.sort((a, b) => {
        if (sortType === 'name_asc') {
            return a.title.localeCompare(b.title);
        } else if (sortType === 'oldest') {
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        } else { // Newest
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
    });

    // 3. Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // 4. Render HTML
    const tableBody = document.getElementById('game-table-body');
    tableBody.innerHTML = '';

    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Tidak ada data ditemukan.</td></tr>';
        renderPagination(0);
        return;
    }

    pageData.forEach(game => {
        let statusBadge = '';
        let infoText = '';

        if (game.isComingSoon) {
            statusBadge = '<span class="badge bg-warning text-dark">Coming Soon</span>';
            infoText = `<small class="text-warning">Rilis: ${game.releaseDate || 'TBA'}</small>`;
        } else {
            if (game.status === 'new_release') statusBadge = '<span class="badge bg-success">New Release</span>';
            else if (game.status === 'ongoing') statusBadge = '<span class="badge bg-info text-dark">Ongoing</span>';
            else if (game.status === 'ended') statusBadge = '<span class="badge bg-danger">Ended</span>';
            
            const dateObj = game.createdAt ? game.createdAt.toDate() : new Date();
            infoText = `<small class="text-muted">Up: ${dateObj.toLocaleDateString()}</small>`;
        }

        const thumb = game.thumbnailURL || 'https://via.placeholder.com/50';

        const row = `
            <tr>
                <td><img src="${thumb}" class="rounded border border-secondary" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td class="fw-bold text-white">${game.title}</td>
                <td>${statusBadge}</td>
                <td>${infoText}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="editGame('${game.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGame('${game.id}', '${game.title}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination-controls');
    container.innerHTML = '';
    if (totalPages <= 1) return;

    // Prev
    container.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link bg-dark border-secondary text-white" onclick="changePage(${currentPage - 1})">&laquo;</button></li>`;
    
    // Numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = currentPage === i ? 'bg-primary border-primary active' : 'bg-dark border-secondary text-white';
        container.innerHTML += `<li class="page-item"><button class="page-link ${activeClass}" onclick="changePage(${i})">${i}</button></li>`;
    }
    
    // Next
    container.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><button class="page-link bg-dark border-secondary text-white" onclick="changePage(${currentPage + 1})">&raquo;</button></li>`;
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

// --- FORM HANDLING (ADD / EDIT) ---

async function handleGameSubmitV2(e) {
    e.preventDefault();
    const btn = document.getElementById('game-submit-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';

    try {
        const editId = document.getElementById('edit-game-id').value;
        const title = document.getElementById('game-title').value;
        const slug = document.getElementById('game-slug').value;
        const desc = document.getElementById('game-description').value;
        
        let status = 'ongoing';
        if(document.getElementById('status-new').checked) status = 'new_release';
        if(document.getElementById('status-ended').checked) status = 'ended';
        
        const isComingSoon = document.getElementById('check-coming-soon').checked;
        const releaseDate = document.getElementById('release-date').value;

        // Validasi
        const thumbFile = document.getElementById('game-thumbnail').files[0];
        const logoFile = document.getElementById('game-logo').files[0];
        const bgFile = document.getElementById('game-bg').files[0];

        if (!editId && !thumbFile) throw new Error("Thumbnail wajib diupload untuk game baru.");

        // Upload Images
        let currentData = {};
        if (editId) {
             const doc = await db.collection('games').doc(editId).get();
             currentData = doc.data();
        }

        let thumbURL = currentData.thumbnailURL || '';
        let logoURL = currentData.logoURL || '';
        let bgURL = currentData.bgURL || '';

        if (thumbFile) thumbURL = await uploadToFirebaseStorage(thumbFile);
        if (logoFile) logoURL = await uploadToFirebaseStorage(logoFile);
        if (bgFile) bgURL = await uploadToFirebaseStorage(bgFile);

        const gameData = {
            title, slug, description: desc, status,
            isComingSoon,
            releaseDate: isComingSoon ? releaseDate : null,
            thumbnailURL: thumbURL,
            logoURL: logoURL,
            bgURL: bgURL,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!editId) {
            gameData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            gameData.createdBy = currentUser.email;
            gameData.sections = { main_story: [], character_story: [], side_story: [], event_story: [] };
            await db.collection("games").add(gameData);
            showNotification('✅ Game berhasil dibuat!', 'success');
        } else {
            await db.collection("games").doc(editId).update(gameData);
            showNotification('✅ Game berhasil diupdate!', 'success');
        }

        resetForm();
        loadGamesTable();
        loadGameSlugs(); // Refresh dropdown di chapter form

    } catch (error) {
        console.error(error);
        showNotification('❌ Error: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function deleteGame(id, title) {
    if (confirm(`Yakin ingin menghapus permanent game "${title}"?`)) {
        try {
            await db.collection("games").doc(id).delete();
            showNotification('✅ Game dihapus.', 'success');
            loadGamesTable();
        } catch (error) {
            showNotification('❌ Gagal hapus: ' + error.message, 'error');
        }
    }
}

async function editGame(id) {
    const game = allGamesData.find(g => g.id === id);
    if (!game) return;

    document.getElementById('game-form-card').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('form-title').innerHTML = `<i class="bi bi-pencil-square me-2"></i> Edit Game: ${game.title}`;
    document.getElementById('edit-game-id').value = id;
    document.getElementById('cancel-edit-btn').classList.remove('d-none');
    document.getElementById('game-submit-btn').innerHTML = '<i class="bi bi-check-lg me-2"></i> Update Game';

    document.getElementById('game-title').value = game.title;
    document.getElementById('game-slug').value = game.slug;
    document.getElementById('game-description').value = game.description;

    // Status Radio
    if (game.status === 'new_release') document.getElementById('status-new').checked = true;
    else if (game.status === 'ended') document.getElementById('status-ended').checked = true;
    else document.getElementById('status-ongoing').checked = true;

    // Coming Soon
    document.getElementById('check-coming-soon').checked = game.isComingSoon || false;
    document.getElementById('release-date').value = game.releaseDate || '';
    toggleComingSoon();

    // Previews
    if(game.thumbnailURL) showPreview('thumbnail', game.thumbnailURL);
    if(game.logoURL) showPreview('logo', game.logoURL);
    if(game.bgURL) showPreview('bg', game.bgURL);
}

function resetForm() {
    document.getElementById('game-form').reset();
    document.getElementById('edit-game-id').value = '';
    document.getElementById('form-title').innerHTML = '<i class="bi bi-controller me-2"></i> Tambah / Edit Game';
    document.getElementById('cancel-edit-btn').classList.add('d-none');
    document.getElementById('game-submit-btn').innerHTML = '<i class="bi bi-save me-1"></i> Simpan Game';
    
    ['thumbnail', 'logo', 'bg'].forEach(type => hidePreview(type));
    toggleComingSoon();
}

// --- HELPER FUNCTIONS ---

function toggleComingSoon() {
    const isChecked = document.getElementById('check-coming-soon').checked;
    const dateContainer = document.getElementById('date-picker-container');
    dateContainer.style.display = isChecked ? 'block' : 'none';
}

function setupImagePreview(inputId, imgId, txtId) {
    const input = document.getElementById(inputId);
    if(!input) return;
    input.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById(imgId).src = evt.target.result;
                document.getElementById(imgId).style.display = 'block';
                document.getElementById(txtId).style.display = 'none';
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

function showPreview(type, url) {
    document.getElementById(`preview-${type}`).src = url;
    document.getElementById(`preview-${type}`).style.display = 'block';
    document.getElementById(`txt-${type}`).style.display = 'none';
}

function hidePreview(type) {
    document.getElementById(`preview-${type}`).src = '';
    document.getElementById(`preview-${type}`).style.display = 'none';
    document.getElementById(`txt-${type}`).style.display = 'inline';
}

async function uploadToFirebaseStorage(imageFile) {
    const fileName = `game-assets/${Date.now()}-${imageFile.name}`; // Folder baru game-assets
    const storageRef = storage.ref().child(fileName);
    const snapshot = await storageRef.put(imageFile);
    return await snapshot.ref.getDownloadURL();
}

function generateSlug(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// --- CHAPTER MANAGEMENT (KEEP OLD LOGIC BUT ADAPTED) ---

function handleChapterSubmit(e) {
    e.preventDefault();
    const gameSlug = document.getElementById('chapter-game-slug').value;
    const section = document.getElementById('chapter-section').value;
    const title = document.getElementById('chapter-title').value.trim();
    const content = document.getElementById('chapter-content').value.trim();
    
    if (!gameSlug || !section || !title || !content) return showNotification('Data tidak lengkap', 'error');

    const btn = document.getElementById('chapter-submit-btn');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';

    db.collection("games").where("slug", "==", gameSlug).get()
    .then((snapshot) => {
        if (snapshot.empty) throw new Error('Game not found');
        const doc = snapshot.docs[0];
        const data = doc.data();
        
        const chapter = {
            title, content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        };
        
        const updatedSections = {...data.sections};
        if (!updatedSections[section]) updatedSections[section] = [];
        updatedSections[section].push(chapter);
        
        return db.collection("games").doc(doc.id).update({
            sections: updatedSections,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    })
    .then(() => {
        showNotification('✅ Chapter berhasil ditambahkan!', 'success');
        document.getElementById('chapter-form').reset();
    })
    .catch(err => showNotification('❌ Error: ' + err.message, 'error'))
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = original;
    });
}

function loadGameSlugs() {
    const select = document.getElementById('chapter-game-slug');
    if(!select) return;
    
    db.collection("games").get().then((snapshot) => {
        select.innerHTML = '<option value="" disabled selected>Select a game</option>';
        snapshot.forEach((doc) => {
            const game = doc.data();
            const option = document.createElement('option');
            option.value = game.slug;
            option.textContent = game.title;
            select.appendChild(option);
        });
    });
}

// --- SECTION & ADMIN (KEEP EXISTING) ---

function loadSections() {
    db.collection('sections').orderBy('createdAt').get().then(snap => {
        const list = document.getElementById('section-list-container');
        const dropdown = document.getElementById('chapter-section');
        if(list) list.innerHTML = '';
        if(dropdown) dropdown.innerHTML = '<option value="" disabled selected>Select a section</option>';
        
        snap.forEach(doc => {
            const sec = doc.data();
            if(list) list.innerHTML += `<div class="list-group-item bg-transparent text-white d-flex justify-content-between border-secondary">${sec.name} <button class="btn btn-sm btn-outline-danger" onclick="deleteSection('${sec.value}')"><i class="bi bi-trash"></i></button></div>`;
            if(dropdown) dropdown.innerHTML += `<option value="${sec.value}">${sec.name}</option>`;
        });
    });
}

async function addSection() {
    const name = document.getElementById('new-section-name').value;
    if(!name) return;
    const value = name.toLowerCase().replace(/\s+/g, '_');
    await db.collection('sections').doc(value).set({ name, value, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('new-section-name').value = '';
    loadSections();
}

async function deleteSection(id) {
    if(confirm('Hapus section ini?')) {
        await db.collection('sections').doc(id).delete();
        loadSections();
    }
}

// Admin List & Add Admin (Simplified for brevity, use full logic if needed)
function loadAdminList() {
    const list = document.getElementById('admin-list');
    if(!list) return;
    db.collection('admins').get().then(snap => {
        list.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            list.innerHTML += `<div class="d-flex justify-content-between mb-2 text-white border-bottom border-secondary pb-2"><div>${d.name} <small class="text-muted">(${d.email})</small></div></div>`;
        });
    });
}

async function addAdmin() {
    const email = document.getElementById('new-admin-email').value;
    const name = document.getElementById('new-admin-name').value;
    if(!email || !name) return;
    await db.collection('admins').doc(email).set({ email, name, role: 'admin' });
    loadAdminList();
    showNotification('Admin added', 'success');
}

// Update User Info
// 1. Fungsi Update Tampilan & Load Data User (Versi Firestore)
async function updateUserInfo(user) {
    if (!user) return;

    const nameInput = document.getElementById('settings-name');
    const usernameInput = document.getElementById('settings-username');
    const emailInput = document.getElementById('settings-email'); // Hidden input
    const imgProfile = document.getElementById('settings-profile-img');

    // Set data dasar Google ke UI Google Card
    updateGoogleUI(user);
    if(emailInput) emailInput.value = user.email;

    try {
        // Cek apakah data user sudah ada di Firestore?
        const userDoc = await db.collection('users').doc(user.email).get();

        if (userDoc.exists) {
            // JIKA SUDAH ADA (User Lama): Pakai data dari Database
            const data = userDoc.data();
            nameInput.value = data.displayName || user.displayName;
            usernameInput.value = data.username || user.email.split('@')[0]; 
            
            // Foto: Prioritaskan dari DB, jika tidak ada pakai dari Google
            imgProfile.src = data.photoURL || user.photoURL;

        } else {
            // JIKA BELUM ADA (User Baru): Ambil dari Google
            console.log("User baru, mengisi form dengan data Google...");
            
            nameInput.value = user.displayName || '';
            
            // Generate username otomatis dari email (sebelum @)
            let generatedUsername = user.email.split('@')[0];
            usernameInput.value = generatedUsername;

            imgProfile.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || 'User');
        }

    } catch (error) {
        console.error("Gagal mengambil data user:", error);
        // Fallback ke data Google jika error
        nameInput.value = user.displayName;
        usernameInput.value = user.email.split('@')[0];
        imgProfile.src = user.photoURL;
    }
}

// 2. Fungsi Simpan Perubahan ke Firestore
async function saveProfileChanges() {
    const btn = document.querySelector('#profile-form button[type="submit"]');
    const originalText = btn.innerHTML;
    
    // Ambil nilai input
    const name = document.getElementById('settings-name').value;
    const username = document.getElementById('settings-username').value;
    const email = document.getElementById('settings-email').value; 
    const currentPhoto = document.getElementById('settings-profile-img').src;

    if (!email) return showNotification('Error: Email tidak teridentifikasi', 'error');

    // UI Loading
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';

    try {
        // Simpan ke Collection 'users'
        await db.collection('users').doc(email).set({
            displayName: name,
            username: username,
            photoURL: currentPhoto, 
            email: email,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }); 

        showNotification('✅ Profil berhasil disimpan!', 'success');

        // Update juga nama di Navbar
        const navName = document.getElementById('nav-gh-username'); 
        const navFullname = document.getElementById('nav-gh-fullname'); 
        if(navName) navName.textContent = username;
        if(navFullname) navFullname.textContent = name;

    } catch (error) {
        console.error("Error saving profile:", error);
        showNotification('❌ Gagal menyimpan: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 3. Fungsi Tampilan Kartu Google
function updateGoogleUI(user) {
    const nameEl = document.getElementById('g-conn-name');
    const emailEl = document.getElementById('g-conn-email');
    const statusText = document.getElementById('g-conn-text');
    const statusIcon = document.getElementById('g-conn-icon');
    const statusBadge = document.getElementById('g-conn-status-badge');
    const hoverText = document.getElementById('g-hover-text');

    if (user) {
        nameEl.textContent = user.displayName || 'Google User';
        emailEl.textContent = user.email;
        emailEl.style.display = 'block';

        statusText.textContent = 'Terhubung';
        statusBadge.className = 'd-flex align-items-center gap-2 text-success fw-bold'; 
        statusIcon.className = 'bi bi-link-45deg fs-5'; 
        if(hoverText) hoverText.textContent = "Putuskan Sambungan";
    } else {
        nameEl.textContent = 'Tidak terhubung';
        emailEl.style.display = 'none';

        statusText.textContent = 'Terputus';
        statusBadge.className = 'd-flex align-items-center gap-2 text-secondary fw-bold';
        statusIcon.className = 'bi bi-slash-circle fs-5';
        if(hoverText) hoverText.textContent = "Hubungkan Akun";
    }
}

// Export Globals
window.showAdminPanel = showAdminPanel;
window.changePage = changePage;
window.editGame = editGame;
window.deleteGame = deleteGame;
window.resetForm = resetForm;
window.toggleComingSoon = toggleComingSoon;
window.addSection = addSection;
window.deleteSection = deleteSection;
window.addAdmin = addAdmin;

// --- LOGIKA PROFILE & KEAMANAN (Unified) ---

let pendingAction = null; // 'verify_email', 'change_email', 'change_password'
let pendingData = null;   // Data sementara (email baru/pass baru)
let generatedOTP = null;
let otpTimer = null;
const RESEND_DELAY = 60;

// 1. UPDATE TAMPILAN USER (PINTAR)
async function updateUserInfo(user) {
    if (!user) return;

    // Elemen UI
    const nameInput = document.getElementById('settings-name');
    const usernameInput = document.getElementById('settings-username');
    const emailInput = document.getElementById('settings-email');
    const imgProfile = document.getElementById('settings-profile-img');
    const statusContainer = document.getElementById('email-status-container');
    const btnVerify = document.getElementById('btn-verify-email');
    const badgeGoogle = document.getElementById('provider-badge-google');
    const passStatusText = document.getElementById('password-status-text');
    const btnPass = document.getElementById('btn-change-password');

    // Reset UI
    if(emailInput) emailInput.value = user.email;
    updateGoogleUI(user);

    // Cek Provider (Google/Password)
    const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
    const isPassword = user.providerData.some(p => p.providerId === 'password');

    if (isGoogle) badgeGoogle.style.display = 'block';
    
    // Status Password
    if (isPassword) {
        passStatusText.textContent = "Password aktif. Terakhir diubah: " + (user.metadata.lastSignInTime || 'N/A');
        btnPass.textContent = "Ubah Password";
        btnPass.className = "btn btn-sm btn-outline-light";
    } else {
        passStatusText.textContent = "Anda login via Google. Belum ada password.";
        btnPass.textContent = "Buat Password";
        btnPass.className = "btn btn-sm btn-primary";
    }

    try {
        // Ambil Data Firestore
        const userDoc = await db.collection('users').doc(user.email).get();
        let isVerified = user.emailVerified; 

        if (userDoc.exists) {
            const data = userDoc.data();
            nameInput.value = data.displayName || user.displayName;
            usernameInput.value = data.username || user.email.split('@')[0];
            imgProfile.src = data.photoURL || user.photoURL;
            
            // Sinkronisasi status verifikasi
            if (data.emailVerified) isVerified = true;
        } else {
            // User Baru
            nameInput.value = user.displayName || '';
            usernameInput.value = user.email.split('@')[0];
            imgProfile.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
        }

        // Update UI Verifikasi (Pake Ikon Bagus)
        if (isVerified) {
            statusContainer.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> <span class="text-success fw-bold">Email Terverifikasi</span>';
            btnVerify.style.display = 'none';
        } else {
            statusContainer.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning"></i> <span class="text-warning">Email belum terverifikasi</span>';
            btnVerify.style.display = 'block';
        }

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// 2. MODAL & FLOW MANAGER
function openChangeModal(type) {
    const modal = new bootstrap.Modal(document.getElementById('securityModal'));
    const title = document.getElementById('securityModalTitle');
    const step1 = document.getElementById('step-input-data');
    const step2 = document.getElementById('step-verify-otp');
    
    // Reset State
    step1.classList.remove('d-none');
    step2.classList.add('d-none');
    document.getElementById('input-group-email').classList.add('d-none');
    document.getElementById('input-group-password').classList.add('d-none');
    document.getElementById('new-email-input').value = '';
    document.getElementById('new-pass-input').value = '';
    document.getElementById('confirm-pass-input').value = '';
    
    // Set Context
    if (type === 'email') {
        title.innerHTML = '<i class="bi bi-envelope-arrow-up"></i> Ganti Email';
        document.getElementById('input-group-email').classList.remove('d-none');
        pendingAction = 'change_email';
    } else if (type === 'password') {
        title.innerHTML = '<i class="bi bi-key"></i> Setup / Ubah Password';
        document.getElementById('input-group-password').classList.remove('d-none');
        pendingAction = 'change_password';
    }

    modal.show();
}

function initiateAction(type) {
    if (type === 'verify_email') {
        // Langsung kirim OTP ke email saat ini
        pendingAction = 'verify_email';
        pendingData = auth.currentUser.email;
        sendOtpAndShowModal(auth.currentUser.email);
    }
}

// 3. VALIDASI & REQUEST OTP
function requestOtpForAction() {
    const emailErr = document.getElementById('email-error');
    const passErr = document.getElementById('pass-error');
    emailErr.textContent = '';
    passErr.textContent = '';

    let targetEmail = auth.currentUser.email; // Default kirim ke email sekarang

    if (pendingAction === 'change_email') {
        const newEmail = document.getElementById('new-email-input').value;
        // Validasi Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            emailErr.textContent = "Format email tidak valid.";
            return;
        }
        if (newEmail === auth.currentUser.email) {
            emailErr.textContent = "Email baru tidak boleh sama dengan email saat ini.";
            return;
        }
        pendingData = newEmail;
        targetEmail = newEmail; // Kirim OTP ke email BARU untuk verifikasi kepemilikan
    } 
    else if (pendingAction === 'change_password') {
        const p1 = document.getElementById('new-pass-input').value;
        const p2 = document.getElementById('confirm-pass-input').value;
        
        if (p1.length < 6) {
            passErr.textContent = "Password minimal 6 karakter.";
            return;
        }
        if (p1 !== p2) {
            passErr.textContent = "Konfirmasi password tidak cocok.";
            return;
        }
        pendingData = p1;
        // targetEmail tetap email saat ini (currentUser.email)
    }

    // Switch ke Step 2 (UI OTP)
    document.getElementById('step-input-data').classList.add('d-none');
    document.getElementById('step-verify-otp').classList.remove('d-none');
    
    sendOtpAndShowModal(targetEmail);
}

// 4. KIRIM OTP (EmailJS)
function sendOtpAndShowModal(emailDest) {
    // Jika modal belum terbuka (kasus verify_email langsung), buka modal
    const modalEl = document.getElementById('securityModal');
    if (!modalEl.classList.contains('show')) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        document.getElementById('step-input-data').classList.add('d-none');
        document.getElementById('step-verify-otp').classList.remove('d-none');
    }

    document.getElementById('otp-target-email').textContent = emailDest;
    document.getElementById('modal-otp-input').value = '';
    document.getElementById('modal-otp-input').focus();
    
    // Generate Logic
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Kirim via EmailJS
    if (window.emailjs && window.ENV_CONFIG) {
        const params = {
            to_email: emailDest,
            to_name: auth.currentUser.displayName || 'User',
            otp_code: generatedOTP
        };
        // GANTI ID DI BAWAH INI
        const SID = 'YOUR_SERVICE_ID'; 
        const TID = 'YOUR_TEMPLATE_ID'; 
        
        emailjs.send(SID, TID, params)
            .then(() => showNotification(`Kode terkirim ke ${emailDest}`, 'success'))
            .catch(err => console.error(err));
    } else {
        console.log(`[SIMULASI] OTP untuk ${emailDest}: ${generatedOTP}`);
        showNotification('Mode Simulasi: Cek Console', 'info');
    }

    startOtpTimer();
}

// 5. VERIFIKASI OTP & EKSEKUSI FINAL
async function verifyOtpAndCommit() {
    const inputOtp = document.getElementById('modal-otp-input').value;
    const msg = document.getElementById('otp-status-msg');

    if (inputOtp !== generatedOTP) {
        msg.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle"></i> Kode Salah</span>';
        return;
    }

    // OTP BENAR -> LAKUKAN AKSI FIREBASE
    msg.innerHTML = '<span class="text-success"><i class="bi bi-check-circle"></i> Terverifikasi</span>';
    const modal = bootstrap.Modal.getInstance(document.getElementById('securityModal'));
    
    try {
        if (pendingAction === 'verify_email') {
            // Update Firestore
            await db.collection('users').doc(auth.currentUser.email).update({
                emailVerified: true
            });
            // Update Auth (Opsional, kadang butuh kirim link asli firebase)
            showNotification('✅ Email berhasil diverifikasi di sistem!', 'success');
            
        } else if (pendingAction === 'change_email') {
            // Firebase Auth Update
            await auth.currentUser.updateEmail(pendingData);
            // Pindahkan Data Firestore ke ID Baru
            const oldDoc = await db.collection('users').doc(auth.currentUser.email).get();
            if (oldDoc.exists) {
                await db.collection('users').doc(pendingData).set(oldDoc.data());
                // await db.collection('users').doc(auth.currentUser.email).delete(); // Opsional hapus lama
            }
            showNotification('✅ Email berhasil diubah! Silakan login ulang.', 'success');
            setTimeout(() => location.reload(), 2000);

        } else if (pendingAction === 'change_password') {
            await auth.currentUser.updatePassword(pendingData);
            showNotification('✅ Password berhasil diubah/dibuat!', 'success');
        }

        modal.hide();
        updateUserInfo(auth.currentUser); // Refresh UI

    } catch (error) {
        console.error(error);
        if (error.code === 'auth/requires-recent-login') {
            showNotification('⚠️ Sesi kedaluwarsa. Silakan login ulang lalu coba lagi.', 'warning');
        } else {
            showNotification('Gagal: ' + error.message, 'error');
        }
        modal.hide();
    }
}

// 6. TIMER HELPER
function startOtpTimer() {
    let timeLeft = RESEND_DELAY;
    const timerDisplay = document.getElementById('modal-timer');
    if (otpTimer) clearInterval(otpTimer);
    
    timerDisplay.textContent = `Resend in ${timeLeft}s`;
    
    otpTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Resend in ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            timerDisplay.innerHTML = '<a href="#" class="text-warning" onclick="requestOtpForAction()">Kirim Ulang</a>';
        }
    }, 1000);
}

// 7. SIMPAN PROFIL BIASA (Nama & Username)
async function saveProfileChanges() {
    const name = document.getElementById('settings-name').value.trim();
    const username = document.getElementById('settings-username').value.trim().toLowerCase();
    const user = auth.currentUser;
    const email = user.email;

    // VALIDASI USERNAME (Regex: huruf, angka, underscore, tanpa spasi)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        document.getElementById('username-error').textContent = "Username hanya boleh huruf, angka, dan underscore (_).";
        document.getElementById('username-error').classList.remove('d-none');
        return;
    }
    document.getElementById('username-error').classList.add('d-none');

    try {
        await db.collection('users').doc(email).set({
            displayName: name,
            username: username,
            email: email,
            photoURL: document.getElementById('settings-profile-img').src,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Update Auth Profile juga
        await user.updateProfile({ displayName: name });

        showNotification('✅ Profil berhasil disimpan', 'success');
        
        // Update Navbar Realtime
        const navName = document.getElementById('nav-gh-username');
        if(navName) navName.textContent = username;

    } catch (error) {
        showNotification('❌ Gagal: ' + error.message, 'error');
    }
}

// Custom Notification dengan Icon (Mengganti yang lama di auth-system.js jika perlu, atau pakai ini lokal)
// Pastikan fungsi showNotification di auth-system.js mendukung HTML innerHTML, bukan textContent.