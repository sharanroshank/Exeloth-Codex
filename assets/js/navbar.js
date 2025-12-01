// assets/js/navbar.js - FIXED VERSION WITH PROPER SIDEBAR INTEGRATION

let currentSidebarState = {
    isOpen: false,
    isMobile: window.innerWidth < 992
};

// Render navbar function
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
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        title="Toggle Sidebar">
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

    // Initialize navbar components
    initializeNavbarComponents();
    
    // Dispatch event bahwa navbar sudah dirender
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('navbar:rendered'));
    }, 100);
    
    return true;
}

// Initialize semua komponen navbar
function initializeNavbarComponents() {
    // Setup hamburger button
    setupHamburgerButton();
    
    // Setup active state untuk nav links
    setupActiveNavLinks();
    
    // Setup event listeners
    setupNavbarEventListeners();
    
    // Setup dropdowns
    setupDropdowns();
    
    // Setup tooltips
    setupTooltips();
    
    // Setup responsive behavior
    setupResponsiveBehavior();
    
    // Update sidebar state
    updateSidebarState();
    
    console.log('✅ Navbar components initialized');
}

// Setup hamburger button khusus untuk halaman game
function setupHamburgerButton() {
    const isGamePage = window.location.pathname.includes('game.html');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (isGamePage && toggleBtn) {
        // Tampilkan tombol hamburger
        toggleBtn.classList.remove('d-none');
        toggleBtn.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
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
            color: #fff;
            z-index: 1041;
            position: relative;
        `;
        
        // Setup proper attributes
        toggleBtn.setAttribute('title', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-controls', 'sidebar');
        toggleBtn.setAttribute('role', 'button');
        
        // Hover effects
        toggleBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        toggleBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = 'transparent';
        });
        
        // Click event - delegasikan ke game-ui.js
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Gunakan fungsi dari game-ui.js jika ada
            if (typeof window.toggleSidebar === 'function') {
                window.toggleSidebar();
            } else {
                // Fallback
                console.warn('toggleSidebar function not found, using fallback');
                if (typeof toggleSidebar === 'function') {
                    toggleSidebar();
                }
            }
        });
        
        // Touch event untuk mobile
        toggleBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (typeof window.toggleSidebar === 'function') {
                window.toggleSidebar();
            }
        }, { passive: false });
        
        // Update initial state
        updateHamburgerButtonState();
        
        console.log('✅ Hamburger button enabled for game page');
    } else if (toggleBtn) {
        // Sembunyikan tombol di halaman non-game
        toggleBtn.classList.add('d-none');
        toggleBtn.style.display = 'none';
        toggleBtn.style.visibility = 'hidden';
        toggleBtn.style.opacity = '0';
    }
}

// Update hamburger button state
function updateHamburgerButtonState() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    
    if (!toggleBtn) return;
    
    const isActive = body.classList.contains('sidebar-open') || 
                    (sidebar && sidebar.classList.contains('active'));
    
    currentSidebarState.isOpen = isActive;
    
    if (isActive) {
        toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
        toggleBtn.setAttribute('title', 'Close Sidebar');
        toggleBtn.setAttribute('aria-label', 'Close Sidebar');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.classList.add('active');
        
        // Hide navbar left group saat sidebar terbuka (mobile only)
        if (currentSidebarState.isMobile) {
            const leftNavbarGroup = document.getElementById('navbar-left-group');
            if (leftNavbarGroup) {
                leftNavbarGroup.style.opacity = '0';
                leftNavbarGroup.style.visibility = 'hidden';
                leftNavbarGroup.style.width = '0';
                leftNavbarGroup.style.overflow = 'hidden';
                leftNavbarGroup.style.transition = 'all 0.3s ease';
            }
        }
    } else {
        toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
        toggleBtn.setAttribute('title', 'Open Sidebar');
        toggleBtn.setAttribute('aria-label', 'Open Sidebar');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.classList.remove('active');
        
        // Show navbar left group saat sidebar tertutup
        const leftNavbarGroup = document.getElementById('navbar-left-group');
        if (leftNavbarGroup) {
            leftNavbarGroup.style.opacity = '1';
            leftNavbarGroup.style.visibility = 'visible';
            leftNavbarGroup.style.width = 'auto';
            leftNavbarGroup.style.overflow = 'visible';
        }
    }
    
    // Update tooltip
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipInstance = bootstrap.Tooltip.getInstance(toggleBtn);
        if (tooltipInstance) {
            tooltipInstance.hide();
            setTimeout(() => {
                tooltipInstance.dispose();
                new bootstrap.Tooltip(toggleBtn);
            }, 100);
        }
    }
}

// Setup active state untuk navigation links
function setupActiveNavLinks() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const hash = window.location.hash;
    
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
        // Tidak ada link admin di navbar
    } else if (currentPage.includes('game.html')) {
        // Untuk game page, tidak ada nav link khusus
    }
    
    // Handle hash untuk deep linking
    if (hash && hash !== '#') {
        const targetLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
            targetLink.setAttribute('aria-current', 'page');
        }
    }
}

// Setup event listeners untuk navbar
function setupNavbarEventListeners() {
    // Update hamburger button saat sidebar state berubah
    document.addEventListener('sidebar:opened', function() {
        currentSidebarState.isOpen = true;
        updateHamburgerButtonState();
    });
    
    document.addEventListener('sidebar:closed', function() {
        currentSidebarState.isOpen = false;
        updateHamburgerButtonState();
    });
    
    // Handle window resize untuk responsive behavior
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const wasMobile = currentSidebarState.isMobile;
            currentSidebarState.isMobile = window.innerWidth < 992;
            
            // Jika berubah dari mobile ke desktop
            if (wasMobile && !currentSidebarState.isMobile) {
                // Reset hamburger button
                setupHamburgerButton();
            }
            
            // Jika berubah dari desktop ke mobile
            if (!wasMobile && currentSidebarState.isMobile) {
                // Update hamburger button
                setupHamburgerButton();
            }
        }, 250);
    });
    
    // Handle navigation events
    window.addEventListener('popstate', function() {
        setTimeout(setupActiveNavLinks, 100);
    });
    
    // Handle click on nav links untuk mobile menu
    document.addEventListener('click', function(e) {
        if (currentSidebarState.isMobile && window.innerWidth < 992) {
            const navLink = e.target.closest('.nav-link');
            if (navLink && !navLink.hasAttribute('data-bs-toggle')) {
                // Close mobile navbar collapse
                const navbarNav = document.getElementById('navbarNav');
                const navbarToggler = document.querySelector('.navbar-toggler');
                
                if (navbarNav && navbarNav.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarNav);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                    if (navbarToggler) {
                        navbarToggler.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        }
    });
    
    // Keyboard navigation untuk navbar
    document.addEventListener('keydown', function(e) {
        // Escape untuk close sidebar
        if (e.key === 'Escape' && currentSidebarState.isOpen) {
            if (typeof window.closeSidebar === 'function') {
                window.closeSidebar();
            }
        }
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
    
    // Enhanced dropdown behavior
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            // Keyboard navigation
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.click();
                    
                    // Focus first item setelah dropdown terbuka
                    setTimeout(() => {
                        const firstItem = menu.querySelector('.dropdown-item');
                        if (firstItem) firstItem.focus();
                    }, 100);
                }
            });
            
            // Menu keyboard navigation
            menu.addEventListener('keydown', function(e) {
                const items = this.querySelectorAll('.dropdown-item');
                const currentItem = document.activeElement;
                const currentIndex = Array.from(items).indexOf(currentItem);
                
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (currentIndex < items.length - 1) {
                            items[currentIndex + 1].focus();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (currentIndex > 0) {
                            items[currentIndex - 1].focus();
                        } else {
                            toggle.focus();
                            const dropdownInstance = bootstrap.Dropdown.getInstance(toggle);
                            if (dropdownInstance) dropdownInstance.hide();
                        }
                        break;
                    case 'Escape':
                        toggle.focus();
                        const dropdownInstance = bootstrap.Dropdown.getInstance(toggle);
                        if (dropdownInstance) dropdownInstance.hide();
                        break;
                    case 'Home':
                        e.preventDefault();
                        items[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        items[items.length - 1].focus();
                        break;
                }
            });
        }
    });
    
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

// Setup tooltips
function setupTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        // Inisialisasi tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        console.log('✅ Tooltips initialized');
    }
}

// Setup responsive behavior
function setupResponsiveBehavior() {
    // Update mobile state
    currentSidebarState.isMobile = window.innerWidth < 992;
    
    // Handle touch events untuk mobile
    if (currentSidebarState.isMobile) {
        // Touch swipe untuk close sidebar
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (!currentSidebarState.isOpen) return;
            
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchEndX - touchStartX;
            
            // Swipe kiri untuk close sidebar
            if (swipeDistance < -50) {
                if (typeof window.closeSidebar === 'function') {
                    window.closeSidebar();
                }
            }
        }, { passive: true });
    }
}

// Update sidebar state
function updateSidebarState() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    
    if (body) {
        currentSidebarState.isOpen = body.classList.contains('sidebar-open');
    } else if (sidebar) {
        currentSidebarState.isOpen = sidebar.classList.contains('active');
    }
    
    updateHamburgerButtonState();
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

// Handle mobile navbar toggler
function setupMobileNavbarToggler() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav) {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                
                // Update aria-label
                if (!isExpanded) {
                    this.setAttribute('aria-label', 'Close navigation menu');
                } else {
                    this.setAttribute('aria-label', 'Open navigation menu');
                }
            }
        });
        
        // Keyboard support
        navbarToggler.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
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
                navbarToggler.setAttribute('aria-expanded', 'false');
                navbarToggler.setAttribute('aria-label', 'Open navigation menu');
            }
        }
    });
}

// Close sidebar when clicking on overlay
function setupOverlayClick() {
    document.addEventListener('click', function(e) {
        const overlay = document.querySelector('.overlay-sidebar');
        if (overlay && overlay.contains(e.target) && currentSidebarState.isOpen) {
            if (typeof window.closeSidebar === 'function') {
                window.closeSidebar();
            }
        }
    });
}

// Initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Navbar system initializing...');
    
    // Jika navbar placeholder ada, render navbar
    if (document.getElementById('navbar-placeholder')) {
        renderNavbar();
    } else {
        console.warn('⚠️ Navbar placeholder not found');
    }
    
    // Setup mobile navbar toggler
    setupMobileNavbarToggler();
    
    // Setup overlay click
    setupOverlayClick();
    
    // Setup event untuk re-render jika diperlukan
    document.addEventListener('navbar:refresh', function() {
        console.log('🔄 Refreshing navbar...');
        renderNavbar();
    });
    
    // Listen untuk update sidebar state
    document.addEventListener('sidebar:state:update', function(e) {
        if (e.detail && typeof e.detail.isOpen !== 'undefined') {
            currentSidebarState.isOpen = e.detail.isOpen;
            updateHamburgerButtonState();
        }
    });
    
    // Listen untuk window load
    window.addEventListener('load', function() {
        // Update sidebar state setelah semua konten dimuat
        setTimeout(updateSidebarState, 500);
    });
});

// Export fungsi untuk digunakan di file lain
window.renderNavbar = renderNavbar;
window.setupHamburgerButton = setupHamburgerButton;
window.updateNavbarProfile = updateNavbarProfile;
window.updateNavbar = updateNavbar;
window.resetNavbarProfile = resetNavbarProfile;
window.updateHamburgerButtonState = updateHamburgerButtonState;

// Export sidebar state untuk akses global
window.sidebarState = currentSidebarState;

console.log('✅ navbar.js loaded successfully');