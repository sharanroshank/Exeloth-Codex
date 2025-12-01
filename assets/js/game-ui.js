// assets/js/game-ui.js - VERSION WITH SIDEBAR FIX

let isFavorite = false;
let sidebarState = { 
    isOpen: false, 
    isAnimating: false,
    isMobile: window.innerWidth < 992
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
        if (sidebar) {
            sidebar.classList.add('active');
        }
        
        if (content) {
            if (sidebarState.isMobile) {
                content.classList.add('sidebar-shifted');
            } else {
                content.classList.add('shifted');
            }
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        if (body) {
            body.style.overflow = 'hidden';
        }
        
        // Update navbar left group
        if (leftNavbarGroup) {
            leftNavbarGroup.classList.add('nav-hidden');
        }
        
        // Update icon hamburger
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
            toggleBtn.setAttribute('title', 'Close Sidebar');
            toggleBtn.setAttribute('aria-label', 'Close Sidebar');
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('sidebar:opened'));
        
        console.log('✅ Sidebar opened');
    } else {
        // TUTUP SIDEBAR
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        if (content) {
            if (sidebarState.isMobile) {
                content.classList.remove('sidebar-shifted');
            } else {
                content.classList.remove('shifted');
            }
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        if (body) {
            body.style.overflow = '';
        }
        
        // Update navbar left group
        if (leftNavbarGroup) {
            leftNavbarGroup.classList.remove('nav-hidden');
        }
        
        // Update icon hamburger
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
            toggleBtn.setAttribute('title', 'Open Sidebar');
            toggleBtn.setAttribute('aria-label', 'Open Sidebar');
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('sidebar:closed'));
        
        console.log('✅ Sidebar closed');
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
    console.log('🎮 Initializing game page UI...');
    
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
    
    // Update hamburger button
    updateHamburgerButton();
    
    console.log('✅ Game page UI initialized');
}

// Ensure overlay exists
function ensureOverlayExists() {
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        overlay.setAttribute('id', 'sidebar-overlay');
        document.body.appendChild(overlay);
        
        console.log('✅ Overlay created');
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
            e.preventDefault();
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
            
            // Scroll to section jika ada data-target
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                scrollToSection(targetId);
            }
            
            // Di mobile, tutup sidebar setelah pilih menu
            if (sidebarState.isMobile) {
                closeSidebar();
            }
        });
    });
}

// Setup responsive behavior
function setupResponsiveBehavior() {
    // Update mobile state on resize
    const updateMobileState = () => {
        sidebarState.isMobile = window.innerWidth < 992;
        console.log(`📱 Mobile state: ${sidebarState.isMobile}`);
    };
    
    // Initial check
    updateMobileState();
    
    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            updateMobileState();
            
            // Di mobile, auto-close sidebar saat resize ke desktop
            if (!sidebarState.isMobile && sidebarState.isOpen) {
                closeSidebar();
            }
            
            // Di desktop, auto-close sidebar saat resize ke mobile
            if (sidebarState.isMobile && sidebarState.isOpen) {
                closeSidebar();
            }
        }, 250);
    });
    
    // Auto close on outside click untuk desktop
    if (!sidebarState.isMobile) {
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

// Update hamburger button in navbar
function updateHamburgerButton() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        toggleBtn.classList.remove('d-none');
        toggleBtn.onclick = toggleSidebar;
        toggleBtn.setAttribute('title', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-expanded', sidebarState.isOpen);
        
        // Update initial icon
        if (sidebarState.isOpen) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
        }
    }
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
        // Buat notification element sederhana
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        notification.textContent = message;
        notification.style.zIndex = '10000';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Game page DOM loaded');
    
    // Wait for navbar to render
    setTimeout(() => {
        initGamePage();
        
        // Setup hamburger button in navbar
        updateHamburgerButton();
        
        // Check if we should open sidebar from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('sidebar') === 'open') {
            setTimeout(() => {
                toggleSidebar();
            }, 500);
        }
    }, 100);
    
    // Listen for navbar rendering events
    document.addEventListener('navbar:rendered', function() {
        console.log('🔄 Navbar rendered, updating hamburger button');
        updateHamburgerButton();
    });
});

// Export untuk akses global
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleFavorite = toggleFavorite;
window.initGamePage = initGamePage;
window.scrollToSection = scrollToSection;