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
            
            // Reset semua dropdown saat logout
            setTimeout(() => {
                if (window.resetAllDropdowns) {
                    window.resetAllDropdowns();
                }
            }, 100);
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
    
    // Reset dropdowns
    setTimeout(() => {
        if (window.resetAllDropdowns) {
            window.resetAllDropdowns();
        }
    }, 100);
}

// Handle user signed in
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
            
            // --- BAGIAN BARU: SINKRONISASI NAVBAR ---
            // Memanggil fungsi dari navbar.js untuk update foto & nama dari database
            if (window.updateNavbarProfile) {
                window.updateNavbarProfile(user); 
            }
            // ---------------------------------------
            
            updateNavbar(true);

            // Tambah status online ke user di Firestore (opsional)
            try {
                await db.collection('users').doc(user.email).set({
                    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'online'
                }, { merge: true });
            } catch (error) {
                console.log('Note: Could not update user status:', error.message);
            }
            
            const isFromLoginAction = sessionStorage.getItem('loginAction') === 'true';
            const isOnAdminPage = window.location.pathname.includes('admin');
            
            // 1. LOGIKA NOTIFIKASI & REDIRECT
            if (isFromLoginAction) {
                showNotification('Login successful!', 'success');
                sessionStorage.removeItem('loginAction'); 
                
                // Redirect ke admin jika belum di sana
                if (!isOnAdminPage) {
                    setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
                }
            }
            
            // 2. LOGIKA MEMUAT PANEL ADMIN
            if (isOnAdminPage) {
                setTimeout(() => {
                    if (typeof showAdminPanel === 'function') {
                        showAdminPanel(user);
                    } else {
                        setTimeout(() => showAdminPanel(user), 500);
                    }
                }, 500);
            }
            
            // 3. Reset dropdowns setelah login berhasil
            setTimeout(() => {
                if (window.resetAllDropdowns) {
                    window.resetAllDropdowns();
                    console.log('✅ Dropdowns reset after login');
                }
            }, 300);
            
        } else {
            // ❌ BUKAN ADMIN
            await cleanupUnauthorizedUser(user, 'Not in admin list');
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
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
            
            // Reset dropdowns
            if (window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
            
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
    console.log('🔄 Updating navbar login state:', isLoggedIn);
    
    const loginNavItem = document.getElementById('login-nav-item');
    const adminNavItem = document.getElementById('admin-nav-item');
    
    if (loginNavItem && adminNavItem) {
        if (isLoggedIn) {
            loginNavItem.classList.add('d-none');
            adminNavItem.classList.remove('d-none');
            
            // Re-initialize dropdowns setelah login
            setTimeout(() => {
                if (window.setupDropdowns) {
                    window.setupDropdowns();
                }
                if (window.resetAllDropdowns) {
                    window.resetAllDropdowns();
                }
                console.log('✅ Dropdowns re-initialized after login');
            }, 200);
        } else {
            loginNavItem.classList.remove('d-none');
            adminNavItem.classList.add('d-none');
            resetNavbarProfile();
            
            // Reset dropdowns
            if (window.resetAllDropdowns) {
                window.resetAllDropdowns();
            }
        }
    }
}

// Sign out function - COMPATIBLE VERSION (tetap sync, tapi handle async update)
function signOut() {
    console.log('🚪 Signing out...');
    
    // Clear session storage
    sessionStorage.removeItem('welcomeShown');
    sessionStorage.removeItem('loginAction');
    
    // ---- TAMBAHAN: Update status user ke offline ----
    // Gunakan Promise tanpa await agar tidak mengubah flow
    if (currentUser && currentUser.email) {
        db.collection('users').doc(currentUser.email).set({
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'offline'
        }, { merge: true })
        .then(() => {
            console.log('✅ User status updated to offline');
        })
        .catch((error) => {
            console.log('Note: Could not update logout status:', error.message);
        });
    }
    // ---- AKHIR TAMBAHAN ----
    
    // Reset dropdowns sebelum sign out
    if (window.resetAllDropdowns) {
        window.resetAllDropdowns();
        console.log('✅ Dropdowns reset before sign out');
    }
    
    // LOGOUT PROSES UTAMA (tetap sama persis)
    auth.signOut().then(() => {
        console.log('Signed out successfully');
        currentUser = null;
        updateNavbar(false);
        showNotification('Signed out successfully', 'info');
        
        // [FIX BUG 17 - Sign Out Redirect]
        if (window.location.pathname.includes('admin')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
        
        // Force reset navbar profile
        setTimeout(() => {
            if (window.resetNavbarProfile) {
                const resetNavbarProfile = window.resetNavbarProfile;
                if (typeof resetNavbarProfile === 'function') {
                    resetNavbarProfile();
                }
            }
        }, 200);
        
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

// Reset navbar profile ke default
function resetNavbarProfile() {
    console.log('🔄 Resetting navbar profile...');
    
    const navImgBtn = document.getElementById('nav-profile-img-btn');
    const navImgInside = document.getElementById('nav-profile-img-inside');
    const navUsername = document.getElementById('nav-gh-username');
    const navFullname = document.getElementById('nav-gh-fullname');
    const navStatus = document.getElementById('nav-user-status');

    const defaultPhoto = 'https://ui-avatars.com/api/?name=User&background=6f42c1&color=fff';
    
    if (navImgBtn) navImgBtn.src = defaultPhoto;
    if (navImgInside) navImgInside.src = defaultPhoto;
    
    if (navFullname) navFullname.textContent = 'Guest';
    if (navUsername) navUsername.textContent = 'User';
    
    if (navStatus) {
        navStatus.innerHTML = '<i class="bi bi-circle-fill me-1"></i> Offline';
        navStatus.className = 'gh-status text-secondary small mt-1';
    }
    
    // Reset dropdowns
    setTimeout(() => {
        if (window.resetAllDropdowns) {
            window.resetAllDropdowns();
        }
    }, 100);
}

// Helper function untuk reset semua dropdown (backward compatibility)
function resetAuthDropdowns() {
    console.log('🔄 Resetting auth dropdowns...');
    
    // Close semua dropdown menu
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach(menu => {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
            menu.style.display = 'none';
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
        }
    });
    
    // Reset semua dropdown toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('active');
    });
    
    // Dispatch event untuk navbar reset
    document.dispatchEvent(new CustomEvent('auth:dropdowns:reset'));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Auth system initializing...');
    
    // Reset dropdowns saat load
    setTimeout(() => {
        resetAuthDropdowns();
        
        // Juga reset menggunakan fungsi dari navbar.js jika ada
        if (window.resetAllDropdowns) {
            window.resetAllDropdowns();
        }
    }, 100);
    
    initAuthSystem();
    
    // Tambah event listener untuk reset dropdowns
    document.addEventListener('auth:state:changed', function() {
        setTimeout(() => {
            resetAuthDropdowns();
        }, 50);
    });
});

// Export functions for global access
window.showGoogleSignIn = showGoogleSignIn;
window.signOut = signOut;
window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.updateNavbar = updateNavbar;
window.resetNavbarProfile = resetNavbarProfile;
window.resetAuthDropdowns = resetAuthDropdowns;

// Backward compatibility dengan fungsi yang mungkin dipanggil dari file lain
if (!window.resetAllDropdowns) {
    window.resetAllDropdowns = resetAuthDropdowns;
}