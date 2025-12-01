// assets/js/game-ui.js - VERSION WITH PROPER CONTENT SHIFT
let isFavorite = false;
let sidebarState = { 
    isOpen: false, 
    isAnimating: false,
    isMobile: window.innerWidth < 992,
    sidebarWidth: 280
};

// Toggle sidebar dengan animasi smooth - DIPERBARUI TOTAL
function toggleSidebar() {
    if (sidebarState.isAnimating) return;
    
    sidebarState.isAnimating = true;
    sidebarState.isOpen = !sidebarState.isOpen;
    
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (sidebarState.isOpen) {
        // BUKA SIDEBAR
        console.log('🔓 Opening sidebar');
        
        // Tambah class ke body
        body.classList.add('sidebar-open');
        
        // Buka sidebar
        if (sidebar) {
            sidebar.classList.add('active');
        }
        
        // Tampilkan overlay di mobile
        if (sidebarState.isMobile && overlay) {
            overlay.classList.add('active');
        }
        
        // Update hamburger button
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
            toggleBtn.setAttribute('title', 'Close Sidebar');
            toggleBtn.setAttribute('aria-label', 'Close Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.classList.add('active');
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('sidebar:opened'));
        
    } else {
        // TUTUP SIDEBAR
        console.log('🔒 Closing sidebar');
        
        // Hapus class dari body
        body.classList.remove('sidebar-open');
        
        // Tutup sidebar
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        // Sembunyikan overlay di mobile
        if (sidebarState.isMobile && overlay) {
            overlay.classList.remove('active');
        }
        
        // Update hamburger button
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
            toggleBtn.setAttribute('title', 'Open Sidebar');
            toggleBtn.setAttribute('aria-label', 'Open Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.classList.remove('active');
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('sidebar:closed'));
    }
    
    // Reset animation lock
    setTimeout(() => {
        sidebarState.isAnimating = false;
    }, 300);
}

// Close sidebar function
function closeSidebar() {
    if (!sidebarState.isOpen || sidebarState.isAnimating) return;
    toggleSidebar();
}

// Open sidebar function
function openSidebar() {
    if (sidebarState.isOpen || sidebarState.isAnimating) return;
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
    console.log('🎮 Initializing game page UI...');
    
    // Setup semua komponen
    setupOverlay();
    setupSidebarEvents();
    setupMenuInteractions();
    setupResponsiveBehavior();
    setupKeyboardShortcuts();
    setupHamburgerButton();
    setupSwipeGestures();
    
    // Setup initial state
    updateSidebarHeight();
    setupScrollToSection();
    
    console.log('✅ Game page UI initialized');
}

// Setup overlay
function setupOverlay() {
    let overlay = document.querySelector('.overlay-sidebar');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay-sidebar';
        document.body.appendChild(overlay);
        console.log('✅ Overlay created');
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
    // Dismiss button
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
            
            // Coba eksekusi onclick attribute jika ada
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                try {
                    const match = onclickAttr.match(/['"]([^'"]+)['"]/);
                    if (match && match[1]) {
                        const targetId = match[1];
                        scrollToSection(targetId);
                    }
                } catch (err) {
                    console.warn('Error executing onclick:', err);
                }
            }
            
            // Di mobile, tutup sidebar setelah memilih menu
            if (sidebarState.isMobile) {
                setTimeout(closeSidebar, 300);
            }
        });
    });
}

// Setup responsive behavior - DIPERBAIKI
function setupResponsiveBehavior() {
    // Update mobile state on resize
    const updateMobileState = () => {
        const wasMobile = sidebarState.isMobile;
        sidebarState.isMobile = window.innerWidth < 992;
        
        console.log(`📱 Mobile state changed: ${sidebarState.isMobile} (was: ${wasMobile})`);
        
        const body = document.body;
        const overlay = document.querySelector('.overlay-sidebar');
        const isSidebarOpen = sidebarState.isOpen;
        
        if (sidebarState.isMobile) {
            // MODE MOBILE
            if (isSidebarOpen && overlay) {
                overlay.classList.add('active');
            }
            // Di mobile, hapus margin dari body
            body.classList.remove('sidebar-open');
            
        } else {
            // MODE DESKTOP
            if (isSidebarOpen) {
                body.classList.add('sidebar-open');
            }
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
        
        // Jika berubah dari mobile ke desktop dan sidebar terbuka
        if (wasMobile && !sidebarState.isMobile && isSidebarOpen) {
            body.classList.add('sidebar-open');
        }
        
        // Jika berubah dari desktop ke mobile dan sidebar terbuka
        if (!wasMobile && sidebarState.isMobile && isSidebarOpen) {
            body.classList.remove('sidebar-open');
            if (overlay) {
                overlay.classList.add('active');
            }
        }
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

// Setup hamburger button
function setupHamburgerButton() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        // Pastikan tombol terlihat
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
    }
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
            const headerHeight = 76; // Height navbar
            const availableHeight = viewportHeight - headerHeight;
            
            scrollable.style.maxHeight = availableHeight + 'px';
        }
    };
    
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
}

// Setup scroll to section
function setupScrollToSection() {
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
}

// Helper function untuk scroll ke section
function scrollToSection(sectionId) {
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
            sidebarState.isMobile = window.innerWidth < 992;
            console.log('🔄 Orientation changed, mobile:', sidebarState.isMobile);
        }, 300);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Game page DOM loaded');
    
    // Tunggu sebentar untuk memastikan navbar sudah dirender
    setTimeout(() => {
        initGamePage();
        setupOrientationChange();
        
        // Check URL parameters untuk auto-open sidebar
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('sidebar') === 'open') {
            setTimeout(() => {
                if (!sidebarState.isOpen) {
                    openSidebar();
                }
            }, 800);
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
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;

console.log('✅ game-ui.js loaded successfully');