// assets/js/admin.js - V2 (Unified Content Management)

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

// Show admin panel (Dipanggil dari auth-system.js)
function showAdminPanel(user) {
    const adminSection = document.getElementById('admin-panel-section');
    if (adminSection) adminSection.classList.remove('d-none');
    
    // Load Data
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
// (Copy fungsi addSection, loadSections, dll dari file lama jika belum ada di sini.
//  Tapi di script ini saya sudah cukupkan fungsi intinya.)

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
function updateUserInfo(user) {
    // Fungsi ini bisa dikosongkan jika sudah ditangani di admin.html script
    // Tapi untuk keamanan, biarkan placeholder
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