// assets/js/admin.js - ADMIN PANEL ONLY FUNCTIONS
let adminPanelInitialized = false;

// Initialize admin panel
function initAdminPanel() {
    if (adminPanelInitialized) {
        console.log('⚠️ Admin panel already initialized');
        return;
    }
    
    adminPanelInitialized = true;
    
    console.log('🚀 Initializing admin panel...');
    
    // Set up form submissions
    const gameForm = document.getElementById('game-form');
    if (gameForm) {
        gameForm.addEventListener('submit', handleGameSubmit);
    }
    
    const chapterForm = document.getElementById('chapter-form');
    if (chapterForm) {
        chapterForm.addEventListener('submit', handleChapterSubmit);
    }
    
    // Auto-generate slug from title
    const gameTitleInput = document.getElementById('game-title');
    if (gameTitleInput) {
        gameTitleInput.addEventListener('input', function() {
            const slugField = document.getElementById('game-slug');
            if (!slugField.value) {
                const slug = generateSlug(this.value);
                slugField.value = slug;
            }
        });
    }
    
    console.log('✅ Admin panel initialization complete');
}

// Show admin panel (hanya untuk admin page)
function showAdminPanel(user) {
    const adminSection = document.getElementById('admin-panel-section');
    if (adminSection) {
        adminSection.classList.remove('d-none');
    }
    
    // Load data
    loadGameSlugs();
    loadAdminList();
    loadSections(); // <--- TAMBAHKAN INI (Load Sections saat panel dibuka)
    updateUserInfo(user);
    
    console.log('✅ Admin panel shown for:', user.email);
}

// Show access denied message (hanya untuk admin page)
function showAccessDenied(userEmail) {
    const adminSection = document.getElementById('admin-panel-section');
    if (adminSection) {
        adminSection.innerHTML = `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card bg-dark">
                            <div class="card-body text-center p-5">
                                <div class="mb-3">
                                    <i class="bi bi-shield-x display-1 text-danger"></i>
                                </div>
                                <h4 class="text-danger mb-3">Access Denied</h4>
                                <p class="mb-3">Admin panel access is restricted to authorized users only.</p>
                                <p class="text-muted small mb-3">Logged in as: ${userEmail}</p>
                                <p class="text-warning small mb-4">
                                    <i class="bi bi-exclamation-triangle"></i>
                                    Contact superadmin to get access
                                </p>
                                <button onclick="signOut()" class="btn btn-outline-secondary">
                                    <i class="bi bi-box-arrow-right me-1"></i> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Update user info in UI
function updateUserInfo(user) {
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${user.photoURL || 'https://via.placeholder.com/32'}" 
                     class="rounded-circle me-2" width="32" height="32" alt="Profile">
                <div>
                    <div class="small">${user.displayName || user.email}</div>
                    <div class="text-muted smaller">${user.email}</div>
                </div>
            </div>
        `;
    }
}

// ✅ FUNCTION TO UPLOAD TO FIREBASE STORAGE
async function uploadToFirebaseStorage(imageFile) {
    try {
        console.log('📤 Starting Firebase Storage upload...');
        
        // Generate unique filename
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `game-thumbnails/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Create storage reference
        const storageRef = storage.ref().child(fileName);
        
        console.log('📁 Uploading to:', fileName);
        
        // Upload file dengan metadata
        const uploadTask = storageRef.put(imageFile, {
            customMetadata: {
                'uploadedBy': currentUser.email,
                'originalName': imageFile.name,
                'uploadTime': new Date().toISOString()
            }
        });
        
        // Track upload progress
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload progress: ${progress.toFixed(2)}%`);
                
                // Update UI progress (optional)
                const submitBtn = document.getElementById('game-submit-btn');
                if (progress < 100) {
                    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Uploading... ${Math.round(progress)}%`;
                }
            },
            (error) => {
                console.error('Upload error:', error);
                throw error;
            }
        );
        
        // Wait for upload to complete
        const snapshot = await uploadTask;
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        console.log('✅ Image uploaded to Firebase Storage:', downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error('❌ Error uploading to Firebase Storage:', error);
        throw new Error('Upload failed: ' + error.message);
    }
}

// ✅ FUNCTION TO GENERATE SLUG
function generateSlug(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')     // Remove invalid chars
        .replace(/\s+/g, '-')            // Replace spaces with -
        .replace(/-+/g, '-')             // Replace multiple - with single -
        .replace(/^-+/, '')              // Trim - from start
        .replace(/-+$/, '')              // Trim - from end
        .trim();
}

// Handle game form submission dengan Firebase Storage upload
async function handleGameSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('game-title').value.trim();
    let slug = document.getElementById('game-slug').value.trim();
    const description = document.getElementById('game-description').value.trim();
    const thumbnailFile = document.getElementById('game-thumbnail').files[0];
    
    // ✅ AUTO-GENERATE SLUG JIKA KOSONG
    if (!slug && title) {
        slug = generateSlug(title);
        document.getElementById('game-slug').value = slug;
        console.log('✅ Auto-generated slug:', slug);
    }
    
    // Get included sections
    // UPDATE: Checkbox manual dihapus karena sekarang kita menggunakan Section Management dinamis.
    // Kita biarkan array ini kosong agar fungsi saveGameToFirestore tetap berjalan lancar.
    const includes = []; 
    
    // Validate form
    if (!title || !slug || !description) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }

    if (!thumbnailFile) {
        showNotification('❌ Please select a thumbnail image', 'error');
        return;
    }

    // Validate file size (max 5MB untuk Firebase Storage gratis)
    if (thumbnailFile.size > 5 * 1024 * 1024) {
        showNotification('❌ File size too large. Maximum 5MB allowed.', 'error');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(thumbnailFile.type)) {
        showNotification('❌ Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
        return;
    }

    // ✅ VALIDATE SLUG FORMAT
    if (!/^[a-z0-9-]+$/.test(slug)) {
        showNotification('❌ Slug can only contain lowercase letters, numbers, and hyphens', 'error');
        return;
    }

    // Check if slug already exists
    try {
        const existingGame = await db.collection("games").where("slug", "==", slug).get();
        if (!existingGame.empty) {
            showNotification('❌ Slug already exists. Please choose a different one.', 'error');
            return;
        }
    } catch (error) {
        console.error('Error checking slug:', error);
    }

    try {
        // Show loading state
        const submitBtn = document.getElementById('game-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Uploading Image...';

        // ✅ UPLOAD IMAGE TO FIREBASE STORAGE
        const thumbnailURL = await uploadToFirebaseStorage(thumbnailFile);
        
        // Update button text
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Saving Game...';
        
        // Save game to Firestore dengan URL dari Firebase Storage
        await saveGameToFirestore(title, slug, description, includes, thumbnailURL);
        
        // Success
        showNotification('✅ Game created successfully!', 'success');
        document.getElementById('game-form').reset();
        clearFileUpload();
        
        // Reload game slugs for chapter form
        loadGameSlugs();
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Error: ' + error.message, 'error');
    } finally {
        // Reset button
        const submitBtn = document.getElementById('game-submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Create Game';
    }
}

// Save game to Firestore
function saveGameToFirestore(title, slug, description, includes, thumbnailURL) {
    const gameData = {
        title: title,
        slug: slug,
        description: description,
        includes: includes,
        thumbnailURL: thumbnailURL,
        popularity: 100,
        sections: {
            main_story: [],
            character_story: [],
            side_story: [],
            event_story: []
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    return db.collection("games").add(gameData);
}

// Handle chapter form submission
function handleChapterSubmit(e) {
    e.preventDefault();
    
    const gameSlug = document.getElementById('chapter-game-slug').value;
    const section = document.getElementById('chapter-section').value;
    const title = document.getElementById('chapter-title').value.trim();
    const content = document.getElementById('chapter-content').value.trim();
    
    if (!gameSlug || !section || !title || !content) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }

    // Show loading
    const submitBtn = document.getElementById('chapter-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Adding Chapter...';

    // Find the game document by slug
    db.collection("games").where("slug", "==", gameSlug).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                throw new Error('Game not found');
            }
            
            const gameDoc = querySnapshot.docs[0];
            const gameData = gameDoc.data();
            
            // Create the chapter object
            const chapter = {
                title: title,
                content: content,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email
            };
            
            // Add the chapter to the appropriate section
            const updatedSections = {...gameData.sections};
            if (!updatedSections[section]) {
                updatedSections[section] = [];
            }
            updatedSections[section].push(chapter);
            
            // Update the game document
            return db.collection("games").doc(gameDoc.id).update({
                sections: updatedSections,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showNotification('✅ Chapter added successfully!', 'success');
            document.getElementById('chapter-form').reset();
            
        })
        .catch((error) => {
            console.error("Error adding chapter: ", error);
            showNotification('❌ Error adding chapter: ' + error.message, 'error');
        })
        .finally(() => {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Chapter';
        });
}

// Load game slugs for dropdown
function loadGameSlugs() {
    const gameSlugSelect = document.getElementById('chapter-game-slug');
    
    // Pastikan elemen dropdown ada
    if (gameSlugSelect) {
        // Bersihkan isi dropdown dulu
        gameSlugSelect.innerHTML = '';
        
        // 1. BUAT PLACEHOLDER (KASUS 13)
        // Kita set disabled, selected, dan hidden agar tidak muncul di list
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "Select a game";
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.hidden = true;
        gameSlugSelect.appendChild(placeholder);

        // 2. TAMBAHKAN WUTHERING WAVES MANUAL (KASUS 12)
        const wwOption = document.createElement('option');
        wwOption.value = "wuthering-waves";
        wwOption.textContent = "Wuthering Waves";
        gameSlugSelect.appendChild(wwOption);

        // 3. LOAD GAME LAIN DARI DATABASE (JIKA ADA)
        db.collection("games").orderBy("createdAt", "desc").get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const game = doc.data();
                    
                    // Cek biar tidak duplikat dengan Wuthering Waves yang kita tambah manual
                    if (game.slug !== 'wuthering-waves') {
                        const option = document.createElement('option');
                        option.value = game.slug;
                        option.textContent = game.title;
                        gameSlugSelect.appendChild(option);
                    }
                });
                
                console.log('✅ Loaded game slugs:', querySnapshot.size);
            })
            .catch((error) => {
                console.error("Error loading game slugs: ", error);
            });
    }
}

// Clear file upload (helper function)
function clearFileUpload() {
    document.getElementById('game-thumbnail').value = '';
    document.getElementById('upload-placeholder').style.display = 'block';
    document.getElementById('upload-preview').style.display = 'none';
}

// ==================== ADMIN MANAGEMENT FUNCTIONS ====================

// Function to add new admin
async function addAdmin() {
    if (!currentUser) {
        showNotification('❌ Please sign in first', 'error');
        return;
    }
    
    const newAdminEmail = document.getElementById('new-admin-email').value.trim();
    const newAdminName = document.getElementById('new-admin-name').value.trim();
    
    if (!newAdminEmail || !newAdminName) {
        showNotification('❌ Please fill in both email and name', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
        showNotification('❌ Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Check if admin already exists
        const existingAdmin = await db.collection('admins').doc(newAdminEmail).get();
        if (existingAdmin.exists) {
            showNotification('❌ Admin with this email already exists!', 'error');
            return;
        }
        
        // Add to admins collection
        await db.collection('admins').doc(newAdminEmail).set({
            email: newAdminEmail,
            name: newAdminName,
            role: 'admin',
            addedAt: firebase.firestore.FieldValue.serverTimestamp(),
            addedBy: currentUser.email,
            addedByName: currentUser.displayName || currentUser.email
        });
        
        showNotification('✅ Admin added successfully!', 'success');
        document.getElementById('new-admin-email').value = '';
        document.getElementById('new-admin-name').value = '';
        
        // Refresh admin list
        loadAdminList();
        
    } catch (error) {
        console.error('Error adding admin:', error);
        showNotification('❌ Error adding admin: ' + error.message, 'error');
    }
}

// Function to load admin list
async function loadAdminList() {
    try {
        const querySnapshot = await db.collection('admins').orderBy('addedAt', 'desc').get();
        const adminList = document.getElementById('admin-list');
        
        if (!adminList) return;
        
        adminList.innerHTML = '';
        
        if (querySnapshot.empty) {
            adminList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-people display-6"></i>
                    <p>No admins found</p>
                    <p class="small">Add the first admin using the form above</p>
                </div>
            `;
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const admin = doc.data();
            const adminItem = document.createElement('div');
            adminItem.className = 'admin-item';
            adminItem.innerHTML = `
                <div class="admin-info">
                    <div class="admin-name">
                        ${admin.name}
                        <span class="badge ${admin.role === 'superadmin' ? 'bg-warning' : 'bg-primary'} badge-role">
                            ${admin.role}
                        </span>
                    </div>
                    <div class="admin-email">${admin.email}</div>
                    <div class="admin-meta">
                        Added: ${formatDate(admin.addedAt?.toDate())} by ${admin.addedByName || admin.addedBy || 'system'}
                    </div>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeAdmin('${admin.email}')" 
                            ${admin.role === 'superadmin' || admin.email === currentUser?.email ? 'disabled' : ''}
                            title="${admin.role === 'superadmin' ? 'Cannot remove superadmin' : admin.email === currentUser?.email ? 'Cannot remove yourself' : 'Remove admin'}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            adminList.appendChild(adminItem);
        });
        
        console.log('✅ Loaded admin list:', querySnapshot.size);
        
    } catch (error) {
        console.error('Error loading admin list:', error);
        const adminList = document.getElementById('admin-list');
        if (adminList) {
            adminList.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error loading admin list: ${error.message}
                </div>
            `;
        }
    }
}

// Function to remove admin
async function removeAdmin(email) {
    if (!currentUser) {
        showNotification('❌ Please sign in first', 'error');
        return;
    }
    
    if (email === currentUser.email) {
        showNotification('❌ You cannot remove yourself!', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to remove ${email} as admin?`)) {
        return;
    }
    
    try {
        await db.collection('admins').doc(email).delete();
        showNotification('✅ Admin removed successfully!', 'success');
        loadAdminList();
    } catch (error) {
        console.error('Error removing admin:', error);
        showNotification('❌ Error removing admin: ' + error.message, 'error');
    }
}

// Helper function to format date
function formatDate(date) {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today, ' + date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else if (diffDays === 1) {
        return 'Yesterday, ' + date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Admin page DOM loaded');
    initAdminPanel();
});

// Export functions for global access
window.addAdmin = addAdmin;
window.removeAdmin = removeAdmin;
window.clearFileUpload = clearFileUpload;

// 1. Tambah Section Baru
async function addSection() {
    const input = document.getElementById('new-section-name');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('❌ Nama section tidak boleh kosong', 'error');
        return;
    }

    // Generate value/ID (contoh: "Side Story" -> "side_story")
    const value = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    try {
        // Simpan ke Firebase collection 'sections'
        await db.collection('sections').doc(value).set({
            name: name,
            value: value, // ID teknis untuk codingan
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotification('✅ Section berhasil ditambahkan!', 'success');
        input.value = ''; // Reset input
        loadSections(); // Refresh list & dropdown
        
    } catch (error) {
        console.error("Error adding section:", error);
        showNotification('❌ Gagal menambah section: ' + error.message, 'error');
    }
}

// 2. Load Section (Tampilkan di List & Dropdown Chapter)
function loadSections() {
    console.log("Loading sections...");
    
    db.collection('sections').orderBy('createdAt', 'asc').get()
        .then((querySnapshot) => {
            const listContainer = document.getElementById('section-list-container');
            const dropdown = document.getElementById('chapter-section');
            
            // Reset UI
            if (listContainer) listContainer.innerHTML = '';
            if (dropdown) {
                dropdown.innerHTML = '<option value="" disabled selected>Select a section</option>';
            }

            // Jika kosong, buat default section
            if (querySnapshot.empty) {
                // Opsional: Jika database kosong, kita bisa auto-create section dasar
                createDefaultSections();
                return;
            }

            querySnapshot.forEach((doc) => {
                const section = doc.data();
                
                // A. Tampilkan di List (Untuk Edit/Hapus) - KASUS 8
                if (listContainer) {
                    const item = document.createElement('div');
                    item.className = 'list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-bottom border-secondary';
                    item.innerHTML = `
                        <div>
                            <span class="fw-bold">${section.name}</span>
                            <small class="text-muted ms-2">(${section.value})</small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-warning" onclick="editSection('${section.value}', '${section.name}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteSection('${section.value}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                    listContainer.appendChild(item);
                }

                // B. Masukkan ke Dropdown Chapter - KASUS 7
                if (dropdown) {
                    const option = document.createElement('option');
                    option.value = section.value;
                    option.textContent = section.name;
                    dropdown.appendChild(option);
                }
            });
        })
        .catch((error) => {
            console.error("Error loading sections:", error);
            const listContainer = document.getElementById('section-list-container');
            if (listContainer) {
                listContainer.innerHTML = `<div class="text-danger p-3">Error: ${error.message}. Cek Console (F12).</div>`;
            }
        });
}

// 3. Edit Section
async function editSection(id, oldName) {
    // Tampilkan prompt sederhana untuk edit nama
    const newName = prompt("Edit Nama Section:", oldName);
    
    if (newName && newName !== oldName) {
        try {
            await db.collection('sections').doc(id).update({
                name: newName
            });
            showNotification('✅ Nama section diupdate!', 'success');
            loadSections();
        } catch (error) {
            showNotification('❌ Gagal update: ' + error.message, 'error');
        }
    }
}

// 4. Hapus Section
async function deleteSection(id) {
    if (confirm('Yakin ingin menghapus section ini? Hati-hati jika sudah ada chapter yang menggunakan section ini.')) {
        try {
            await db.collection('sections').doc(id).delete();
            showNotification('✅ Section dihapus.', 'success');
            loadSections();
        } catch (error) {
            showNotification('❌ Gagal hapus: ' + error.message, 'error');
        }
    }
}

// Helper: Buat default section jika database kosong pertama kali
function createDefaultSections() {
    const defaults = ["Main Story", "Character Story", "Side Story", "Event Story"];
    defaults.forEach(name => {
        const value = name.toLowerCase().replace(/\s+/g, '_');
        db.collection('sections').doc(value).set({
            name: name,
            value: value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });
    setTimeout(loadSections, 1000); // Reload setelah membuat
}

// Export fungsi agar bisa dipanggil HTML
window.addSection = addSection;
window.editSection = editSection;
window.deleteSection = deleteSection;
window.loadSections = loadSections;