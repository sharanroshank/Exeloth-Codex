// assets/js/navbar.js - COMPLETE VERSION WITH PERSISTENT SIDEBAR

let currentSidebarState = {
    isOpen: window.innerWidth >= 768, // Desktop: terbuka, Mobile: tertutup
    isMobile: window.innerWidth < 768
};

// Render navbar function
function renderNavbar() {
    const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" id="main-navbar">
        <div class="container-fluid px-4">
            
            <div class="d-flex align-items-center" id="navbar-left-group">
                <!-- HAMBURGER BUTTON - Hanya tampil di halaman game dan hanya di mobile -->
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
    
    // Setup dropdowns - DIPERBAIKI
    setupDropdowns();
    
    // Setup tooltips
    setupTooltips();
    
    // Update sidebar state
    updateSidebarState();
    
    console.log('✅ Navbar components initialized');
}

// Setup hamburger button khusus untuk halaman game
function setupHamburgerButton() {
    const isGamePage = window.location.pathname.includes('game.html');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (isGamePage && toggleBtn) {
        // Di mobile (<768px): tampilkan tombol hamburger
        if (window.innerWidth < 768) {
            toggleBtn.style.display = 'flex';
            toggleBtn.style.visibility = 'visible';
            toggleBtn.style.opacity = '1';
            toggleBtn.classList.remove('d-none');
            
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
            
            // Click event - hanya untuk mobile
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.innerWidth < 768) {
                    if (typeof window.toggleSidebar === 'function') {
                        window.toggleSidebar();
                    }
                }
            });
            
            console.log('✅ Hamburger button enabled for mobile');
        } else {
            // Di desktop (≥768px): sembunyikan tombol
            toggleBtn.style.display = 'none';
            toggleBtn.classList.add('d-none');
        }
    } else if (toggleBtn) {
        // Sembunyikan tombol di halaman non-game
        toggleBtn.style.display = 'none';
        toggleBtn.classList.add('d-none');
    }
}

// Update hamburger button state
function updateHamburgerButtonState() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const body = document.body;
    
    if (!toggleBtn) return;
    
    // Update state berdasarkan lebar layar
    currentSidebarState.isMobile = window.innerWidth < 768;
    currentSidebarState.isOpen = currentSidebarState.isMobile ? 
        body.classList.contains('sidebar-open-mobile') : true;
    
    if (currentSidebarState.isMobile) {
        // MODE MOBILE
        if (currentSidebarState.isOpen) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
            toggleBtn.setAttribute('title', 'Close Sidebar');
            toggleBtn.setAttribute('aria-label', 'Close Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.classList.add('active');
            
            // Di mobile, sembunyikan navbar left group jika sidebar terbuka
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
            
            // Show navbar left group
            const leftNavbarGroup = document.getElementById('navbar-left-group');
            if (leftNavbarGroup) {
                leftNavbarGroup.style.opacity = '1';
                leftNavbarGroup.style.visibility = 'visible';
                leftNavbarGroup.style.width = 'auto';
                leftNavbarGroup.style.overflow = 'visible';
            }
        }
    } else {
        // MODE DESKTOP - tombol disembunyikan
        toggleBtn.style.display = 'none';
        toggleBtn.classList.add('d-none');
        
        // Pastikan navbar left group terlihat
        const leftNavbarGroup = document.getElementById('navbar-left-group');
        if (leftNavbarGroup) {
            leftNavbarGroup.style.opacity = '1';
            leftNavbarGroup.style.visibility = 'visible';
            leftNavbarGroup.style.width = 'auto';
            leftNavbarGroup.style.overflow = 'visible';
        }
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
    } else if (currentPage === 'game.html') {
        const gamesLink = document.getElementById('nav-games');
        if (gamesLink) {
            gamesLink.classList.add('active');
            gamesLink.setAttribute('aria-current', 'page');
        }
    }
}

// ==================== DROPDOWN FUNCTIONS - DIPERBAIKI ====================

// Setup dropdown functionality - VERSION FIXED
function setupDropdowns() {
    console.log('🔧 Setting up dropdowns...');
    
    // Tunggu sebentar untuk memastikan DOM siap
    setTimeout(() => {
        // Inisialisasi dropdown Bootstrap jika Bootstrap tersedia
        if (typeof bootstrap !== 'undefined') {
            const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
            dropdownElementList.map(function (dropdownToggleEl) {
                const dropdown = new bootstrap.Dropdown(dropdownToggleEl);
                
                // Custom event handlers untuk styling
                dropdownToggleEl.addEventListener('show.bs.dropdown', function () {
                    console.log('📋 Dropdown showing...');
                    const dropdownMenu = this.nextElementSibling;
                    if (dropdownMenu) {
                        dropdownMenu.classList.add('github-dropdown', 'show');
                        dropdownMenu.style.display = 'block';
                        dropdownMenu.style.visibility = 'visible';
                        dropdownMenu.style.opacity = '1';
                        
                        // Force reflow untuk trigger animation
                        dropdownMenu.offsetHeight;
                        
                        console.log('✅ Dropdown menu prepared');
                    }
                });
                
                dropdownToggleEl.addEventListener('shown.bs.dropdown', function () {
                    console.log('📋 Dropdown shown');
                    const dropdownMenu = this.nextElementSibling;
                    if (dropdownMenu) {
                        dropdownMenu.style.opacity = '1';
                        dropdownMenu.style.transform = 'translateY(0)';
                        dropdownMenu.style.visibility = 'visible';
                        
                        // Pastikan dropdown di atas semua elemen
                        dropdownMenu.style.zIndex = '1090';
                        
                        // Apply custom styling
                        ensureDropdownVisible(dropdownMenu);
                    }
                });
                
                dropdownToggleEl.addEventListener('hide.bs.dropdown', function () {
                    const dropdownMenu = this.nextElementSibling;
                    if (dropdownMenu) {
                        dropdownMenu.style.opacity = '0';
                        dropdownMenu.style.transform = 'translateY(-5px)';
                        setTimeout(() => {
                            if (!dropdownMenu.classList.contains('show')) {
                                dropdownMenu.style.visibility = 'hidden';
                            }
                        }, 300);
                    }
                });
                
                // Tambahkan click handler untuk memastikan dropdown terbuka
                dropdownToggleEl.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdownMenu = this.nextElementSibling;
                    if (dropdownMenu) {
                        const isShowing = dropdownMenu.classList.contains('show');
                        
                        if (!isShowing) {
                            dropdown.show();
                        } else {
                            dropdown.hide();
                        }
                    }
                });
                
                return dropdown;
            });
        }
        
        // Pastikan semua dropdown menu memiliki class yang benar
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (!menu.classList.contains('github-dropdown')) {
                menu.classList.add('github-dropdown');
            }
            
            // Fix untuk visibility
            menu.style.visibility = 'visible';
            menu.style.opacity = '1';
            menu.style.display = 'block';
        });
        
        console.log('✅ Dropdowns initialized');
    }, 100);
    
    // Click outside to close dropdown
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            });
        }
    });
    
    // Fix untuk mobile touch
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: true });
    });
}

// Fungsi untuk memastikan dropdown terlihat
function ensureDropdownVisible(dropdownMenu) {
    if (!dropdownMenu) return;
    
    dropdownMenu.style.display = 'block';
    dropdownMenu.style.visibility = 'visible';
    dropdownMenu.style.opacity = '1';
    dropdownMenu.style.zIndex = '1090';
    
    // Force reflow untuk trigger animations
    dropdownMenu.offsetHeight;
    
    // Tambahkan class show
    dropdownMenu.classList.add('show');
    
    // Fix position
    const rect = dropdownMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust position jika keluar dari viewport
    if (rect.right > viewportWidth) {
        dropdownMenu.style.left = 'auto';
        dropdownMenu.style.right = '0';
    }
    
    if (rect.bottom > viewportHeight) {
        dropdownMenu.style.top = 'auto';
        dropdownMenu.style.bottom = '100%';
    }
    
    return true;
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
            currentSidebarState.isMobile = window.innerWidth < 768;
            
            if (wasMobile !== currentSidebarState.isMobile) {
                console.log(`🔄 Mobile state changed: ${currentSidebarState.isMobile}`);
                setupHamburgerButton();
                updateHamburgerButtonState();
            }
            
            // Update dropdown positions on resize
            document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
                ensureDropdownVisible(dropdown);
            });
        }, 250);
    });
    
    // Handle click on nav links untuk mobile menu
    document.addEventListener('click', function(e) {
        if (currentSidebarState.isMobile && window.innerWidth < 768) {
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
                
                // Juga tutup dropdown jika terbuka
                const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
                openDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                    dropdown.style.opacity = '0';
                });
            }
        }
        
        // Handle dropdown close ketika klik di luar
        if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-menu')) {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            });
        }
    });
    
    // Keyboard navigation untuk navbar - TAMBAHKAN untuk dropdown
    document.addEventListener('keydown', function(e) {
        // Escape untuk close sidebar (hanya di mobile)
        if (e.key === 'Escape' && currentSidebarState.isOpen && currentSidebarState.isMobile) {
            if (typeof window.closeSidebar === 'function') {
                window.closeSidebar();
            }
        }
        
        // Escape juga untuk close dropdown
        if (e.key === 'Escape') {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            });
        }
    });
    
    // Fix untuk dropdown di mobile navbar collapse
    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        navbarNav.addEventListener('show.bs.collapse', function() {
            console.log('Navbar collapse showing');
        });
        
        navbarNav.addEventListener('shown.bs.collapse', function() {
            console.log('Navbar collapse shown');
            // Re-initialize dropdowns dalam navbar collapse
            setTimeout(setupDropdowns, 100);
        });
        
        navbarNav.addEventListener('hide.bs.collapse', function() {
            // Close semua dropdown saat navbar collapse ditutup
            const dropdowns = this.querySelectorAll('.dropdown-menu.show');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.style.opacity = '0';
            });
        });
    }
    
    // Event listener untuk scroll (close dropdown saat scroll)
    let scrollTimer;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            if (openDropdowns.length > 0 && window.innerWidth < 992) {
                // Di mobile, close dropdown saat scroll
                openDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                    dropdown.style.opacity = '0';
                });
            }
        }, 150);
    });
    
    // Fix untuk touch devices
    document.addEventListener('touchstart', function(e) {
        // Close dropdown jika touch di luar
        if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-menu')) {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.style.opacity = '0';
            });
        }
    }, { passive: true });
}

// Setup tooltips
function setupTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Update sidebar state
function updateSidebarState() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    
    if (body) {
        currentSidebarState.isOpen = body.classList.contains('sidebar-open-mobile');
    } else if (sidebar) {
        currentSidebarState.isOpen = sidebar.classList.contains('active');
    }
    
    updateHamburgerButtonState();
}

// ==================== PROFILE & NAVBAR UPDATE FUNCTIONS ====================

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

// Update Navbar Profile
window.updateNavbarProfile = async function(user) {
    console.log('🔄 Updating navbar profile for:', user ? user.email : 'no user');
    
    if (!user) {
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
    
    // Re-initialize dropdowns setelah update profile
    setTimeout(setupDropdowns, 100);
}

// Reset navbar profile ke default
function resetNavbarProfile() {
    const navImgBtn = document.getElementById('nav-profile-img-btn');
    const navImgInside = document.getElementById('nav-profile-img-inside');
    const navUsername = document.getElementById('nav-gh-username');
    const navFullname = document.getElementById('nav-gh-fullname');

    const defaultPhoto = 'https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff';
    
    if (navImgBtn) navImgBtn.src = defaultPhoto;
    if (navImgInside) navImgInside.src = defaultPhoto;
    if (navUsername) navUsername.textContent = 'User';
    if (navFullname) navFullname.textContent = 'Guest';
}

// Helper untuk update navbar login state
window.updateNavbar = function(isLoggedIn) {
    console.log('🔄 Updating navbar login state:', isLoggedIn);
    
    const loginNavItem = document.getElementById('login-nav-item');
    const adminNavItem = document.getElementById('admin-nav-item');
    
    if (loginNavItem && adminNavItem) {
        if (isLoggedIn) {
            loginNavItem.classList.add('d-none');
            adminNavItem.classList.remove('d-none');
            
            // Re-initialize dropdowns setelah login
            setTimeout(() => {
                setupDropdowns();
                console.log('✅ Dropdowns re-initialized after login');
            }, 200);
        } else {
            loginNavItem.classList.remove('d-none');
            adminNavItem.classList.add('d-none');
            resetNavbarProfile();
        }
    }
}

// ==================== DROPDOWN DEBUG & ENHANCEMENT FUNCTIONS ====================

// Debug function untuk melihat status dropdown
window.debugDropdowns = function() {
    console.log('🔍 Debug Dropdowns:');
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach((dropdown, index) => {
        console.log(`Dropdown ${index + 1}:`, {
            visible: dropdown.style.display !== 'none',
            hasShowClass: dropdown.classList.contains('show'),
            opacity: dropdown.style.opacity,
            visibility: dropdown.style.visibility,
            zIndex: dropdown.style.zIndex,
            parent: dropdown.parentElement ? dropdown.parentElement.className : 'no parent'
        });
    });
    
    // Juga check dropdown toggles
    const toggles = document.querySelectorAll('.dropdown-toggle');
    toggles.forEach((toggle, index) => {
        console.log(`Toggle ${index + 1}:`, {
            expanded: toggle.getAttribute('aria-expanded'),
            hasBsDropdown: toggle.__bootstrapDropdown !== undefined
        });
    });
};

// Force show dropdown (emergency function)
window.forceShowDropdown = function() {
    const dropdownToggle = document.getElementById('navbarDropdown');
    if (dropdownToggle && typeof bootstrap !== 'undefined') {
        const dropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
        if (dropdown) {
            dropdown.show();
        } else {
            const newDropdown = new bootstrap.Dropdown(dropdownToggle);
            newDropdown.show();
        }
    }
};

// ==================== INITIALIZATION ====================

// Initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Navbar system initializing...');
    
    // Jika navbar placeholder ada, render navbar
    if (document.getElementById('navbar-placeholder')) {
        renderNavbar();
    } else {
        console.warn('⚠️ Navbar placeholder not found');
    }
    
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
    
    // Re-initialize dropdowns jika ada perubahan DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Check jika ada elemen dropdown yang ditambahkan
                const hasDropdown = Array.from(mutation.addedNodes).some(node => 
                    node.classList && (node.classList.contains('dropdown') || node.classList.contains('dropdown-menu'))
                );
                if (hasDropdown) {
                    setTimeout(setupDropdowns, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Export fungsi untuk digunakan di file lain
window.renderNavbar = renderNavbar;
window.updateNavbarProfile = updateNavbarProfile;
window.updateNavbar = updateNavbar;
window.setupDropdowns = setupDropdowns;
window.ensureDropdownVisible = ensureDropdownVisible;

console.log('✅ navbar.js loaded successfully with persistent sidebar support');