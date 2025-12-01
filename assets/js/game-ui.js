// assets/js/game-ui.js

// --- Logika Favorite Button ---
let isFavorite = false;

function toggleFavorite() {
    const btn = document.getElementById('favorite-btn');
    const icon = document.getElementById('favorite-icon');
    isFavorite = !isFavorite;
    
    if (isFavorite) {
        btn.classList.add('active');
        icon.classList.remove('bi-star');
        icon.classList.add('bi-star-fill');
    } else {
        btn.classList.remove('active');
        icon.classList.remove('bi-star-fill');
        icon.classList.add('bi-star');
    }
}

// --- Logika Sidebar Baru ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const leftGroup = document.getElementById('navbar-left-group'); // Grup Hamburger + Teks

    // Toggle Class Active
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');

    // Logika: Jika Sidebar Terbuka -> Sembunyikan Navbar Kiri
    if (sidebar && sidebar.classList.contains('active')) {
        if(leftGroup) leftGroup.classList.add('nav-hidden'); // Pakai CSS opacity 0
    } else {
        if(leftGroup) leftGroup.classList.remove('nav-hidden');
    }
}

// Inisialisasi Event Listener
document.addEventListener('DOMContentLoaded', function() {
    // Tombol Close (X) di dalam Sidebar
    const dismissBtn = document.getElementById('dismiss');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const leftGroup = document.getElementById('navbar-left-group');

    // Fungsi Tutup Sidebar
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (leftGroup) leftGroup.classList.remove('nav-hidden');
    }

    // Event Klik Tombol X
    if (dismissBtn) {
        dismissBtn.addEventListener('click', closeSidebar);
    }

    // Event Klik Overlay (Layar Gelap)
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
});