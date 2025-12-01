// assets/js/game-ui.js - VERSION WITH ENHANCED SIDEBAR

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

// Toggle sidebar dengan animasi smooth - DIPERBARUI
function toggleSidebar() {
    // Cegat jika sedang animasi
    if (sidebarState.isAnimating) return;
    
    sidebarState.isAnimating = true;
    sidebarState.isOpen = !sidebarState.isOpen;
    
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const overlay = document.querySelector('.overlay-sidebar');
    const body = document.body;
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    if (sidebarState.isOpen) {
        // BUKA SIDEBAR
        body.classList.add('sidebar-open');
        
        if (sidebar) {
            sidebar.classList.add('active');
        }
        
        if (content) {
            if (sidebarState.isMobile) {
                content.classList.add('sidebar-shifted');
                // Di mobile, fixed content agar tidak scroll
                content.style.position = 'fixed';
                content.style.width = '100%';
                content.style.height = '100vh';
            } else {
                content.classList.add('shifted');
            }
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        // Update icon hamburger
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
            toggleBtn.setAttribute('title', 'Close Sidebar');
            toggleBtn.setAttribute('aria-label', 'Close Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('sidebar:opened'));
        
        console.log('✅ Sidebar opened - Mobile:', sidebarState.isMobile);
    } else {
        // TUTUP SIDEBAR
        body.classList.remove('sidebar-open');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        if (content) {
            if (sidebarState.isMobile) {
                content.classList.remove('sidebar-shifted');
                // Reset position di mobile
                content.style.position = '';
                content.style.width = '';
                content.style.height = '';
            } else {
                content.classList.remove('shifted');
            }
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Update icon hamburger
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
            toggleBtn.setAttribute('title', 'Open Sidebar');
            toggleBtn.setAttribute('aria-label', 'Open Sidebar');
            toggleBtn.setAttribute('aria-expanded', 'false');
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
    toggleSidebar();
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
    
    // Setup sidebar scroll behavior
    setupSidebarScroll();
    
    // Update hamburger button
    updateHamburgerButton();
    
    // Setup sidebar height calculation
    setupSidebarHeight();
    
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
    
    // Setup overlay touch events untuk mobile
    overlay.addEventListener('touchstart', function(e) {
        e.preventDefault();
        closeSidebar();
    }, { passive: false });
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
        
        // Touch event untuk mobile
        dismissBtn.addEventListener('touchstart', function(e) {
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
        
        // Touch events untuk mobile
        sidebar.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });
    }
}

// Setup menu interactions
function setupMenuInteractions() {
    const menuItems = document.querySelectorAll('.sidebar-menu li a');
    menuItems.forEach(item => {
        // Click event
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to section jika ada onclick attribute
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('scrollToSection')) {
                const sectionMatch = onclickAttr.match(/'([^']+)'/);
                if (sectionMatch && sectionMatch[1]) {
                    scrollToSection(sectionMatch[1]);
                }
            }
            
            // Di mobile, tutup sidebar setelah pilih menu
            if (sidebarState.isMobile) {
                closeSidebar();
            }
        });
        
        // Touch event untuk mobile
        item.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        });
    });
}

// Setup responsive behavior - DIPERBARUI
function setupResponsiveBehavior() {
    // Update mobile state on resize
    const updateMobileState = () => {
        const wasMobile = sidebarState.isMobile;
        sidebarState.isMobile = window.innerWidth < 992;
        
        console.log(`📱 Mobile state: ${sidebarState.isMobile} (was: ${wasMobile})`);
        
        // Jika berubah dari mobile ke desktop dan sidebar terbuka
        if (wasMobile && !sidebarState.isMobile && sidebarState.isOpen) {
            // Pindahkan dari mobile shift ke desktop shift
            const content = document.getElementById('content');
            if (content) {
                content.classList.remove('sidebar-shifted');
                content.classList.add('shifted');
                // Reset position
                content.style.position = '';
                content.style.width = '';
                content.style.height = '';
            }
        }
        
        // Jika berubah dari desktop ke mobile dan sidebar terbuka
        if (!wasMobile && sidebarState.isMobile && sidebarState.isOpen) {
            // Pindahkan dari desktop shift ke mobile shift
            const content = document.getElementById('content');
            if (content) {
                content.classList.remove('shifted');
                content.classList.add('sidebar-shifted');
                // Set position fixed untuk mobile
                content.style.position = 'fixed';
                content.style.width = '100%';
                content.style.height = '100vh';
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
    
    // Touch events untuk mobile
    document.addEventListener('touchstart', function(e) {
        if (sidebarState.isOpen && sidebarState.isMobile) {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.getElementById('sidebar-toggle-btn');
            const overlay = document.querySelector('.overlay-sidebar');
            
            if (sidebar && 
                !sidebar.contains(e.target) && 
                toggleBtn && 
                !toggleBtn.contains(e.target) &&
                overlay && 
                !overlay.contains(e.target)) {
                closeSidebar();
            }
        }
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
        
        // Arrow left untuk close sidebar
        if (e.key === 'ArrowLeft' && sidebarState.isOpen) {
            closeSidebar();
        }
        
        // Arrow right untuk open sidebar (jika ditutup)
        if (e.key === 'ArrowRight' && !sidebarState.isOpen) {
            toggleSidebar();
        }
    });
}

// Setup sidebar scroll behavior
function setupSidebarScroll() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    // Smooth scroll untuk sidebar
    sidebar.addEventListener('wheel', function(e) {
        // Biarkan scroll alami
    }, { passive: true });
    
    // Touch scroll untuk mobile
    sidebar.addEventListener('touchmove', function(e) {
        // Biarkan touch scroll alami
    }, { passive: true });
}

// Setup sidebar height calculation
function setupSidebarHeight() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    // Hitung tinggi sidebar berdasarkan konten
    const calculateHeight = () => {
        const header = document.querySelector('.sidebar-header');
        const footer = document.querySelector('.sidebar-footer');
        const menu = document.querySelector('.sidebar-menu');
        
        if (header && menu && footer) {
            const headerHeight = header.offsetHeight;
            const footerHeight = footer.offsetHeight;
            const menuHeight = menu.scrollHeight;
            
            // Jika menu lebih pendek dari viewport, atur tinggi maksimal
            const viewportHeight = window.innerHeight;
            const availableHeight = viewportHeight - headerHeight - footerHeight;
            
            if (menuHeight < availableHeight) {
                menu.style.maxHeight = menuHeight + 'px';
            } else {
                menu.style.maxHeight = availableHeight + 'px';
            }
        }
    };
    
    // Hitung saat load dan resize
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    // Hitung ulang saat konten berubah
    const observer = new MutationObserver(calculateHeight);
    observer.observe(sidebar, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true 
    });
}

// Update hamburger button in navbar
function updateHamburgerButton() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
        // Pastikan tombol terlihat dan berfungsi
        toggleBtn.style.display = 'flex';
        toggleBtn.style.visibility = 'visible';
        toggleBtn.style.opacity = '1';
        toggleBtn.classList.remove('d-none');
        
        toggleBtn.onclick = toggleSidebar;
        toggleBtn.setAttribute('title', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
        toggleBtn.setAttribute('aria-expanded', sidebarState.isOpen);
        toggleBtn.setAttribute('aria-controls', 'sidebar');
        
        // Update initial icon
        if (sidebarState.isOpen) {
            toggleBtn.innerHTML = '<i class="bi bi-x-lg fs-3"></i>';
            toggleBtn.setAttribute('title', 'Close Sidebar');
        } else {
            toggleBtn.innerHTML = '<i class="bi bi-list fs-3"></i>';
            toggleBtn.setAttribute('title', 'Open Sidebar');
        }
        
        // Touch event untuk mobile
        toggleBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleSidebar();
        });
    }
}

// Helper function untuk scroll ke section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        // Smooth scroll ke section
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Tambah highlight effect
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 0 2px rgba(111, 66, 193, 0.3)';
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 1000);
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
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto remove setelah duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
}

// Handle sidebar swipe gestures untuk mobile
function setupSwipeGestures() {
    if (!sidebarState.isMobile) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // Minimum swipe distance
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe kanan untuk buka sidebar (jika dimulai dari tepi kiri)
        if (touchStartX < 50 && swipeDistance > swipeThreshold && !sidebarState.isOpen) {
            toggleSidebar();
        }
        
        // Swipe kiri untuk tutup sidebar
        if (sidebarState.isOpen && swipeDistance < -swipeThreshold) {
            closeSidebar();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Game page DOM loaded');
    
    // Setup swipe gestures untuk mobile
    setupSwipeGestures();
    
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
        
        // Check for hash in URL untuk auto-scroll
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            setTimeout(() => {
                scrollToSection(sectionId);
            }, 1000);
        }
    }, 100);
    
    // Listen for navbar rendering events
    document.addEventListener('navbar:rendered', function() {
        console.log('🔄 Navbar rendered, updating hamburger button');
        updateHamburgerButton();
    });
    
    // Listen for window focus (untuk handle back button di mobile)
    window.addEventListener('focus', function() {
        // Reset state jika perlu
        if (sidebarState.isOpen && sidebarState.isMobile) {
            // Periksa ukuran layar kembali
            sidebarState.isMobile = window.innerWidth < 992;
        }
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            sidebarState.isMobile = window.innerWidth < 992;
            console.log('🔄 Orientation changed, mobile:', sidebarState.isMobile);
            
            // Jika sidebar terbuka dan orientation berubah, tutup sidebar
            if (sidebarState.isOpen) {
                closeSidebar();
            }
        }, 300);
    });
});

// Export untuk akses global
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleFavorite = toggleFavorite;
window.initGamePage = initGamePage;
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;