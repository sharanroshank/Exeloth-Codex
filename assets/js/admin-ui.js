// assets/js/admin-ui.js

/**
 * Fungsi untuk Berpindah Bagian/Section (Tab)
 * @param {string} sectionId - ID dari div konten yang ingin ditampilkan
 * @param {HTMLElement|null} elementLink - Element link sidebar yang diklik (bisa null jika dari navbar)
 */
function switchSection(sectionId, elementLink) {
    console.log(`🔄 Switching to section: ${sectionId}`);
    
    // 1. Sembunyikan SEMUA bagian konten
    const allSections = document.querySelectorAll('.admin-tab-content');
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // 2. Tampilkan bagian yang dipilih
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('section:switched', { 
            detail: { sectionId: sectionId } 
        }));
    }

    // 3. Update status 'Active' pada Sidebar Link
    const allLinks = document.querySelectorAll('.nav-link-custom');
    allLinks.forEach(link => link.classList.remove('active'));

    if (elementLink) {
        // Jika diklik dari Sidebar
        elementLink.classList.add('active');
    } else {
        // Jika diklik dari Navbar (elementLink null), cari tombol sidebar yang sesuai secara manual
        // Kita cari link sidebar yang memiliki onclick mengandung ID section tersebut
        const autoLink = document.querySelector(`.nav-link-custom[onclick*="${sectionId}"]`);
        if (autoLink) {
            autoLink.classList.add('active');
        }
    }

    // 4. Reset semua dropdown saat berpindah section
    if (window.resetAllDropdowns) {
        setTimeout(() => {
            window.resetAllDropdowns();
            console.log('✅ Dropdowns reset after section switch');
        }, 100);
    }

    // 5. Tutup sidebar otomatis di mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('active'); 
        const overlay = document.querySelector('.overlay-sidebar');
        if (overlay) overlay.style.display = 'none';
    }
    
    // 6. Scroll ke atas konten
    const contentArea = document.querySelector('.main-content-wrapper');
    if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    console.log(`✅ Switched to section: ${sectionId}`);
}

/**
 * Fungsi untuk berpindah ke section tertentu dari luar (misal dari navbar)
 * @param {string} sectionId - ID section yang ingin dituju
 */
function goToSection(sectionId) {
    if (typeof switchSection === 'function') {
        switchSection(sectionId, null);
    } else {
        console.error('switchSection function not found');
    }
}

/**
 * Reset form game ke kondisi awal
 */
function resetForm() {
    console.log('🔄 Resetting game form...');
    
    // Reset semua input
    document.getElementById('game-form').reset();
    document.getElementById('edit-game-id').value = '';
    document.getElementById('game-slug').value = '';
    
    // Reset preview images
    const previews = ['preview-thumbnail', 'preview-logo', 'preview-bg'];
    previews.forEach(id => {
        const preview = document.getElementById(id);
        if (preview) {
            preview.src = 'https://placehold.co/400x300/2c3035/ffffff?text=Preview';
            preview.style.display = 'none';
        }
    });
    
    // Reset file inputs
    const fileInputs = ['game-thumbnail', 'game-logo', 'game-bg'];
    fileInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    
    // Reset text indicators
    const textIndicators = ['txt-thumbnail', 'txt-logo', 'txt-bg'];
    textIndicators.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = 'No file chosen';
    });
    
    // Update form title
    const formTitle = document.querySelector('#game-form .card-header h5');
    if (formTitle) {
        formTitle.textContent = 'Add New Game';
    }
    
    // Update submit button
    const submitBtn = document.querySelector('#game-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Add Game';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-primary');
    }
    
    // Reset chapter form jika ada
    const chapterForm = document.getElementById('chapter-form');
    if (chapterForm) {
        chapterForm.reset();
        document.getElementById('edit-chapter-id').value = '';
    }
    
    // Reset dropdowns
    if (window.resetAllDropdowns) {
        setTimeout(() => {
            window.resetAllDropdowns();
        }, 50);
    }
    
    showNotification('Form has been reset', 'info');
}

/**
 * Toggle visibility untuk coming soon games
 */
function toggleComingSoon() {
    console.log('🔧 Toggle coming soon section...');
    
    const comingSoonSection = document.getElementById('coming-soon-section');
    const toggleBtn = document.getElementById('toggle-coming-soon');
    
    if (comingSoonSection && toggleBtn) {
        const isHidden = comingSoonSection.classList.contains('d-none');
        
        if (isHidden) {
            comingSoonSection.classList.remove('d-none');
            toggleBtn.innerHTML = '<i class="bi bi-eye-slash me-1"></i> Hide Coming Soon';
            toggleBtn.classList.remove('btn-outline-primary');
            toggleBtn.classList.add('btn-outline-warning');
            showNotification('Coming Soon section is now visible', 'success');
        } else {
            comingSoonSection.classList.add('d-none');
            toggleBtn.innerHTML = '<i class="bi bi-eye me-1"></i> Show Coming Soon';
            toggleBtn.classList.remove('btn-outline-warning');
            toggleBtn.classList.add('btn-outline-primary');
            showNotification('Coming Soon section is now hidden', 'info');
        }
    }
}

/**
 * Setup image preview untuk form inputs
 * @param {string} inputId - ID dari file input
 * @param {string} previewId - ID dari img element untuk preview
 * @param {string} textId - ID dari text indicator
 */
function setupImagePreview(inputId, previewId, textId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const text = document.getElementById(textId);
    
    if (input && preview && text) {
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    text.textContent = this.files[0].name;
                }.bind(this);
                reader.readAsDataURL(this.files[0]);
            } else {
                preview.src = 'https://placehold.co/400x300/2c3035/ffffff?text=Preview';
                preview.style.display = 'none';
                text.textContent = 'No file chosen';
            }
        });
    }
}

/**
 * Inisialisasi Mobile Sidebar Toggle, Overlay, & URL Parameter Handler
 */
function initAdminUI() {
    console.log('🚀 Initializing admin UI...');
    
    // A. SETUP SIDEBAR & OVERLAY
    const sidebar = document.getElementById('sidebar');
    const dismissBtn = document.getElementById('dismiss');
    
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        overlay.style.cssText = `display: none; position: fixed; top: 76px; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 899;`;
        
        const wrapper = document.querySelector('.dashboard-wrapper');
        if (wrapper) wrapper.appendChild(overlay);
        else document.body.appendChild(overlay);
        
        console.log('✅ Overlay created for admin');
    }

    if(dismissBtn) {
        dismissBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if(sidebar) sidebar.classList.add('active');
            overlay.style.display = 'none';
            
            // Reset dropdowns
            if (window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
        });
    }
    
    overlay.addEventListener('click', function() {
        if(sidebar) sidebar.classList.add('active');
        overlay.style.display = 'none';
        
        // Reset dropdowns
        if (window.resetAllDropdowns) {
            window.resetAllDropdowns();
        }
    });

    // B. HANDLE URL PARAMETER (Agar redirect dari Home membuka tab yang benar)
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    
    if (sectionParam) {
        // Jika ada ?section=section-profile di URL, buka tab itu
        console.log(`📌 URL parameter detected: section=${sectionParam}`);
        setTimeout(() => {
            switchSection(sectionParam, null);
        }, 300);
    } else {
        // Default ke dashboard
        setTimeout(() => {
            const defaultSection = document.querySelector('.admin-tab-content.active') || 
                                  document.getElementById('section-dashboard');
            if (defaultSection) {
                switchSection(defaultSection.id, null);
            }
        }, 300);
    }
    
    // C. SETUP IMAGE PREVIEWS
    setupImagePreview('game-thumbnail', 'preview-thumbnail', 'txt-thumbnail');
    setupImagePreview('game-logo', 'preview-logo', 'txt-logo');
    setupImagePreview('game-bg', 'preview-bg', 'txt-bg');
    
    // D. SETUP SIDEBAR MENU CLICKS
    const sidebarLinks = document.querySelectorAll('.nav-link-custom');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            switchSection(sectionId, this);
        });
    });
    
    // E. RESET DROPDOWNS ON INIT
    setTimeout(() => {
        if (window.resetAllDropdowns) {
            window.resetAllDropdowns();
            console.log('✅ Admin UI dropdowns reset');
        }
    }, 200);
    
    // F. WINDOW RESIZE HANDLER
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Reset dropdowns on resize (especially for mobile)
            if (window.innerWidth < 992 && window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
        }, 250);
    });
    
    console.log('✅ Admin UI initialized');
}

/**
 * Fungsi untuk menambahkan section baru (untuk game content)
 */
function addSection() {
    console.log('➕ Adding new section...');
    
    const sectionsContainer = document.getElementById('game-sections-container');
    if (!sectionsContainer) return;
    
    const sectionId = Date.now(); // Generate unique ID
    const sectionHTML = `
        <div class="card mb-3 section-item" data-section-id="${sectionId}">
            <div class="card-header bg-dark d-flex justify-content-between align-items-center">
                <h6 class="mb-0">New Section</h6>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteSection(${sectionId})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Section Title</label>
                        <input type="text" class="form-control section-title" placeholder="Enter section title" value="New Section">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Section Type</label>
                        <select class="form-select section-type">
                            <option value="main_story" selected>Main Story</option>
                            <option value="character_story">Character Story</option>
                            <option value="side_story">Side Story</option>
                            <option value="event_story">Event Story</option>
                        </select>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Section Content</label>
                    <textarea class="form-control section-content" rows="4" placeholder="Enter section content..."></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Order</label>
                    <input type="number" class="form-control section-order" value="0" min="0">
                </div>
            </div>
        </div>
    `;
    
    sectionsContainer.insertAdjacentHTML('beforeend', sectionHTML);
    showNotification('New section added', 'success');
}

/**
 * Fungsi untuk menghapus section
 * @param {number} sectionId - ID section yang akan dihapus
 */
function deleteSection(sectionId) {
    console.log(`🗑️ Deleting section: ${sectionId}`);
    
    const sectionElement = document.querySelector(`.section-item[data-section-id="${sectionId}"]`);
    if (sectionElement) {
        if (confirm('Are you sure you want to delete this section?')) {
            sectionElement.remove();
            showNotification('Section deleted', 'info');
        }
    }
}

/**
 * Fungsi untuk menambahkan admin baru
 */
function addAdmin() {
    console.log('👑 Adding new admin...');
    
    const emailInput = document.getElementById('new-admin-email');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    if (!email) {
        showNotification('Please enter an email address', 'warning');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }
    
    // Show loading
    const addBtn = document.querySelector('#add-admin-form button[type="submit"]');
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';
    addBtn.disabled = true;
    
    // Add to Firestore
    db.collection('admins').doc(email).set({
        email: email,
        addedBy: currentUser.email,
        addedAt: firebase.firestore.FieldValue.serverTimestamp(),
        role: 'admin'
    })
    .then(() => {
        showNotification(`Admin ${email} added successfully`, 'success');
        emailInput.value = '';
        
        // Reload admin list
        if (typeof loadAdminList === 'function') {
            loadAdminList();
        }
    })
    .catch(error => {
        console.error('Error adding admin:', error);
        showNotification('Error adding admin: ' + error.message, 'error');
    })
    .finally(() => {
        addBtn.innerHTML = originalText;
        addBtn.disabled = false;
    });
}

/**
 * Fungsi untuk menghapus admin
 * @param {string} email - Email admin yang akan dihapus
 */
function removeAdmin(email) {
    console.log(`👑 Removing admin: ${email}`);
    
    if (!email || email === currentUser.email) {
        showNotification('You cannot remove yourself', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to remove ${email} as admin?`)) {
        db.collection('admins').doc(email).delete()
        .then(() => {
            showNotification(`Admin ${email} removed successfully`, 'success');
            
            // Reload admin list
            if (typeof loadAdminList === 'function') {
                loadAdminList();
            }
        })
        .catch(error => {
            console.error('Error removing admin:', error);
            showNotification('Error removing admin: ' + error.message, 'error');
        });
    }
}

/**
 * Helper untuk generate game slug dari title
 */
function generateGameSlug(title) {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Fungsi untuk edit game
 * @param {string} gameId - ID game yang akan diedit
 */
function editGame(gameId) {
    console.log(`✏️ Editing game: ${gameId}`);
    
    // Implementasi edit game
    if (typeof loadGameForEdit === 'function') {
        loadGameForEdit(gameId);
    } else {
        showNotification('Edit function not implemented yet', 'warning');
    }
    
    // Switch to content section
    switchSection('section-content', null);
    
    // Reset dropdowns
    if (window.resetAllDropdowns) {
        setTimeout(() => {
            window.resetAllDropdowns();
        }, 100);
    }
}

/**
 * Fungsi untuk delete game
 * @param {string} gameId - ID game yang akan dihapus
 */
function deleteGame(gameId) {
    console.log(`🗑️ Deleting game: ${gameId}`);
    
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    // Implementasi delete game
    if (typeof deleteGameFromFirestore === 'function') {
        deleteGameFromFirestore(gameId);
    } else {
        showNotification('Delete function not implemented yet', 'warning');
    }
}

/**
 * Fungsi untuk change page (pagination)
 * @param {number} page - Page number
 */
function changePage(page) {
    console.log(`📄 Changing to page: ${page}`);
    
    // Implementasi pagination
    if (typeof loadGamesTable === 'function') {
        // Update current page variable if exists
        if (typeof currentPage !== 'undefined') {
            currentPage = page;
        }
        loadGamesTable();
    }
}

/**
 * Setup semua event listeners untuk admin UI
 */
function setupAdminEventListeners() {
    console.log('🔧 Setting up admin event listeners...');
    
    // Reset dropdowns saat klik di luar
    document.addEventListener('click', function(e) {
        // Jika klik di luar dropdown, reset semua dropdown
        if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-menu')) {
            if (window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
        }
        
        // Jika klik di luar sidebar di mobile, tutup sidebar
        if (window.innerWidth <= 768 && 
            !e.target.closest('#sidebar') && 
            !e.target.closest('#sidebar-toggle-btn') &&
            !e.target.closest('.overlay-sidebar')) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.overlay-sidebar');
            
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
                if (overlay) overlay.style.display = 'none';
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape untuk close dropdowns
        if (e.key === 'Escape' && window.resetAllDropdowns) {
            window.resetAllDropdowns();
        }
        
        // Ctrl+Shift+D untuk dashboard (debug)
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            switchSection('section-dashboard', null);
        }
        
        // Ctrl+Shift+C untuk content
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            switchSection('section-content', null);
        }
    });
    
    // Reset dropdowns saat scroll
    let scrollTimer;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            if (window.innerWidth < 992 && window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
        }, 150);
    });
    
    console.log('✅ Admin event listeners set up');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Admin UI initializing...');
    
    // Tunggu sebentar untuk memastikan semua komponen siap
    setTimeout(() => {
        initAdminUI();
        setupAdminEventListeners();
        
        // Set flag bahwa admin UI sudah diinisialisasi
        window.adminUIInitialized = true;
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('admin-ui:initialized'));
        
        console.log('✅ Admin UI fully initialized');
    }, 500);
});

// Export agar bisa dipanggil global oleh navbar.js
window.switchSection = switchSection;
window.goToSection = goToSection;
window.resetForm = resetForm;
window.toggleComingSoon = toggleComingSoon;
window.addSection = addSection;
window.deleteSection = deleteSection;
window.addAdmin = addAdmin;
window.removeAdmin = removeAdmin;
window.editGame = editGame;
window.deleteGame = deleteGame;
window.changePage = changePage;
window.generateGameSlug = generateGameSlug;
window.initAdminUI = initAdminUI;
window.setupAdminEventListeners = setupAdminEventListeners;

// Backward compatibility
if (!window.resetAllDropdowns) {
    window.resetAllDropdowns = function() {
        console.log('🔄 Resetting admin dropdowns...');
        
        // Close semua dropdown menu
        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach(menu => {
            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
                menu.style.display = 'none';
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
            }
        });
        
        // Reset semua dropdown toggle
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('active');
        });
    };
}

console.log('✅ admin-ui.js loaded successfully');