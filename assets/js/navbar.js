// assets/js/navbar.js

function renderNavbar() {
    const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold text-uppercase" href="index.html">Exeloth Codex</a>
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

                                <button class="gh-switcher-btn" id="account-switcher-btn" title="Account switcher" onclick="toggleAddAccount(event)">
                                    <i class="bi bi-arrow-repeat"></i>
                                </button>
                                
                                <div id="add-account-popup" class="d-none">
                                    <a href="#" onclick="showGoogleSignIn()" class="text-white text-decoration-none d-block px-2 py-1 small hover-bg-primary rounded">
                                        <i class="bi bi-person-plus me-2"></i> Add account
                                    </a>
                                </div>
                            </li>

                            <li>
                                <div class="px-3 pb-2 mb-2 border-bottom border-secondary">
                                    <div class="status-box">
                                        <span class="online-indicator"></span>
                                        <span>Online</span>
                                    </div>
                                </div>
                            </li>
                            
                            <li>
                                <a class="dropdown-item" href="admin.html">
                                    <i class="bi bi-person me-2"></i> Your Profile
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="admin.html" onclick="switchTab('content')">
                                    <i class="bi bi-journal-richtext me-2"></i> Manajemen Konten
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="admin.html" onclick="switchTab('admin-settings')">
                                    <i class="bi bi-gear me-2"></i> Pengaturan Admin
                                </a>
                            </li>
                            
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

    // Active State Logic
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') document.getElementById('nav-home')?.classList.add('active');
    else if (path.includes('games.html')) document.getElementById('nav-games')?.classList.add('active');
}

// Fungsi kecil untuk toggle popup 'Add Account'
window.toggleAddAccount = function(e) {
    e.stopPropagation(); 
    const popup = document.getElementById('add-account-popup');
    if (popup) popup.classList.toggle('d-none');
}