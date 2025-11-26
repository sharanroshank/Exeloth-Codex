// assets/js/auth.js - Authentication and Notification System

let currentUser = null;
const notificationContainer = document.getElementById('notification-container');

// Show Google Sign In Modal
function showGoogleSignIn() {
    const modal = new bootstrap.Modal(document.getElementById('googleSignInModal'));
    modal.show();
    
    // Set up Google sign-in
    document.getElementById('google-signin-btn').onclick = signInWithGoogle;
}

// Sign in with Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    console.log('🚀 Starting Google sign-in...');
    
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('✅ Signed in successfully:', result.user.email);
            checkAdminAccess(result.user);
        })
        .catch((error) => {
            console.error('❌ Error signing in:', error);
            
            if (error.code === 'auth/popup-blocked') {
                showNotification('Popup login diblokir. Silakan allow popup untuk website ini.', 'error');
            } else if (error.code === 'auth/popup-closed-by-user') {
                console.log('User closed the popup');
            } else {
                showNotification('Error signing in: ' + error.message, 'error');
            }
        });
}

// Check if user has admin access
async function checkAdminAccess(user) {
    try {
        console.log('🔍 Checking admin access for:', user.email);
        
        const adminDoc = await db.collection('admins').doc(user.email).get();
        
        if (adminDoc.exists) {
            // ✅ ADMIN ACCESS GRANTED
            currentUser = user;
            showNotification('✅ Login successful! Welcome, ' + (user.displayName || user.email), 'success');
            updateNavbar(true);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('googleSignInModal'));
            if (modal) {
                modal.hide();
            }
            
            // Redirect to admin panel after 2 seconds
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
            
        } else {
            // ❌ NOT ADMIN
            console.log('❌ Access denied - not in admin list:', user.email);
            showNotification('❌ Access Denied: You are not authorized to access admin panel', 'error');
            signOut();
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
        showNotification('❌ Error checking access: ' + error.message, 'error');
        signOut();
    }
}

// Update navbar based on login status
function updateNavbar(isLoggedIn) {
    const loginNavItem = document.getElementById('login-nav-item');
    const adminNavItem = document.getElementById('admin-nav-item');
    
    if (isLoggedIn && loginNavItem && adminNavItem) {
        loginNavItem.classList.add('d-none');
        adminNavItem.classList.remove('d-none');
    } else if (loginNavItem && adminNavItem) {
        loginNavItem.classList.remove('d-none');
        adminNavItem.classList.add('d-none');
    }
}

// Sign out function
function signOut() {
    auth.signOut().then(() => {
        console.log('✅ Signed out successfully');
        currentUser = null;
        updateNavbar(false);
        showNotification('👋 Signed out successfully', 'info');
    }).catch((error) => {
        console.error('Error signing out:', error);
        showNotification('Error signing out: ' + error.message, 'error');
    });
}

// Notification System - WhatsApp-like slide notification
function showNotification(message, type = 'info') {
    if (!notificationContainer) {
        console.log('Notification container not found');
        return;
    }
    
    // Remove existing notifications
    const existingNotifications = notificationContainer.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${getAlertType(type)} d-flex align-items-center`;
    
    // Add WhatsApp-like styling
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
    
    // Set icon based on type
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <i class="bi ${icon} me-2 fs-5"></i>
        <div class="flex-grow-1">${message}</div>
        <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.remove()"></button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Animate in - slide from right to left
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // Auto remove after 5 seconds
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
}

// Get appropriate alert type for Bootstrap
function getAlertType(type) {
    const types = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return types[type] || 'info';
}

// Get appropriate icon for notification type
function getNotificationIcon(type) {
    const icons = {
        'success': 'bi-check-circle-fill',
        'error': 'bi-x-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
}

// Initialize auth state listener
function initAuth() {
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (user) {
                checkAdminAccess(user);
            } else {
                currentUser = null;
                updateNavbar(false);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing authentication system...');
    initAuth();
});

// Export functions for global access
window.showGoogleSignIn = showGoogleSignIn;
window.signOut = signOut;
window.showNotification = showNotification;
window.checkAdminAccess = checkAdminAccess;
window.updateNavbar = updateNavbar;