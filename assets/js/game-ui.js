// assets/js/game-ui.js

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

// --- FUNGSI TOGGLE SIDEBAR & NAVBAR ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const leftNavbarGroup = document.getElementById('navbar-left-group'); 

    // Toggle Class Active (Ini memicu transform: translateX(0) di CSS)
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');

    // Sembunyikan/Munculkan Navbar Kiri
    if (sidebar && sidebar.classList.contains('active')) {
        if (leftNavbarGroup) leftNavbarGroup.classList.add('nav-hidden');
    } else {
        if (leftNavbarGroup) leftNavbarGroup.classList.remove('nav-hidden');
    }
}

// Inisialisasi Event Listener
document.addEventListener('DOMContentLoaded', function() {
    const dismissBtn = document.getElementById('dismiss');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const leftNavbarGroup = document.getElementById('navbar-left-group');

    // Fungsi Tutup Sidebar (Dipanggil saat klik X atau Overlay)
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        // Kembalikan Navbar Kiri
        if (leftNavbarGroup) leftNavbarGroup.classList.remove('nav-hidden');
    }

    if (dismissBtn) dismissBtn.addEventListener('click', closeSidebar);
    
    // Event listener untuk overlay (perlu dibuat manual jika belum ada di HTML)
    if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.className = 'overlay-sidebar';
        document.body.appendChild(newOverlay);
        newOverlay.addEventListener('click', closeSidebar);
    } else {
        overlay.addEventListener('click', closeSidebar);
    }
});