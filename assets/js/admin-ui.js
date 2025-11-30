// assets/js/admin-ui.js

/**
 * Fungsi untuk Berpindah Bagian/Section (Tab)
 * @param {string} sectionId - ID dari div konten yang ingin ditampilkan
 * @param {HTMLElement|null} elementLink - Element link sidebar yang diklik (bisa null jika dari navbar)
 */
function switchSection(sectionId, elementLink) {
    // 1. Sembunyikan SEMUA bagian konten
    const allSections = document.querySelectorAll('.admin-tab-content');
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // 2. Tampilkan bagian yang dipilih
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }

    // 3. Update status 'Active' pada Sidebar Link
    const allLinks = document.querySelectorAll('.nav-link-custom');
    allLinks.forEach(link => link.classList.remove('active'));

    if (elementLink) {
        // Jika diklik dari Sidebar
        elementLink.classList.add('active');
    } else {
        // Jika diklik dari Navbar (elementLink null), cari tombol sidebar yang sesuai secara manual
        // Kita cari link sidebar yang memiliki onclick mengandung ID section tersebut
        const autoLink = document.querySelector(`.nav-link-custom[onclick*="${sectionId}"]`);
        if (autoLink) {
            autoLink.classList.add('active');
        }
    }

    // 4. Tutup sidebar otomatis di mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('active'); 
        const overlay = document.querySelector('.overlay-sidebar');
        if (overlay) overlay.style.display = 'none';
    }
}

/**
 * Inisialisasi Mobile Sidebar Toggle, Overlay, & URL Parameter Handler
 */
document.addEventListener('DOMContentLoaded', function() {
    // A. SETUP SIDEBAR & OVERLAY
    const sidebar = document.getElementById('sidebar');
    const dismissBtn = document.getElementById('dismiss');
    
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        overlay.style.cssText = `display: none; position: fixed; top: 76px; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 899;`;
        
        const wrapper = document.querySelector('.dashboard-wrapper');
        if (wrapper) wrapper.appendChild(overlay);
        else document.body.appendChild(overlay);
    }

    if(dismissBtn) {
        dismissBtn.addEventListener('click', function() {
            if(sidebar) sidebar.classList.add('active');
            overlay.style.display = 'none';
        });
    }
    
    overlay.addEventListener('click', function() {
        if(sidebar) sidebar.classList.add('active');
        overlay.style.display = 'none';
    });

    // B. HANDLE URL PARAMETER (Agar redirect dari Home membuka tab yang benar)
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    
    if (sectionParam) {
        // Jika ada ?section=section-profile di URL, buka tab itu
        switchSection(sectionParam, null);
    }
});

// Export agar bisa dipanggil global oleh navbar.js
window.switchSection = switchSection;