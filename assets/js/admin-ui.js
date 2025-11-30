// assets/js/admin-ui.js

/**
 * Fungsi untuk Berpindah Bagian/Section (Tab)
 * @param {string} sectionId - ID dari div konten yang ingin ditampilkan
 * @param {HTMLElement} elementLink - Element link sidebar yang diklik (this)
 */
function switchSection(sectionId, elementLink) {
    // 1. Sembunyikan SEMUA bagian konten
    const allSections = document.querySelectorAll('.admin-tab-content');
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // Paksa display none via JS agar aman
    });

    // 2. Tampilkan bagian yang dipilih
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    } else {
        console.error("Section tidak ditemukan:", sectionId);
    }

    // 3. Update status 'Active' pada Sidebar Link
    if (elementLink) {
        const allLinks = document.querySelectorAll('.nav-link-custom');
        allLinks.forEach(link => link.classList.remove('active'));
        elementLink.classList.add('active');
    }

    // 4. (Opsional) Tutup sidebar otomatis jika di layar HP
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('active'); // active di CSS ini artinya hidden (margin negative)
        
        // Sembunyikan overlay hitam jika ada
        const overlay = document.querySelector('.overlay-sidebar');
        if (overlay) overlay.style.display = 'none';
    }
}

/**
 * Inisialisasi Mobile Sidebar Toggle & Overlay
 * Dijalankan saat DOM selesai dimuat
 */
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const dismissBtn = document.getElementById('dismiss');
    
    // Cek apakah overlay sudah ada, jika belum buat baru
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        // Style overlay agar menutupi layar (sesuai style sebelumnya)
        overlay.style.cssText = `display: none; position: fixed; top: 76px; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 899;`;
        
        // Append ke dashboard-wrapper jika ada, atau body
        const wrapper = document.querySelector('.dashboard-wrapper');
        if (wrapper) {
            wrapper.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
        }
    }

    // Event Tutup Sidebar (Klik Tombol X)
    if(dismissBtn) {
        dismissBtn.addEventListener('click', function() {
            if(sidebar) sidebar.classList.add('active'); // Sembunyikan sidebar
            overlay.style.display = 'none';
        });
    }
    
    // Event Tutup Sidebar (Klik area hitam / overlay)
    overlay.addEventListener('click', function() {
        if(sidebar) sidebar.classList.add('active');
        overlay.style.display = 'none';
    });
});