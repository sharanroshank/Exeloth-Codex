// assets/js/navbar.js

function renderNavbar() {
    const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="main-navbar">
        <div class="container-fluid px-4">
            
            <div class="d-flex align-items-center" id="navbar-left-group">
                <button class="btn btn-link text-white p-0 me-3 d-none" id="sidebar-toggle-btn" onclick="toggleSidebar()">
                    <i class="bi bi-list fs-3"></i>
                </button>
                
                <a class="navbar-brand fw-bold text-uppercase" href="index.html" id="navbar-brand-text">Exeloth Codex</a>
            </div>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto gap-lg-3 align-items-center">
                    <li class="nav-item"><a class="nav-link" href="index.html" id="nav-home"><i class="bi bi-house-door-fill me-1"></i> Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="games.html" id="nav-games"><i class="bi bi-controller me-1"></i> Daftar Games</a></li>
                    <li class="nav-item"><a class="nav-link" href="https://saweria.co" target="_blank"><i class="bi bi-gift-fill me-1"></i> Saweria</a></li>
                    
                    <li class="nav-item" id="login-nav-item">
                        <a class="nav-link" href="#" id="login-link" onclick="showGoogleSignIn()"><i class="bi bi-person-fill me-1"></i> Login</a>
                    </li>

                    <li class="nav-item dropdown d-none" id="admin-nav-item">
                        <a class="nav-link py-0" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://ui-avatars.com/api/?name=Admin" id="nav-profile-img-btn" class="rounded-circle border border-secondary" width="32" height="32">
                        </a>
                        
                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark github-dropdown shadow-lg mt-2">
                            <li class="github-header-row position-relative">
                                <img src="https://ui-avatars.com/api/?name=Admin" id="nav-profile-img-inside" class="rounded-circle border border-secondary" width="40" height="40">
                                <div class="gh-user-info">
                                    <span class="gh-username" id="nav-gh-username">AdminUser</span>
                                    <span class="gh-fullname" id="nav-gh-fullname">Administrator</span>
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

    // --- FIX PENTING DI SINI ---
    // Gunakan 'DOMContentLoaded' untuk menunggu sampai seluruh HTML (termasuk Sidebar di bawah) selesai dimuat.
    // Baru setelah itu kita cek apakah sidebar ada atau tidak.
    document.addEventListener("DOMContentLoaded", function() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        
        // Jika halaman ini punya sidebar, munculkan tombol hamburger
        if (sidebar && toggleBtn) {
            toggleBtn.classList.remove('d-none');
        }
    });

    // Active State Logic
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') document.getElementById('nav-home')?.classList.add('active');
    else if (path.includes('games.html')) document.getElementById('nav-games')?.classList.add('active');
}

// Fungsi Helper untuk Navigasi Admin
window.openAdminSection = function(sectionId) {
    if (window.location.pathname.includes('admin.html')) {
        if (typeof switchSection === 'function') {
            switchSection(sectionId, null);
        }
    } else {
        window.location.href = `admin.html?section=${sectionId}`;
    }
}

window.toggleAddAccount = function(e) {
    e.stopPropagation(); 
    const popup = document.getElementById('add-account-popup');
    if (popup) popup.classList.toggle('d-none');
}