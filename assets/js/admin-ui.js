// assets/js/admin-ui.js - COMPLETE VERSION WITH ALL FUNCTIONS

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
    const allLinks = document.querySelectorAll('.nav-link-custom, .sidebar-menu li a');
    allLinks.forEach(link => link.classList.remove('active'));

    if (elementLink) {
        // Jika diklik dari Sidebar
        elementLink.classList.add('active');
    } else {
        // Jika diklik dari Navbar (elementLink null), cari tombol sidebar yang sesuai secara manual
        // Kita cari link sidebar yang memiliki onclick mengandung ID section tersebut
        const autoLink = document.querySelector(`.sidebar-menu li a[onclick*="${sectionId}"], .nav-link-custom[onclick*="${sectionId}"]`);
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
        if (typeof closeSidebar === 'function') {
            closeSidebar();
        }
    }
    
    // 6. Scroll ke atas konten
    const contentArea = document.querySelector('.main-content-wrapper');
    if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 7. Update URL tanpa reload (jika di admin page)
    if (window.location.pathname.includes('admin.html')) {
        const url = new URL(window.location);
        url.searchParams.set('section', sectionId);
        window.history.replaceState({}, '', url);
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
    const gameForm = document.getElementById('game-form');
    if (gameForm) gameForm.reset();
    
    const editGameId = document.getElementById('edit-game-id');
    if (editGameId) editGameId.value = '';
    
    const gameSlug = document.getElementById('game-slug');
    if (gameSlug) gameSlug.value = '';
    
    // Reset preview images
    const previews = ['preview-thumbnail', 'preview-logo', 'preview-bg'];
    previews.forEach(id => {
        const preview = document.getElementById(id);
        if (preview) {
            preview.src = '';
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
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Tambah / Edit Game';
    }
    
    // Update submit button
    const submitBtn = document.getElementById('game-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-save me-1"></i> Simpan Game';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-primary');
    }
    
    // Hide cancel button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) cancelBtn.classList.add('d-none');
    
    // Reset chapter form jika ada
    const chapterForm = document.getElementById('chapter-form');
    if (chapterForm) {
        chapterForm.reset();
        const editChapterId = document.getElementById('edit-chapter-id');
        if (editChapterId) editChapterId.value = '';
    }
    
    // Reset coming soon checkbox
    const comingSoonCheckbox = document.getElementById('check-coming-soon');
    if (comingSoonCheckbox) comingSoonCheckbox.checked = false;
    
    // Reset date picker
    const datePickerContainer = document.getElementById('date-picker-container');
    if (datePickerContainer) datePickerContainer.style.display = 'none';
    
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
    console.log('🔧 Toggle coming soon...');
    
    const comingSoonCheckbox = document.getElementById('check-coming-soon');
    const datePickerContainer = document.getElementById('date-picker-container');
    
    if (comingSoonCheckbox && datePickerContainer) {
        if (comingSoonCheckbox.checked) {
            datePickerContainer.style.display = 'block';
            
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const releaseDateInput = document.getElementById('release-date');
            if (releaseDateInput) {
                releaseDateInput.value = tomorrow.toISOString().split('T')[0];
            }
            
            // Disable status radios
            const statusRadios = document.querySelectorAll('input[name="gameStatus"]');
            statusRadios.forEach(radio => {
                radio.disabled = true;
                radio.checked = false;
            });
            
            showNotification('Coming Soon mode enabled', 'info');
        } else {
            datePickerContainer.style.display = 'none';
            
            // Enable status radios and set default to ongoing
            const statusRadios = document.querySelectorAll('input[name="gameStatus"]');
            statusRadios.forEach(radio => {
                radio.disabled = false;
            });
            const ongoingRadio = document.getElementById('status-ongoing');
            if (ongoingRadio) ongoingRadio.checked = true;
            
            showNotification('Coming Soon mode disabled', 'info');
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
                    text.classList.add('d-none');
                }.bind(this);
                reader.readAsDataURL(this.files[0]);
            } else {
                preview.src = '';
                preview.style.display = 'none';
                text.textContent = 'No file chosen';
                text.classList.remove('d-none');
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
        overlay.style.cssText = `display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 899;`;
        
        const wrapper = document.querySelector('.dashboard-wrapper');
        if (wrapper) wrapper.appendChild(overlay);
        else document.body.appendChild(overlay);
        
        console.log('✅ Overlay created for admin');
    }

    if(dismissBtn) {
        dismissBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if(sidebar) sidebar.classList.remove('active');
            overlay.style.display = 'none';
            
            // Reset dropdowns
            if (window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
        });
    }
    
    overlay.addEventListener('click', function() {
        if(sidebar) sidebar.classList.remove('active');
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
                                  document.getElementById('section-content');
            if (defaultSection) {
                switchSection(defaultSection.id, null);
            }
        }, 300);
    }
    
    // C. SETUP IMAGE PREVIEWS
    setupImagePreview('game-thumbnail', 'preview-thumbnail', 'txt-thumbnail');
    setupImagePreview('game-logo', 'preview-logo', 'txt-logo');
    setupImagePreview('game-bg', 'preview-bg', 'txt-bg');
    
    // D. SETUP SIDEBAR MENU CLICKS (untuk sidebar baru)
    const sidebarLinks = document.querySelectorAll('.sidebar-menu li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/switchSection\('([^']+)'/);
                if (match && match[1]) {
                    switchSection(match[1], this);
                }
            }
        });
    });
    
    // E. SETUP COMING SOON TOGGLE
    const comingSoonCheckbox = document.getElementById('check-coming-soon');
    if (comingSoonCheckbox) {
        comingSoonCheckbox.addEventListener('change', toggleComingSoon);
    }
    
    // F. SETUP GAME TITLE TO SLUG GENERATION
    const gameTitleInput = document.getElementById('game-title');
    if (gameTitleInput) {
        gameTitleInput.addEventListener('input', function() {
            const editId = document.getElementById('edit-game-id');
            if (!editId || !editId.value) {
                const slugInput = document.getElementById('game-slug');
                if (slugInput) {
                    slugInput.value = generateGameSlug(this.value);
                }
            }
        });
    }
    
    // G. RESET DROPDOWNS ON INIT
    setTimeout(() => {
        if (window.resetAllDropdowns) {
            window.resetAllDropdowns();
            console.log('✅ Admin UI dropdowns reset');
        }
    }, 200);
    
    // H. WINDOW RESIZE HANDLER
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Reset dropdowns on resize (especially for mobile)
            if (window.innerWidth < 992 && window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
            
            // Update sidebar state
            updateAdminSidebarState();
        }, 250);
    });
    
    // I. KEYBOARD SHORTCUTS
    document.addEventListener('keydown', function(e) {
        // Ctrl + S untuk save form
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const activeForm = document.querySelector('form:not([style*="display: none"])');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.click();
            }
        }
        
        // Escape untuk close modal
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }
        }
    });
    
    console.log('✅ Admin UI initialized');
}

/**
 * Setup sidebar khusus untuk halaman admin
 */
function setupAdminSidebar() {
    console.log('🔧 Setting up admin sidebar...');
    
    // Setup overlay untuk admin (mirip dengan game page)
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        document.body.appendChild(overlay);
        console.log('✅ Overlay created for admin');
    }
    
    // Setup overlay events
    overlay.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.innerWidth < 768) {
            if (typeof closeSidebar === 'function') {
                closeSidebar();
            }
        }
    });
    
    // Setup dismiss button
    const dismissBtn = document.getElementById('dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.innerWidth < 768 && typeof closeSidebar === 'function') {
                closeSidebar();
            }
        });
    }
    
    // Setup menu interactions
    const menuItems = document.querySelectorAll('.sidebar-menu li a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Tutup sidebar di mobile setelah memilih menu
            if (window.innerWidth < 768 && typeof closeSidebar === 'function') {
                setTimeout(() => closeSidebar(), 300);
            }
        });
    });
    
    console.log('✅ Admin sidebar setup complete');
}

/**
 * Update admin sidebar state berdasarkan screen size
 */
function updateAdminSidebarState() {
    const isMobile = window.innerWidth < 768;
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    
    if (sidebar) {
        if (isMobile) {
            // Mobile: sidebar default tertutup
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-open-mobile');
            
            // Show overlay if sidebar is active
            const overlay = document.querySelector('.overlay-sidebar');
            if (overlay) overlay.style.display = 'none';
        } else {
            // Desktop: sidebar default terbuka
            sidebar.classList.add('active');
            body.classList.remove('sidebar-open-mobile');
            
            // Hide overlay
            const overlay = document.querySelector('.overlay-sidebar');
            if (overlay) overlay.style.display = 'none';
        }
    }
}

/**
 * Fungsi untuk menambahkan section baru (untuk game content)
 */
function addSection() {
    console.log('➕ Adding new section...');
    
    const sectionNameInput = document.getElementById('new-section-name');
    if (!sectionNameInput) return;
    
    const sectionName = sectionNameInput.value.trim();
    if (!sectionName) {
        showNotification('Please enter section name', 'warning');
        return;
    }
    
    // Implementasi add section ke Firestore
    if (typeof db !== 'undefined') {
        db.collection('sections').add({
            name: sectionName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser ? currentUser.email : 'system'
        })
        .then(() => {
            showNotification(`Section "${sectionName}" added successfully`, 'success');
            sectionNameInput.value = '';
            
            // Reload sections list
            if (typeof loadSections === 'function') {
                loadSections();
            }
        })
        .catch(error => {
            console.error('Error adding section:', error);
            showNotification('Error adding section: ' + error.message, 'error');
        });
    } else {
        showNotification('Database not available', 'error');
    }
}

/**
 * Fungsi untuk menghapus section
 * @param {string} sectionId - ID section yang akan dihapus
 */
function deleteSection(sectionId) {
    console.log(`🗑️ Deleting section: ${sectionId}`);
    
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    if (typeof db !== 'undefined') {
        db.collection('sections').doc(sectionId).delete()
        .then(() => {
            showNotification('Section deleted successfully', 'success');
            
            // Reload sections list
            if (typeof loadSections === 'function') {
                loadSections();
            }
        })
        .catch(error => {
            console.error('Error deleting section:', error);
            showNotification('Error deleting section: ' + error.message, 'error');
        });
    } else {
        showNotification('Database not available', 'error');
    }
}

/**
 * Fungsi untuk menambahkan admin baru
 */
function addAdmin() {
    console.log('👑 Adding new admin...');
    
    const emailInput = document.getElementById('new-admin-email');
    const nameInput = document.getElementById('new-admin-name');
    
    if (!emailInput || !nameInput) return;
    
    const email = emailInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!email) {
        showNotification('Please enter an email address', 'warning');
        return;
    }
    
    if (!name) {
        showNotification('Please enter admin name', 'warning');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }
    
    if (typeof db !== 'undefined') {
        db.collection('admins').doc(email).set({
            email: email,
            name: name,
            addedBy: currentUser ? currentUser.email : 'system',
            addedAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'admin',
            active: true
        })
        .then(() => {
            showNotification(`Admin ${name} (${email}) added successfully`, 'success');
            emailInput.value = '';
            nameInput.value = '';
            
            // Reload admin list
            if (typeof loadAdminList === 'function') {
                loadAdminList();
            }
        })
        .catch(error => {
            console.error('Error adding admin:', error);
            showNotification('Error adding admin: ' + error.message, 'error');
        });
    } else {
        showNotification('Database not available', 'error');
    }
}

/**
 * Fungsi untuk menghapus admin
 * @param {string} email - Email admin yang akan dihapus
 */
function removeAdmin(email) {
    console.log(`👑 Removing admin: ${email}`);
    
    if (!email) {
        showNotification('Invalid admin email', 'error');
        return;
    }
    
    if (currentUser && email === currentUser.email) {
        showNotification('You cannot remove yourself', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to remove ${email} as admin?`)) {
        if (typeof db !== 'undefined') {
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
        } else {
            showNotification('Database not available', 'error');
        }
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
    
    // Scroll to form
    const formCard = document.getElementById('game-form-card');
    if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth' });
    }
    
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
    
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) return;
    
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
    
    // Update current page
    if (typeof currentPage !== 'undefined') {
        currentPage = page;
    }
    
    // Implementasi pagination
    if (typeof loadGamesTable === 'function') {
        loadGamesTable();
    }
    
    // Scroll to table
    const table = document.querySelector('.table-responsive');
    if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                sidebar.classList.remove('active');
                if (overlay) overlay.style.display = 'none';
                
                // Update body class
                document.body.classList.remove('sidebar-open-mobile');
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape untuk close dropdowns
        if (e.key === 'Escape' && window.resetAllDropdowns) {
            window.resetAllDropdowns();
        }
        
        // Ctrl+Shift+C untuk content section
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            switchSection('section-content', null);
        }
        
        // Ctrl+Shift+A untuk admin section
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            switchSection('section-admin', null);
        }
        
        // Ctrl+Shift+P untuk profile section
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            switchSection('section-profile', null);
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
    
    // Form submission handlers
    const gameForm = document.getElementById('game-form');
    if (gameForm) {
        gameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof handleGameSubmitV2 === 'function') {
                handleGameSubmitV2(e);
            }
        });
    }
    
    const chapterForm = document.getElementById('chapter-form');
    if (chapterForm) {
        chapterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof handleChapterSubmit === 'function') {
                handleChapterSubmit(e);
            }
        });
    }
    
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof saveProfileChanges === 'function') {
                saveProfileChanges();
            }
        });
    }
    
    console.log('✅ Admin event listeners set up');
}

/**
 * Load game slugs untuk dropdown chapter form
 */
function loadGameSlugs() {
    console.log('📋 Loading game slugs...');
    
    const gameSlugSelect = document.getElementById('chapter-game-slug');
    if (!gameSlugSelect) return;
    
    gameSlugSelect.innerHTML = '<option value="">Pilih Game</option>';
    
    if (typeof db !== 'undefined') {
        db.collection('games').orderBy('title', 'asc').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const game = doc.data();
                const option = document.createElement('option');
                option.value = game.slug || generateGameSlug(game.title);
                option.textContent = game.title;
                gameSlugSelect.appendChild(option);
            });
            
            if (querySnapshot.empty) {
                gameSlugSelect.innerHTML = '<option value="">No games available</option>';
            }
        })
        .catch((error) => {
            console.error('Error loading game slugs:', error);
            gameSlugSelect.innerHTML = '<option value="">Error loading games</option>';
        });
    }
}

/**
 * Load sections untuk dropdown chapter form
 */
function loadSections() {
    console.log('📋 Loading sections...');
    
    const sectionSelect = document.getElementById('chapter-section');
    const sectionListContainer = document.getElementById('section-list-container');
    
    if (typeof db !== 'undefined') {
        // Load untuk dropdown
        if (sectionSelect) {
            sectionSelect.innerHTML = '<option value="">Pilih Section</option>';
            
            db.collection('sections').orderBy('name', 'asc').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const section = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = section.name;
                    sectionSelect.appendChild(option);
                });
                
                if (querySnapshot.empty) {
                    sectionSelect.innerHTML = '<option value="">No sections available</option>';
                }
            })
            .catch((error) => {
                console.error('Error loading sections:', error);
                sectionSelect.innerHTML = '<option value="">Error loading sections</option>';
            });
        }
        
        // Load untuk list container
        if (sectionListContainer) {
            sectionListContainer.innerHTML = '<div class="text-center p-3 text-muted">Loading sections...</div>';
            
            db.collection('sections').orderBy('createdAt', 'desc').get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    sectionListContainer.innerHTML = '<div class="text-center p-3 text-muted">No sections yet</div>';
                    return;
                }
                
                sectionListContainer.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const section = doc.data();
                    const sectionItem = document.createElement('div');
                    sectionItem.className = 'list-group-item bg-transparent border-secondary text-white d-flex justify-content-between align-items-center';
                    sectionItem.innerHTML = `
                        <div>
                            <span class="fw-bold">${section.name}</span>
                            <small class="text-muted d-block">Created by: ${section.createdBy || 'system'}</small>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="deleteSection('${doc.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    `;
                    sectionListContainer.appendChild(sectionItem);
                });
            })
            .catch((error) => {
                console.error('Error loading sections:', error);
                sectionListContainer.innerHTML = '<div class="text-center p-3 text-danger">Error loading sections</div>';
            });
        }
    }
}

/**
 * Load admin list
 */
function loadAdminList() {
    console.log('📋 Loading admin list...');
    
    const adminListContainer = document.getElementById('admin-list');
    if (!adminListContainer) return;
    
    adminListContainer.innerHTML = '<div class="text-center text-muted">Loading...</div>';
    
    if (typeof db !== 'undefined') {
        db.collection('admins').orderBy('addedAt', 'desc').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                adminListContainer.innerHTML = '<div class="text-center text-muted">No admins yet</div>';
                return;
            }
            
            adminListContainer.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const admin = doc.data();
                const adminItem = document.createElement('div');
                adminItem.className = 'd-flex justify-content-between align-items-center p-2 border-bottom border-secondary';
                
                adminItem.innerHTML = `
                    <div>
                        <span class="text-white fw-bold">${admin.name || 'No name'}</span>
                        <small class="text-muted d-block">${admin.email}</small>
                        <small class="text-info">Added by: ${admin.addedBy || 'system'}</small>
                    </div>
                    ${admin.email !== (currentUser ? currentUser.email : '') ? 
                        `<button class="btn btn-sm btn-outline-danger" onclick="removeAdmin('${admin.email}')">
                            <i class="bi bi-person-dash"></i>
                        </button>` : 
                        `<span class="badge bg-primary">You</span>`
                    }
                `;
                
                adminListContainer.appendChild(adminItem);
            });
        })
        .catch((error) => {
            console.error('Error loading admin list:', error);
            adminListContainer.innerHTML = '<div class="text-center text-danger">Error loading admin list</div>';
        });
    }
}

/**
 * Notification helper untuk admin UI
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Gunakan fungsi notification dari auth-system.js jika ada
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
        return;
    }
    
    // Fallback notification
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    
    // Buat element notification sederhana
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Admin UI initializing...');
    
    // Tunggu sebentar untuk memastikan semua komponen siap
    setTimeout(() => {
        initAdminUI();
        setupAdminEventListeners();
        setupAdminSidebar();
        updateAdminSidebarState();
        
        // Set flag bahwa admin UI sudah diinisialisasi
        window.adminUIInitialized = true;
        
        // Load data jika user sudah login
        if (typeof currentUser !== 'undefined' && currentUser) {
            loadGameSlugs();
            loadSections();
            loadAdminList();
            
            if (typeof loadGamesTable === 'function') {
                loadGamesTable();
            }
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('admin-ui:initialized'));
        
        console.log('✅ Admin UI fully initialized');
    }, 500);
});

// Export agar bisa dipanggil global oleh navbar.js dan file lainnya
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
window.setupAdminSidebar = setupAdminSidebar;
window.updateAdminSidebarState = updateAdminSidebarState;
window.loadGameSlugs = loadGameSlugs;
window.loadSections = loadSections;
window.loadAdminList = loadAdminList;
window.showNotification = showNotification;

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

console.log('✅ admin-ui.js loaded successfully with all functions preserved');