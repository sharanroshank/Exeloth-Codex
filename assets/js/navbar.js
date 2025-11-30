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
                        <a class="nav-link" href="https://saweria.co" target="_blank">
                            <i class="bi bi-gift-fill me-1"></i> Saweria
                        </a>
                    </li>
                    
                    <li class="nav-item" id="login-nav-item">
                        <a class="nav-link" href="#" id="login-link" onclick="showGoogleSignIn()">
                            <i class="bi bi-person-fill me-1"></i> Login
                        </a>
                    </li>

                    <li class="nav-item dropdown d-none" id="admin-nav-item">
                        <a class="nav-link dropdown-toggle py-0 d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=random" 
                                 id="nav-profile-img" 
                                 class="rounded-circle border border-secondary" 
                                 alt="Profile" 
                                 width="32" height="32">
                        </a>
                        
                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg mt-2" aria-labelledby="navbarDropdown" style="min-width: 220px;">
                            <li>
                                <h6 class="dropdown-header text-truncate" id="nav-user-name">
                                    Signed in as Admin
                                </h6>
                            </li>
                            <li><hr class="dropdown-divider border-secondary"></li>
                            
                            <li>
                                <a class="dropdown-item py-2" href="admin.html">
                                    <i class="bi bi-person-circle me-2"></i> Profile
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="admin.html">
                                    <i class="bi bi-pencil-square me-2"></i> Manajemen Konten
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="admin.html">
                                    <i class="bi bi-gear-wide-connected me-2"></i> Pengaturan Admin
                                </a>
                            </li>
                            
                            <li><hr class="dropdown-divider border-secondary"></li>
                            
                            <li>
                                <a class="dropdown-item text-danger py-2" href="#" onclick="signOut()">
                                    <i class="bi bi-box-arrow-right me-2"></i> Sign out
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `;

    // 1. Masukkan HTML ke placeholder
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navbarHTML;
    }

    // 2. Logika Active State
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        document.getElementById('nav-home')?.classList.add('active');
    } else if (path.includes('games.html')) {
        document.getElementById('nav-games')?.classList.add('active');
    }
}