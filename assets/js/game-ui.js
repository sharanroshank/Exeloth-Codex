// assets/js/game-ui.js
// Game Page UI Functionality

let isFavorite = false;
let sidebarState = {
    isOpen: false,
    isAnimating: false
};

// Toggle favorite function
function toggleFavorite() {
    const btn = document.getElementById('favorite-btn');
    const icon = document.getElementById('favorite-icon');
    const text = document.getElementById('favorite-text');
    
    isFavorite = !isFavorite;
    
    if (isFavorite) {
        btn.classList.add('active');
        icon.classList.remove('bi-star');
        icon.classList.add('bi-star-fill');
        text.textContent = 'Favorited';
        showNotification('Added to favorites', 'success', 2000);
    } else {
        btn.classList.remove('active');
        icon.classList.remove('bi-star-fill');
        icon.classList.add('bi-star');
        text.textContent = 'Favorit';
        showNotification('Removed from favorites', 'info', 2000);
    }
}

// Toggle sidebar dengan animasi smooth
function toggleSidebar() {
    // Cegat jika sedang animasi
    if (sidebarState.isAnimating) return;
    
    sidebarState.isAnimating = true;
    sidebarState.isOpen = !sidebarState.isOpen;
    
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const overlay = document.querySelector('.overlay-sidebar');
    const leftNavbarGroup = document.getElementById('navbar-left-group');
    const body = document.body;
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    if (sidebarState.isOpen) {
        // BUKA SIDEBAR
        sidebar.classList.add('active');
        content.classList.add('shifted');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Update navbar
        if (leftNavbarGroup) {
            leftNavbarGroup.classList.add('nav-hidden');
        }
        
        // Update icon hamburger
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('sidebar:opened'));
    } else {
        // TUTUP SIDEBAR
        sidebar.classList.remove('active');
        content.classList.remove('shifted');
        overlay.classList.remove('active');
        body.style.overflow = '';
        
        // Update navbar
        if (leftNavbarGroup) {
            leftNavbarGroup.classList.remove('nav-hidden');
        }
        
        // Update icon hamburger
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('sidebar:closed'));
    }
    
    // Reset animation lock setelah transisi selesai
    setTimeout(() => {
        sidebarState.isAnimating = false;
    }, 300);
}

// Close sidebar function
function closeSidebar() {
    if (!sidebarState.isOpen || sidebarState.isAnimating) return;
    toggleSidebar(); // Gunakan toggle untuk konsistensi
}

// Initialize game page
function initGamePage() {
    console.log('Initializing game page UI...');
    
    // Setup overlay
    ensureOverlayExists();
    
    // Setup sidebar events
    setupSidebarEvents();
    
    // Setup menu interactions
    setupMenuInteractions();
    
    // Setup responsive behavior
    setupResponsiveBehavior();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    console.log('Game page UI initialized');
}

// Ensure overlay exists
function ensureOverlayExists() {
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        document.body.appendChild(overlay);
    }
    
    // Setup overlay click
    overlay.addEventListener('click', closeSidebar);
}

// Setup sidebar events
function setupSidebarEvents() {
    const dismissBtn = document.getElementById('dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeSidebar();
        });
    }
    
    // Mencegah event bubbling dari sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Setup menu interactions
function setupMenuInteractions() {
    const menuItems = document.querySelectorAll('.sidebar-menu li a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Di mobile, tutup sidebar setelah pilih menu
            if (window.innerWidth < 992) {
                closeSidebar();
            }
            
            // Scroll to section jika ada
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                scrollToSection(sectionId);
            }
        });
    });
}

// Setup responsive behavior
function setupResponsiveBehavior() {
    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Di mobile, auto-close sidebar saat resize
            if (window.innerWidth < 992 && sidebarState.isOpen) {
                closeSidebar();
            }
        }, 250);
    });
    
    // Auto close on outside click untuk desktop
    if (window.innerWidth >= 992) {
        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.getElementById('sidebar-toggle-btn');
            
            if (sidebarState.isOpen && 
                sidebar && 
                !sidebar.contains(e.target) && 
                toggleBtn && 
                !toggleBtn.contains(e.target)) {
                closeSidebar();
            }
        });
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape untuk menutup sidebar
        if (e.key === 'Escape' && sidebarState.isOpen) {
            closeSidebar();
        }
        
        // Ctrl+/ atau Cmd+/ untuk toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleSidebar();
        }
    });
}

// Helper function untuk scroll ke section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Helper notification untuk game page
function showNotification(message, type = 'info', duration = 3000) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback simple notification
        console.log(`${type}: ${message}`);
        alert(message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for navbar to render
    setTimeout(() => {
        initGamePage();
        
        // Setup hamburger button in navbar
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.remove('d-none');
            toggleBtn.onclick = toggleSidebar;
            toggleBtn.title = 'Toggle Sidebar';
            toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
        }
    }, 100);
    
    // Load game data
    if (typeof loadGameProfile === 'function') {
        setTimeout(loadGameProfile, 500);
    }
});

// Export untuk akses global
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleFavorite = toggleFavorite;
window.initGamePage = initGamePage;