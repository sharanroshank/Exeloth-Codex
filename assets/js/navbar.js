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
                <ul class="navbar-nav ms-auto gap-lg-3">
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
                    <li class="nav-item d-none" id="admin-nav-item">
                        <a class="nav-link" href="admin.html">
                            <i class="bi bi-speedometer2 me-1"></i> Admin Panel
                        </a>
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

    // 2. Logika Active State (Opsional: Agar menu menyala sesuai halaman)
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        document.getElementById('nav-home')?.classList.add('active');
    } else if (path.includes('games.html')) {
        document.getElementById('nav-games')?.classList.add('active');
    }
}