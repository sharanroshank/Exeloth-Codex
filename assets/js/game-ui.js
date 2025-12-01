// assets/js/game-ui.js - VERSION WITH FIXED SIDEBAR & CONTENT SHIFT

let isFavorite = false;
let sidebarState = { 
    isOpen: false, 
    isAnimating: false,
    isMobile: window.innerWidth < 992,
    sidebarWidth: 280 // Sesuai dengan CSS variable --sidebar-width
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

// Toggle sidebar dengan animasi smooth - DIPERBARUI TOTAL
function toggleSidebar() {
    // Cegat jika sedang animasi
    if (sidebarState.isAnimating) return;
    
    sidebarState.isAnimating = true;
    sidebarState.isOpen = !sidebarState.isOpen;
    
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const navbarLeftGroup = document.getElementById('navbar-left-group');
    
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
        
        // Sembunyikan navbar left group di mobile
        if (sidebarState.isMobile && navbarLeftGroup) {
            navbarLeftGroup.style.opacity = '0';
            navbarLeftGroup.style.visibility = 'hidden';
            navbarLeftGroup.style.width = '0';
            navbarLeftGroup.style.transition = 'all 0.3s ease';
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
        
        // Tampilkan navbar left group di mobile
        if (sidebarState.isMobile && navbarLeftGroup) {
            setTimeout(() => {
                navbarLeftGroup.style.opacity = '1';
                navbarLeftGroup.style.visibility = 'visible';
                navbarLeftGroup.style.width = 'auto';
            }, 300);
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
        
        // Touch support
        dismissBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            closeSidebar();
        }, { passive: false });
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
        // Click event
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Coba eksekusi onclick attribute jika ada
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                try {
                    // Ekstrak parameter dari onclick
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
        
        // Touch support untuk mobile
        item.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    });
}

// Setup responsive behavior
function setupResponsiveBehavior() {
    // Update mobile state on resize
    const updateMobileState = () => {
        const wasMobile = sidebarState.isMobile;
        sidebarState.isMobile = window.innerWidth < 992;
        
        // Update sidebar width untuk mobile
        if (sidebarState.isMobile) {
            sidebarState.sidebarWidth = window.innerWidth * 0.85; // 85% dari lebar layar
        } else {
            sidebarState.sidebarWidth = 280; // Default width
        }
        
        console.log(`📱 Mobile state changed: ${sidebarState.isMobile} (was: ${wasMobile})`);
        
        // Handle overlay visibility berdasarkan device
        const overlay = document.querySelector('.overlay-sidebar');
        if (overlay) {
            if (sidebarState.isMobile && sidebarState.isOpen) {
                overlay.style.display = 'block';
            } else if (!sidebarState.isMobile) {
                overlay.style.display = 'none';
            }
        }
        
        // Jika berubah dari desktop ke mobile dan sidebar terbuka
        if (!wasMobile && sidebarState.isMobile && sidebarState.isOpen) {
            // Pastikan overlay aktif di mobile
            if (overlay) {
                overlay.classList.add('active');
            }
        }
        
        // Jika berubah dari mobile ke desktop dan sidebar terbuka
        if (wasMobile && !sidebarState.isMobile && sidebarState.isOpen) {
            // Nonaktifkan overlay di desktop
            if (overlay) {
                overlay.classList.remove('active');
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
    
    // Close sidebar ketika klik di luar (desktop only)
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
        
        // Arrow left/right untuk kontrol sidebar
        if (e.key === 'ArrowLeft' && sidebarState.isOpen) {
            closeSidebar();
        }
        if (e.key === 'ArrowRight' && !sidebarState.isOpen) {
            openSidebar();
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
        
        // Touch support
        toggleBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleSidebar();
        }, { passive: false });
        
        console.log('✅ Hamburger button initialized');
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
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe kanan untuk buka sidebar (hanya jika mulai dari tepi kiri)
        if (touchStartX < 50 && swipeDistance > swipeThreshold && !sidebarState.isOpen) {
            openSidebar();
        }
        
        // Swipe kiri untuk tutup sidebar
        if (sidebarState.isOpen && swipeDistance < -swipeThreshold) {
            closeSidebar();
        }
    }
}

// Update sidebar height calculation
function updateSidebarHeight() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    const calculateHeight = () => {
        const header = document.querySelector('.sidebar-header');
        const footer = document.querySelector('.sidebar-footer');
        const scrollable = document.querySelector('.sidebar-scrollable');
        
        if (scrollable) {
            const viewportHeight = window.innerHeight;
            const headerHeight = header ? header.offsetHeight : 0;
            const footerHeight = footer ? footer.offsetHeight : 0;
            const availableHeight = viewportHeight - headerHeight - footerHeight - 20; // Margin
            
            scrollable.style.maxHeight = availableHeight + 'px';
        }
    };
    
    // Hitung saat load dan resize
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
}

// Setup scroll to section
function setupScrollToSection() {
    // Setup untuk semua link yang mengarah ke section
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
        // Smooth scroll ke section
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Highlight effect
        const originalTransition = element.style.transition;
        const originalBoxShadow = element.style.boxShadow;
        
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 0 2px rgba(111, 66, 193, 0.3)';
        
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            setTimeout(() => {
                element.style.transition = originalTransition;
            }, 300);
        }, 1000);
        
        // Update URL hash tanpa reload
        if (history.pushState) {
            history.pushState(null, null, '#' + sectionId);
        } else {
            window.location.hash = '#' + sectionId;
        }
    }
}

// Helper notification untuk game page
function showNotification(message, type = 'info', duration = 3000) {
    // Gunakan fungsi global jika ada
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
        return;
    }
    
    // Fallback notification
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    
    // Buat element notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.cssText = `
        z-index: 99999;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 350px;
        pointer-events: auto;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Tambah ke container atau langsung ke body
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
    } else {
        document.body.appendChild(notification);
    }
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Handle orientation change
function setupOrientationChange() {
    window.addEventListener('orientationchange', function() {
        // Update state setelah orientation change
        setTimeout(() => {
            sidebarState.isMobile = window.innerWidth < 992;
            console.log('🔄 Orientation changed, mobile:', sidebarState.isMobile);
            
            // Update overlay visibility
            const overlay = document.querySelector('.overlay-sidebar');
            if (overlay && sidebarState.isMobile && sidebarState.isOpen) {
                overlay.style.display = 'block';
                overlay.classList.add('active');
            } else if (overlay && !sidebarState.isMobile) {
                overlay.style.display = 'none';
                overlay.classList.remove('active');
            }
        }, 300);
    });
}

// Setup intersection observer untuk active menu tracking
function setupIntersectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    const menuLinks = document.querySelectorAll('.sidebar-menu li a');
    
    if (sections.length === 0 || menuLinks.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Update active menu
                menuLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-target') === sectionId || 
                        link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Game page DOM loaded');
    
    // Tunggu sebentar untuk memastikan navbar sudah dirender
    setTimeout(() => {
        // Setup semua komponen
        initGamePage();
        
        // Setup orientation change handling
        setupOrientationChange();
        
        // Setup intersection observer
        setTimeout(setupIntersectionObserver, 500);
        
        // Check URL parameters untuk auto-open sidebar
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('sidebar') === 'open') {
            setTimeout(() => {
                if (!sidebarState.isOpen) {
                    openSidebar();
                }
            }, 800);
        }
        
        // Check hash untuk auto-scroll
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            setTimeout(() => {
                scrollToSection(sectionId);
            }, 1000);
        }
    }, 300);
    
    // Listen for navbar rendering events
    document.addEventListener('navbar:rendered', function() {
        console.log('🔄 Navbar rendered, updating hamburger button');
        setupHamburgerButton();
    });
    
    // Listen untuk sidebar events
    document.addEventListener('sidebar:opened', function() {
        console.log('📢 Sidebar opened event received');
        sidebarState.isOpen = true;
    });
    
    document.addEventListener('sidebar:closed', function() {
        console.log('📢 Sidebar closed event received');
        sidebarState.isOpen = false;
    });
    
    // Setup popstate untuk browser back/forward
    window.addEventListener('popstate', function() {
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            scrollToSection(sectionId);
        }
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

// Export sidebar state untuk debugging
window.sidebarState = sidebarState;

console.log('✅ game-ui.js loaded successfully');