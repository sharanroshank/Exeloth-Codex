// assets/js/game-ui.js - VERSION WITH PERSISTENT SIDEBAR
let isFavorite = false;
let sidebarState = { 
    isOpen: window.innerWidth >= 768, // Desktop: terbuka, Mobile: tertutup
    isMobile: window.innerWidth < 768,
    isAnimating: false
};

// Toggle sidebar HANYA UNTUK MOBILE
function toggleSidebar() {
    if (!sidebarState.isMobile || sidebarState.isAnimating) return;
    
    sidebarState.isAnimating = true;
    sidebarState.isOpen = !sidebarState.isOpen;
    
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (sidebarState.isOpen) {
        // BUKA SIDEBAR di mobile
        console.log('🔓 Opening sidebar (mobile)');
        
        body.classList.add('sidebar-open-mobile');
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        
        // Update hamburger button
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
            toggleBtn.setAttribute('title', 'Close Sidebar');
            toggleBtn.setAttribute('aria-label', 'Close Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.classList.add('active');
        }
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        
        document.dispatchEvent(new CustomEvent('sidebar:opened'));
        
    } else {
        // TUTUP SIDEBAR di mobile
        console.log('🔒 Closing sidebar (mobile)');
        
        body.classList.remove('sidebar-open-mobile');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        
        // Update hamburger button
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
            toggleBtn.setAttribute('title', 'Open Sidebar');
            toggleBtn.setAttribute('aria-label', 'Open Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.classList.remove('active');
        }
        
        // Unlock body scroll
        document.body.style.overflow = '';
        
        document.dispatchEvent(new CustomEvent('sidebar:closed'));
    }
    
    // Reset animation lock
    setTimeout(() => {
        sidebarState.isAnimating = false;
    }, 300);
}

// Close sidebar function - hanya untuk mobile
function closeSidebar() {
    if (!sidebarState.isMobile || !sidebarState.isOpen || sidebarState.isAnimating) return;
    toggleSidebar();
}

// Open sidebar function - hanya untuk mobile
function openSidebar() {
    if (!sidebarState.isMobile || sidebarState.isOpen || sidebarState.isAnimating) return;
    toggleSidebar();
}

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

// Initialize game page
function initGamePage() {
    console.log('🎮 Initializing game page UI with persistent sidebar...');
    
    // Setup semua komponen
    setupOverlay();
    setupSidebarEvents();
    setupMenuInteractions();
    setupResponsiveBehavior();
    setupKeyboardShortcuts();
    setupHamburgerButton();
    setupSwipeGestures();
    setupScrollToSection();
    
    // Setup initial state
    updateSidebarHeight();
    
    console.log('✅ Game page UI initialized');
}

// Setup overlay (hanya untuk mobile)
function setupOverlay() {
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        document.body.appendChild(overlay);
        console.log('✅ Overlay created for mobile');
    }
    
    // Setup overlay events
    overlay.addEventListener('click', closeSidebar);
    overlay.addEventListener('touchstart', function(e) {
        e.preventDefault();
        closeSidebar();
    }, { passive: false });
}

// Setup sidebar events
function setupSidebarEvents() {
    // Dismiss button - hanya untuk mobile
    const dismissBtn = document.getElementById('dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', function(e) {
            e.preventDefault();
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
            
            // Scroll ke section
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                scrollToSection(targetId);
            }
            
            // Di mobile, tutup sidebar setelah memilih menu
            if (sidebarState.isMobile) {
                setTimeout(closeSidebar, 300);
            }
        });
    });
}

// Setup responsive behavior
function setupResponsiveBehavior() {
    // Update mobile state on resize
    const updateMobileState = () => {
        const wasMobile = sidebarState.isMobile;
        sidebarState.isMobile = window.innerWidth < 768;
        
        console.log(`📱 Mobile state changed: ${sidebarState.isMobile} (was: ${wasMobile})`);
        
        const body = document.body;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.overlay-sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        
        if (sidebarState.isMobile) {
            // MODE MOBILE - sidebar default tertutup
            sidebarState.isOpen = false;
            
            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            if (toggleBtn) {
                toggleBtn.style.display = 'flex';
                toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
                toggleBtn.setAttribute('title', 'Open Sidebar');
            }
            body.classList.remove('sidebar-open-mobile');
            document.body.style.overflow = '';
            
        } else {
            // MODE DESKTOP - sidebar default terbuka
            sidebarState.isOpen = true;
            
            if (sidebar) sidebar.classList.add('active');
            if (overlay) overlay.classList.remove('active');
            if (toggleBtn) {
                toggleBtn.style.display = 'none';
            }
            body.classList.remove('sidebar-open-mobile');
            document.body.style.overflow = '';
        }
        
        // Dispatch state update event
        document.dispatchEvent(new CustomEvent('sidebar:state:update', { 
            detail: { 
                isOpen: sidebarState.isOpen,
                isMobile: sidebarState.isMobile
            }
        }));
    };
    
    // Initial check
    updateMobileState();
    
    // Handle resize dengan debounce
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            updateMobileState();
        }, 250);
    });
}

// Setup hamburger button
function setupHamburgerButton() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        // Hanya tampilkan di mobile
        if (sidebarState.isMobile) {
            toggleBtn.style.display = 'flex';
            toggleBtn.style.visibility = 'visible';
            toggleBtn.style.opacity = '1';
            toggleBtn.classList.remove('d-none');
            
            // Set initial state
            if (sidebarState.isOpen) {
                toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
                toggleBtn.setAttribute('title', 'Close Sidebar');
                toggleBtn.setAttribute('aria-label', 'Close Sidebar');
                toggleBtn.setAttribute('aria-expanded', 'true');
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
                toggleBtn.setAttribute('title', 'Open Sidebar');
                toggleBtn.setAttribute('aria-label', 'Open Sidebar');
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.classList.remove('active');
            }
            
            // Event listener
            toggleBtn.onclick = toggleSidebar;
        } else {
            // Di desktop: sembunyikan tombol
            toggleBtn.style.display = 'none';
            toggleBtn.classList.add('d-none');
        }
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape untuk menutup sidebar (hanya di mobile)
        if (e.key === 'Escape' && sidebarState.isOpen && sidebarState.isMobile) {
            closeSidebar();
        }
        
        // Ctrl+B atau Cmd+B untuk toggle sidebar (hanya di mobile)
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            if (sidebarState.isMobile) {
                toggleSidebar();
            }
        }
    });
}

// Setup swipe gestures untuk mobile
function setupSwipeGestures() {
    if (!sidebarState.isMobile) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe kanan untuk buka sidebar
        if (touchStartX < 50 && swipeDistance > swipeThreshold && !sidebarState.isOpen) {
            openSidebar();
        }
        
        // Swipe kiri untuk tutup sidebar
        if (sidebarState.isOpen && swipeDistance < -swipeThreshold) {
            closeSidebar();
        }
    }, { passive: true });
}

// Update sidebar height calculation
function updateSidebarHeight() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    const calculateHeight = () => {
        const scrollable = document.querySelector('.sidebar-scrollable');
        if (scrollable) {
            const viewportHeight = window.innerHeight;
            const availableHeight = viewportHeight;
            
            scrollable.style.maxHeight = availableHeight + 'px';
        }
    };
    
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
}

// Setup scroll to section
function setupScrollToSection() {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update URL hash tanpa reload
            if (history.pushState) {
                history.pushState(null, null, '#' + sectionId);
            }
        }
    };
    
    // Setup untuk anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    scrollToSection(targetId);
                }
            }
        });
    });
    
    // Export untuk akses global
    window.scrollToSection = scrollToSection;
}

// Helper notification untuk game page
function showNotification(message, type = 'info', duration = 3000) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
        return;
    }
    
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
}

// Handle orientation change
function setupOrientationChange() {
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            sidebarState.isMobile = window.innerWidth < 768;
            console.log('🔄 Orientation changed, mobile:', sidebarState.isMobile);
            setupHamburgerButton();
        }, 300);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Game page DOM loaded with persistent sidebar');
    
    // Tambah class untuk persistent sidebar
    document.body.classList.add('sidebar-persistent');
    
    // Tunggu sebentar untuk memastikan navbar sudah dirender
    setTimeout(() => {
        initGamePage();
        setupOrientationChange();
        
        // Check URL hash untuk auto-scroll
        if (window.location.hash) {
            setTimeout(() => {
                const sectionId = window.location.hash.substring(1);
                if (window.scrollToSection) {
                    window.scrollToSection(sectionId);
                }
            }, 500);
        }
    }, 300);
    
    // Listen for navbar rendering events
    document.addEventListener('navbar:rendered', function() {
        console.log('🔄 Navbar rendered, updating hamburger button');
        setupHamburgerButton();
    });
});

// Export untuk akses global
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleFavorite = toggleFavorite;
window.initGamePage = initGamePage;
window.showNotification = showNotification;

console.log('✅ game-ui.js loaded successfully with persistent sidebar');