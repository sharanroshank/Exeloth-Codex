// assets/js/navbar.js - VERSION WITH SIDEBAR FIXES

function renderNavbar() {
    const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="main-navbar">
        <div class="container-fluid px-4">
            
            <div class="d-flex align-items-center" id="navbar-left-group">
                <!-- HAMBURGER BUTTON - Hanya tampil di halaman game -->
                <button class="btn btn-link text-white p-0 me-3 d-none" 
                        id="sidebar-toggle-btn"
                        aria-label="Toggle sidebar"
                        aria-expanded="false"
                        aria-controls="sidebar"
                        onclick="toggleSidebar()">
                    <i class="bi bi-list fs-3"></i>
                </button>
                
                <a class="navbar-brand fw-bold text-uppercase" href="index.html" id="navbar-brand-text">Exeloth Codex</a>
            </div>

            <!-- Mobile menu toggle -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Main navbar content -->
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto gap-lg-3 align-items-center">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html" id="nav-home">
                            <i class="bi bi-house-door-fill me-1"></i> Home
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="games.html" id="nav-games">
                            <i class="bi bi-controller me-1"></i> Daftar Games
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="https://saweria.co" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-gift-fill me-1"></i> Saweria
                        </a>
                    </li>
                    
                    <!-- Login button (show when not logged in) -->
                    <li class="nav-item" id="login-nav-item">
                        <a class="nav-link" href="#" id="login-link" onclick="showGoogleSignIn()">
                            <i class="bi bi-person-fill me-1"></i> Login
                        </a>
                    </li>

                    <!-- Admin dropdown (show when logged in) -->
                    <li class="nav-item dropdown d-none" id="admin-nav-item">
                        <a class="nav-link py-0" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff" 
                                 id="nav-profile-img-btn" 
                                 class="rounded-circle border border-secondary" 
                                 width="32" 
                                 height="32" 
                                 alt="Profile"
                                 onerror="this.src='https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff'">
                        </a>
                        
                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark github-dropdown shadow-lg mt-2">
                            <li class="github-header-row position-relative">
                                <img src="https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff" 
                                     id="nav-profile-img-inside" 
                                     class="rounded-circle border border-secondary" 
                                     width="40" 
                                     height="40" 
                                     alt="Profile"
                                     onerror="this.src='https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff'">
                                <div class="gh-user-info">
                                    <span class="gh-username" id="nav-gh-username">User</span>
                                    <span class="gh-fullname" id="nav-gh-fullname">Guest</span>
                                </div>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="openAdminSection('section-profile')"><i class="bi bi-person me-2"></i> Your Profile</a></li>
                            <li><a class="dropdown-item" href="#" onclick="openAdminSection('section-content')"><i class="bi bi-journal-richtext me-2"></i> Manajemen Konten</a></li>
                            <li><a class="dropdown-item" href="#" onclick="openAdminSection('section-admin')"><i class="bi bi-gear me-2"></i> Pengaturan Admin</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="signOut()"><i class="bi bi-box-arrow-right me-2"></i> Sign out</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `;

    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) placeholder.innerHTML = navbarHTML;

    console.log('✅ Navbar rendered');

    // --- SETUP HAMBURGER BUTTON UNTUK GAME PAGE ---
    setupHamburgerButton();

    // --- SETUP ACTIVE STATE FOR NAV LINKS ---
    setupActiveNavLinks();

    // --- SETUP EVENT LISTENERS ---
    setupNavbarEventListeners();

    // --- SETUP DROPDOWN FUNCTIONALITY ---
    setupDropdowns();

    // Dispatch event bahwa navbar sudah dirender
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('navbar:rendered'));
    }, 100);
}

// Setup hamburger button khusus untuk halaman game
function setupHamburgerButton() {
    const isGamePage = window.location.pathname.includes('game.html');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (isGamePage && toggleBtn) {
        // Tampilkan tombol hamburger
        toggleBtn.classList.remove('d-none');
        toggleBtn.setAttribute('title', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-controls', 'sidebar');
        
        // Setup proper styling
        toggleBtn.style.cssText = `
            display: flex !important;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 8px;
            width: 40px;
            height: 40px;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            margin-right: 15px;
        `;
        
        // Hover effects
        toggleBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        toggleBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = 'transparent';
        });
        
        // Update initial aria-expanded state
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
        } else {
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
        }
        
        console.log('✅ Hamburger button enabled for game page');
    } else if (toggleBtn) {
        // Sembunyikan tombol di halaman non-game
        toggleBtn.classList.add('d-none');
        toggleBtn.style.display = 'none';
    }
}

// Update hamburger icon berdasarkan state sidebar
function updateHamburgerIcon() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (!toggleBtn) return;
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
        toggleBtn.setAttribute('title', 'Close Sidebar');
        toggleBtn.setAttribute('aria-label', 'Close Sidebar');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.style.display = 'flex';
    } else {
        toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
        toggleBtn.setAttribute('title', 'Open Sidebar');
        toggleBtn.setAttribute('aria-label', 'Open Sidebar');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.style.display = 'flex';
    }
}

// Setup active state untuk navigation links
function setupActiveNavLinks() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    
    // Reset semua active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.setAttribute('aria-current', null);
    });
    
    // Set active berdasarkan halaman
    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        const homeLink = document.getElementById('nav-home');
        if (homeLink) {
            homeLink.classList.add('active');
            homeLink.setAttribute('aria-current', 'page');
        }
    } else if (currentPage === 'games.html') {
        const gamesLink = document.getElementById('nav-games');
        if (gamesLink) {
            gamesLink.classList.add('active');
            gamesLink.setAttribute('aria-current', 'page');
        }
    } else if (currentPage === 'admin.html') {
        // Tidak ada link admin di navbar, jadi tidak ada yang di-set active
    }
    // Untuk game.html, tidak ada nav link khusus, jadi tidak di-set active
}

// Setup event listeners untuk navbar
function setupNavbarEventListeners() {
    // Update hamburger button icon saat sidebar state berubah
    document.addEventListener('sidebar:opened', updateHamburgerIcon);
    document.addEventListener('sidebar:closed', updateHamburgerIcon);
    
    // Handle window resize untuk responsive behavior
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            setupHamburgerButton();
        }, 250);
    });
    
    // Handle navigation events
    document.addEventListener('DOMContentLoaded', function() {
        // Update active links after any navigation
        setTimeout(setupActiveNavLinks, 100);
    });
}

// Setup dropdown functionality
function setupDropdowns() {
    // Inisialisasi dropdown Bootstrap jika Bootstrap tersedia
    if (typeof bootstrap !== 'undefined') {
        const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
        dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl);
        });
        
        console.log('✅ Bootstrap dropdowns initialized');
    }
    
    // Close dropdown ketika klik di luar
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
                    if (dropdownInstance) {
                        dropdownInstance.hide();
                    }
                }
            }
        });
    });
}

// Helper Navigasi Admin
window.openAdminSection = function(sectionId) {
    if (window.location.pathname.includes('admin.html')) {
        if (typeof switchSection === 'function') {
            switchSection(sectionId, null);
        }
    } else {
        window.location.href = `admin.html?section=${sectionId}`;
    }
}

// --- SINKRONISASI PROFIL NAVBAR ---
window.updateNavbarProfile = async function(user) {
    console.log('🔄 Updating navbar profile for:', user ? user.email : 'no user');
    
    if (!user) {
        // Reset ke default jika user null
        resetNavbarProfile();
        return;
    }

    const navImgBtn = document.getElementById('nav-profile-img-btn');
    const navImgInside = document.getElementById('nav-profile-img-inside');
    const navUsername = document.getElementById('nav-gh-username');
    const navFullname = document.getElementById('nav-gh-fullname');

    let displayName = user.displayName || 'User';
    let email = user.email;
    let photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6f42c1&color=fff`;
    let username = email.split('@')[0];

    try {
        if (typeof db !== 'undefined') {
            const doc = await db.collection('users').doc(email).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.displayName) displayName = data.displayName;
                if (data.username) username = data.username;
                if (data.photoURL && data.photoURL.trim() !== '') {
                    photoURL = data.photoURL;
                }
            }
        }
    } catch (error) {
        console.error("❌ Gagal sync navbar:", error);
    }

    // Update semua elemen navbar
    if (navImgBtn) {
        navImgBtn.src = photoURL;
        navImgBtn.alt = `${displayName}'s profile picture`;
        navImgBtn.onerror = function() {
            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6f42c1&color=fff`;
        };
    }
    if (navImgInside) {
        navImgInside.src = photoURL;
        navImgInside.alt = `${displayName}'s profile picture`;
        navImgInside.onerror = function() {
            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6f42c1&color=fff`;
        };
    }
    if (navUsername) navUsername.textContent = username;
    if (navFullname) navFullname.textContent = displayName;
    
    console.log('✅ Navbar profile updated');
}

// Reset navbar profile ke default
function resetNavbarProfile() {
    const navImgBtn = document.getElementById('nav-profile-img-btn');
    const navImgInside = document.getElementById('nav-profile-img-inside');
    const navUsername = document.getElementById('nav-gh-username');
    const navFullname = document.getElementById('nav-gh-fullname');

    const defaultPhoto = 'https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff';
    
    if (navImgBtn) {
        navImgBtn.src = defaultPhoto;
        navImgBtn.alt = 'Default profile picture';
    }
    if (navImgInside) {
        navImgInside.src = defaultPhoto;
        navImgInside.alt = 'Default profile picture';
    }
    if (navUsername) navUsername.textContent = 'User';
    if (navFullname) navFullname.textContent = 'Guest';
    
    console.log('🔄 Navbar profile reset to default');
}

// Helper untuk update navbar login state (dipanggil dari auth-system.js)
window.updateNavbar = function(isLoggedIn) {
    console.log('🔄 Updating navbar login state:', isLoggedIn);
    
    const loginNavItem = document.getElementById('login-nav-item');
    const adminNavItem = document.getElementById('admin-nav-item');
    
    if (loginNavItem && adminNavItem) {
        if (isLoggedIn) {
            loginNavItem.classList.add('d-none');
            adminNavItem.classList.remove('d-none');
        } else {
            loginNavItem.classList.remove('d-none');
            adminNavItem.classList.add('d-none');
            resetNavbarProfile();
        }
    }
}

// Fallback function jika toggleSidebar tidak didefinisikan
if (typeof toggleSidebar === 'undefined') {
    window.toggleSidebar = function() {
        console.warn('⚠️ toggleSidebar function is not defined, using fallback');
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
            updateHamburgerIcon();
            
            // Update nav-hidden class
            const leftNavbarGroup = document.getElementById('navbar-left-group');
            if (leftNavbarGroup) {
                if (sidebar.classList.contains('active')) {
                    leftNavbarGroup.classList.add('nav-hidden');
                } else {
                    leftNavbarGroup.classList.remove('nav-hidden');
                }
            }
        }
    };
}

// Fallback function jika closeSidebar tidak didefinisikan
if (typeof closeSidebar === 'undefined') {
    window.closeSidebar = function() {
        console.warn('⚠️ closeSidebar function is not defined, using fallback');
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            updateHamburgerIcon();
            
            // Update nav-hidden class
            const leftNavbarGroup = document.getElementById('navbar-left-group');
            if (leftNavbarGroup) {
                leftNavbarGroup.classList.remove('nav-hidden');
            }
        }
    };
}

// Handle mobile navbar toggler
document.addEventListener('DOMContentLoaded', function() {
    // Setup navbar toggler for mobile
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav) {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
            }
        });
    }
    
    // Close mobile navbar when clicking outside
    document.addEventListener('click', function(e) {
        const navbarNav = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        if (navbarNav && navbarNav.classList.contains('show') && 
            !navbarNav.contains(e.target) && 
            navbarToggler && !navbarToggler.contains(e.target)) {
            
            const bsCollapse = bootstrap.Collapse.getInstance(navbarNav);
            if (bsCollapse) {
                bsCollapse.hide();
            }
        }
    });
});

// Initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Navbar system initializing...');
    
    // Jika navbar placeholder ada, render navbar
    if (document.getElementById('navbar-placeholder')) {
        renderNavbar();
    }
    
    // Setup event untuk re-render jika diperlukan
    document.addEventListener('navbar:refresh', function() {
        console.log('🔄 Refreshing navbar...');
        renderNavbar();
    });
});

// Export fungsi untuk digunakan di file lain
window.renderNavbar = renderNavbar;
window.setupHamburgerButton = setupHamburgerButton;
window.updateNavbarProfile = updateNavbarProfile;
window.updateNavbar = updateNavbar;
window.resetNavbarProfile = resetNavbarProfile;