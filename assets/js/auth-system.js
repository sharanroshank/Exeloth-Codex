// assets/js/auth-system.js - Authentication System for All Pages
let currentUser = null;
let isCheckingAdminAccess = false;
let isSigningIn = false;

// Initialize auth system for all pages
function initAuthSystem() {
    console.log('🚀 Initializing auth system...');
    
    // Check authentication state - GLOBAL LISTENER
    auth.onAuthStateChanged(async (user) => {
        console.log('🔄 Auth state changed:', user ? user.email : 'No user');
        
        if (user) {
            await handleUserSignedIn(user);
        } else {
            // Not logged in
            currentUser = null;
            updateNavbar(false);
            resetNavbarLoginState();
        }
    });
}

// Handle user signed in
async function handleUserSignedIn(user) {
    if (isCheckingAdminAccess) {
        console.log('⏳ Admin check already in progress...');
        return;
    }
    
    isCheckingAdminAccess = true;
    
    try {
        console.log('🔍 Checking admin access for:', user.email);
        
        // Check if user is in admins collection
        const adminDoc = await db.collection('admins').doc(user.email).get();
        
        if (adminDoc.exists) {
            // ✅ ADMIN ACCESS GRANTED
            currentUser = user;
            console.log('✅ Admin access granted:', user.email);
            
            // Update navbar di semua page
            updateNavbar(true);
            
            // REDIRECT KE ADMIN PANEL SETELAH LOGIN BERHASIL
            if (!window.location.pathname.includes('admin.html')) {
                console.log('🔄 Redirecting to admin panel...');
                showNotification('✅ Login successful! Redirecting to admin panel...', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Jika sudah di admin page, show admin panel
                showAdminPanel(user);
                
                // Show welcome notification hanya sekali
                if (!sessionStorage.getItem('welcomeShown')) {
                    showNotification('✅ Welcome to Admin Panel, ' + (user.displayName || user.email), 'success');
                    sessionStorage.setItem('welcomeShown', 'true');
                }
            }
            
        } else {
            // ❌ NOT ADMIN
            console.log('❌ Access denied - not in admin list:', user.email);
            showNotification('❌ Access Denied: You are not authorized to access admin panel', 'error');
            
            // Update navbar
            updateNavbar(false);
            resetNavbarLoginState();
            
            // Auto sign out after 3 seconds
            setTimeout(() => {
                auth.signOut();
            }, 3000);
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
        showNotification('❌ Error checking access: ' + error.message, 'error');
        
        // Update navbar
        updateNavbar(false);
        resetNavbarLoginState();
        
        // Auto sign out on error
        setTimeout(() => {
            auth.signOut();
        }, 3000);
    } finally {
        isCheckingAdminAccess = false;
    }
}

// Show Google Sign In - LANGSUNG LOGIN TANPA MODAL
function showGoogleSignIn() {
    if (isSigningIn) {
        console.log('⏳ Sign-in already in progress...');
        return;
    }
    
    isSigningIn = true;
    console.log('🚀 Starting direct Google sign-in...');
    
    // Show loading state di navbar
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.innerHTML = '<i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-1"></i> Signing in...';
        loginLink.classList.add('disabled');
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('✅ Signed in successfully:', result.user.email);
            isSigningIn = false;
            // Auth state listener akan handle sisanya (termasuk redirect ke admin panel)
        })
        .catch((error) => {
            console.error('❌ Error signing in:', error);
            isSigningIn = false;
            
            // Reset navbar state
            resetNavbarLoginState();
            
            if (error.code === 'auth/popup-blocked') {
                showNotification('Popup login diblokir. Silakan allow popup untuk website ini.', 'error');
            } else if (error.code === 'auth/popup-closed-by-user') {
                console.log('User closed the popup');
                showNotification('Login cancelled', 'info');
            } else {
                showNotification('Error signing in: ' + error.message, 'error');
            }
        });
}

// Reset navbar login state
function resetNavbarLoginState() {
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Login';
        loginLink.classList.remove('disabled');
    }
}

// Update navbar based on login status (untuk semua page)
function updateNavbar(isLoggedIn) {
    const loginNavItem = document.getElementById('login-nav-item');
    const adminNavItem = document.getElementById('admin-nav-item');
    
    if (loginNavItem && adminNavItem) {
        if (isLoggedIn) {
            loginNavItem.classList.add('d-none');
            adminNavItem.classList.remove('d-none');
        } else {
            loginNavItem.classList.remove('d-none');
            adminNavItem.classList.add('d-none');
        }
    }
}

// Sign out function
function signOut() {
    // Clear session storage
    sessionStorage.removeItem('welcomeShown');
    
    auth.signOut().then(() => {
        console.log('✅ Signed out successfully');
        currentUser = null;
        updateNavbar(false);
        showNotification('👋 Signed out successfully', 'info');
        
        // Jika di admin page, redirect ke homepage setelah sign out
        if (window.location.pathname.includes('admin.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }).catch((error) => {
        console.error('Error signing out:', error);
        showNotification('Error signing out: ' + error.message, 'error');
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.log('Notification container not found');
        return;
    }
    
    // Remove existing notifications
    const existingNotifications = notificationContainer.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    });
    
    setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${getAlertType(type)} d-flex align-items-center`;
        
        notification.style.cssText = `
            min-width: 300px;
            max-width: 400px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            margin-bottom: 10px;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease-in-out;
        `;
        
        const icon = getNotificationIcon(type);
        
        notification.innerHTML = `
            <i class="bi ${icon} me-2 fs-5"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close btn-close-white ms-2" onclick="closeNotification(this)"></button>
        `;
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(400px)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }, 350);
}

function closeNotification(closeButton) {
    const notification = closeButton.closest('.notification');
    if (notification) {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }
}

function getAlertType(type) {
    const types = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return types[type] || 'info';
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'bi-check-circle-fill',
        'error': 'bi-x-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Auth system initializing...');
    initAuthSystem();
});

// Export functions for global access
window.showGoogleSignIn = showGoogleSignIn;
window.signOut = signOut;
window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.updateNavbar = updateNavbar;