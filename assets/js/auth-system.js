// assets/js/auth-system.js - Authentication System for All Pages
let currentUser = null;
let isCheckingAdminAccess = false;
let isSigningIn = false;

// Initialize auth system for all pages
function initAuthSystem() {
    console.log('Initializing auth system...');
    
    // Check authentication state - GLOBAL LISTENER
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? user.email : 'No user');
        
        if (user) {
            await handleUserSignedIn(user);
        } else {
            // Not logged in
            currentUser = null;
            updateNavbar(false);
            resetNavbarLoginState();
            
            // [FIX BUG 17 - Security Redirect]
            // Jika user logout/belum login tapi ada di halaman admin, tendang ke home
            // Menggunakan includes('admin') agar mencakup 'admin.html' maupun '/admin'
            if (window.location.pathname.includes('admin')) {
                window.location.href = 'index.html';
            }
        }
    });
}

// Fungsi pembantu untuk menghapus user bandel secara paksa
async function cleanupUnauthorizedUser(user, reason) {
    console.log(`Cleaning up unauthorized user (${reason}):`, user.email);
    
    try {
        // 1. Coba hapus akun dari Firebase Auth
        await user.delete();
        console.log('✅ User record deleted from Firebase Authentication.');
        
        showNotification('Access Denied: Account removed.', 'error');
    } catch (error) {
        console.error('⚠️ Failed to delete user record:', error);
        // Jika gagal delete (misal perlu re-login), paksa Sign Out
        await auth.signOut();
        showNotification('Access Denied.', 'error');
    }

    // 2. Reset UI
    updateNavbar(false);
    resetNavbarLoginState();
}

// Handle user signed in (VERSI YANG SUDAH DIPERBAIKI)
async function handleUserSignedIn(user) {
    if (isCheckingAdminAccess) {
        return;
    }
    
    isCheckingAdminAccess = true;
    
    try {
        console.log('Checking admin access for:', user.email);
        
        // Cek database admin
        const adminDoc = await db.collection('admins').doc(user.email).get();
        
if (adminDoc.exists) {
            // ✅ ADMIN RESMI - Izinkan masuk
            currentUser = user;
            console.log('Admin access granted:', user.email);
            
            // --- TAMBAHKAN KODE INI ---
            // Update foto dan nama di navbar dropdown
            const navImg = document.getElementById('nav-profile-img');
            const navName = document.getElementById('nav-user-name');
            
            if (navImg && user.photoURL) {
                navImg.src = user.photoURL; // Pakai foto Google
            }
            if (navName) {
                navName.textContent = "Signed in as " + (user.displayName || user.email);
            }
            // ---------------------------
            
            // --- UPDATE FOTO NAVBAR (KODE LAMA BOLEH DIHAPUS) ---
            // const navImg = document.getElementById('nav-profile-img'); ... (HAPUS ATAU ABAIKAN)
            
            // --- TAMBAHKAN BARIS INI (PENTING!) ---
            if (window.updateNavbarProfile) {
                window.updateNavbarProfile(user); // <--- INI KUNCINYA
            }
            // ---------------------------------------
            
            updateNavbar(true);
            
            const isFromLoginAction = sessionStorage.getItem('loginAction') === 'true';
            const isOnAdminPage = window.location.pathname.includes('admin');
            
            // 1. LOGIKA NOTIFIKASI & REDIRECT (Hanya jika user BARU SAJA login via tombol)
            if (isFromLoginAction) {
                showNotification('Login successful!', 'success');
                sessionStorage.removeItem('loginAction'); // Hapus flag agar notifikasi tidak muncul lagi saat refresh
                
                // Redirect ke admin jika belum di sana
                if (!isOnAdminPage) {
                    setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
                }
            }
            // Jika isFromLoginAction = false, kita diam saja (SILENT MODE) saat pindah halaman
            
            // 2. LOGIKA MEMUAT PANEL ADMIN (Hanya jika sedang di halaman admin)
            if (isOnAdminPage) {
                setTimeout(() => {
                    if (typeof showAdminPanel === 'function') {
                        showAdminPanel(user);
                    } else {
                        // Tunggu sebentar jika script admin.js belum siap
                        setTimeout(() => showAdminPanel(user), 500);
                    }
                }, 500);
            }
            
        } else {
            // ❌ BUKAN ADMIN - Segera Hapus!
            await cleanupUnauthorizedUser(user, 'Not in admin list');
        }
    } catch (error) {
        // ❌ ERROR (Misal Permission Denied) - Anggap tidak berhak & Hapus!
        console.error('Error checking admin access:', error);
        
        // PENTING: Jangan biarkan user masuk jika terjadi error saat pengecekan
        await cleanupUnauthorizedUser(user, 'Error during check: ' + error.message);
    } finally {
        isCheckingAdminAccess = false;
    }
}

// Show Google Sign In - LANGSUNG LOGIN TANPA MODAL
function showGoogleSignIn() {
    if (isSigningIn) {
        console.log('Sign-in already in progress...');
        return;
    }
    
    isSigningIn = true;
    console.log('Starting direct Google sign-in...');
    
    // SET FLAG BAHWA INI ADALAH ACTION LOGIN DARI TOMBOL
    sessionStorage.setItem('loginAction', 'true');
    
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
            console.log('Signed in successfully:', result.user.email);
            isSigningIn = false;
            // Auth state listener akan handle sisanya (termasuk redirect ke admin panel jika perlu)
        })
        .catch((error) => {
            console.error('Error signing in:', error);
            isSigningIn = false;
            
            // Hapus flag jika login gagal
            sessionStorage.removeItem('loginAction');
            
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
    sessionStorage.removeItem('loginAction');
    
    auth.signOut().then(() => {
        console.log('Signed out successfully');
        currentUser = null;
        updateNavbar(false);
        showNotification('Signed out successfully', 'info');
        
        // [FIX BUG 17 - Sign Out Redirect]
        // Jika di admin page, redirect ke homepage setelah sign out
        // Menggunakan includes('admin') agar mencakup 'admin.html' maupun '/admin'
        if (window.location.pathname.includes('admin')) {
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
            <div class="flex-grow-1 d-flex align-items-center gap-2">
                ${message} 
            </div>
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