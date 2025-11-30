// assets/js/admin.js - V3 (Final Fix & Clean)

let adminPanelInitialized = false;
let allGamesData = []; 
let currentPage = 1;
const itemsPerPage = 5;

// --- 1. INITIALIZATION ---
function initAdminPanel() {
    if (adminPanelInitialized) return;
    adminPanelInitialized = true;
    
    console.log('🚀 Initializing admin panel V3...');
    
    // Setup Form Listeners
    const gameForm = document.getElementById('game-form');
    if(gameForm) gameForm.addEventListener('submit', handleGameSubmitV2);
    
    const chapterForm = document.getElementById('chapter-form');
    if(chapterForm) chapterForm.addEventListener('submit', handleChapterSubmit);
    
    // Auto-generate slug
    const gameTitleInput = document.getElementById('game-title');
    if (gameTitleInput) {
        gameTitleInput.addEventListener('input', function() {
            if (!document.getElementById('edit-game-id').value) { 
                document.getElementById('game-slug').value = generateSlug(this.value);
            }
        });
    }

    // Filter Listeners
    document.getElementById('search-game')?.addEventListener('input', () => { currentPage = 1; renderTable(); });
    document.getElementById('filter-status')?.addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.getElementById('sort-game')?.addEventListener('change', () => { renderTable(); });

    // Preview Image Listeners
    setupImagePreview('game-thumbnail', 'preview-thumbnail', 'txt-thumbnail');
    setupImagePreview('game-logo', 'preview-logo', 'txt-logo');
    setupImagePreview('game-bg', 'preview-bg', 'txt-bg');
}

function showAdminPanel(user) {
    const adminSection = document.getElementById('admin-panel-section');
    if (adminSection) adminSection.classList.remove('d-none');
    
    // Load Data
    updateGoogleUI(user);
    updateUserInfo(user);
    loadAdminList();
    loadSections(); 
    loadGameSlugs(); 
    loadGamesTable(); 
}

// --- 2. USER PROFILE LOGIC (UPDATED) ---

// Variabel Global untuk OTP
let pendingAction = null; 
let pendingData = null;   
let generatedOTP = null;
let otpTimer = null;
const RESEND_DELAY = 60;

// A. Update Tampilan User (Fix Bug Badge Google)
async function updateUserInfo(user) {
    if (!user) return;

    const nameInput = document.getElementById('settings-name');
    const usernameInput = document.getElementById('settings-username');
    const emailInput = document.getElementById('settings-email');
    const imgProfile = document.getElementById('settings-profile-img');
    
    // Status Elements
    const statusContainer = document.getElementById('email-status-container');
    const btnVerify = document.getElementById('btn-verify-email');
    const passStatusText = document.getElementById('password-status-text');
    const btnPass = document.getElementById('btn-change-password');

    // Reset UI
    if(emailInput) emailInput.value = user.email;
    updateGoogleUI(user);

    // Cek Provider Login
    const isPassword = user.providerData.some(p => p.providerId === 'password');
    
    // Atur Status Password
    if (isPassword) {
        passStatusText.textContent = "Password aktif.";
        passStatusText.className = "text-success small"; 
        btnPass.textContent = "Ubah Password";
        btnPass.className = "btn btn-sm btn-outline-light";
    } else {
        passStatusText.textContent = "Login via Google (Tanpa Password).";
        passStatusText.className = "text-white-50 small";
        btnPass.textContent = "Buat Password";
        btnPass.className = "btn btn-sm btn-primary";
    }

    try {
        // Ambil Data Firestore
        const userDoc = await db.collection('users').doc(user.email).get();
        let isVerified = user.emailVerified; 

        if (userDoc.exists) {
            const data = userDoc.data();
            nameInput.value = data.displayName || user.displayName;
            usernameInput.value = data.username || user.email.split('@')[0];
            imgProfile.src = data.photoURL || user.photoURL;
            
            if (data.emailVerified === true) isVerified = true;
        } else {
            // User Baru
            nameInput.value = user.displayName || '';
            usernameInput.value = user.email.split('@')[0]; 
            imgProfile.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
        }

        // Update UI Verifikasi (Ikon Bagus)
        if (isVerified) {
            statusContainer.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> <span class="text-success fw-bold">Terverifikasi</span>';
            if(btnVerify) btnVerify.classList.add('d-none');
        } else {
            statusContainer.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning"></i> <span class="text-warning fw-bold">Belum Terverifikasi</span>';
            if(btnVerify) btnVerify.classList.remove('d-none');
        }

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// B. Simpan Profil (Upload Foto & Firestore)
async function saveProfileChanges() {
    const btn = document.querySelector('#profile-form button[type="submit"]');
    const originalText = btn.innerHTML;
    
    const name = document.getElementById('settings-name').value.trim();
    const username = document.getElementById('settings-username').value.trim().toLowerCase();
    const email = auth.currentUser.email;
    const fileInput = document.getElementById('file-upload-profile');
    
    // Validasi Username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        document.getElementById('username-error').textContent = "Username hanya huruf, angka, _";
        document.getElementById('username-error').classList.remove('d-none');
        return;
    }
    document.getElementById('username-error').classList.add('d-none');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';

    try {
        let photoURL = document.getElementById('settings-profile-img').src;

        if (fileInput && fileInput.files && fileInput.files[0]) {
            showNotification('Mengupload foto...', 'info');
            photoURL = await uploadProfileImage(fileInput.files[0]);
        }

        // Update Firestore
        await db.collection('users').doc(email).set({
            displayName: name,
            username: username,
            email: email,
            photoURL: photoURL,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Update Auth Profile
        await auth.currentUser.updateProfile({ 
            displayName: name,
            photoURL: photoURL
        });

        // Update Navbar
        const navImg = document.getElementById('nav-profile-img-btn');
        const navImgInside = document.getElementById('nav-profile-img-inside');
        const navName = document.getElementById('nav-gh-username'); 
        if (navImg) navImg.src = photoURL;
        if (navImgInside) navImgInside.src = photoURL;
        if (navName) navName.textContent = username;

        showNotification('✅ Profil berhasil disimpan!', 'success');

    } catch (error) {
        console.error(error);
        showNotification('❌ Gagal: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- 3. OTP & SECURITY LOGIC (Change Email/Pass) ---

function openChangeModal(type) {
    const modal = new bootstrap.Modal(document.getElementById('securityModal'));
    const title = document.getElementById('securityModalTitle');
    const step1 = document.getElementById('step-input-data');
    const step2 = document.getElementById('step-verify-otp');
    
    // Reset State
    step1.classList.remove('d-none');
    step2.classList.add('d-none');
    document.getElementById('input-group-email').classList.add('d-none');
    document.getElementById('input-group-password').classList.add('d-none');
    document.getElementById('new-email-input').value = '';
    document.getElementById('new-pass-input').value = '';
    document.getElementById('confirm-pass-input').value = '';
    
    if (type === 'email') {
        title.innerHTML = '<i class="bi bi-envelope-arrow-up"></i> Ganti Email';
        document.getElementById('input-group-email').classList.remove('d-none');
        pendingAction = 'change_email';
    } else if (type === 'password') {
        title.innerHTML = '<i class="bi bi-key"></i> Setup / Ubah Password';
        document.getElementById('input-group-password').classList.remove('d-none');
        pendingAction = 'change_password';
    }

    modal.show();
}

function initiateAction(type) {
    if (type === 'verify_email') {
        pendingAction = 'verify_email';
        pendingData = auth.currentUser.email;
        sendOtpAndShowModal(auth.currentUser.email);
    }
}

function requestOtpForAction() {
    const emailErr = document.getElementById('email-error');
    const passErr = document.getElementById('pass-error');
    emailErr.textContent = '';
    passErr.textContent = '';

    let targetEmail = auth.currentUser.email; 

    if (pendingAction === 'change_email') {
        const newEmail = document.getElementById('new-email-input').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            emailErr.textContent = "Format email tidak valid.";
            return;
        }
        pendingData = newEmail;
        targetEmail = newEmail; // OTP dikirim ke email BARU
    } 
    else if (pendingAction === 'change_password') {
        const p1 = document.getElementById('new-pass-input').value;
        const p2 = document.getElementById('confirm-pass-input').value;
        
        if (p1.length < 6) {
            passErr.textContent = "Minimal 6 karakter.";
            return;
        }
        if (p1 !== p2) {
            passErr.textContent = "Password tidak cocok.";
            return;
        }
        pendingData = p1;
    }

    document.getElementById('step-input-data').classList.add('d-none');
    document.getElementById('step-verify-otp').classList.remove('d-none');
    
    sendOtpAndShowModal(targetEmail);
}

function sendOtpAndShowModal(emailDest) {
    const modalEl = document.getElementById('securityModal');
    if (!modalEl.classList.contains('show')) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        document.getElementById('step-input-data').classList.add('d-none');
        document.getElementById('step-verify-otp').classList.remove('d-none');
    }

    document.getElementById('otp-target-email').textContent = emailDest;
    document.getElementById('modal-otp-input').value = '';
    document.getElementById('modal-otp-input').focus();
    
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (window.emailjs && window.ENV_CONFIG) {
        const params = {
            to_email: emailDest,
            to_name: auth.currentUser.displayName || 'User',
            otp_code: generatedOTP
        };
        // Masukkan ID EmailJS Anda di sini
        const SID = 'service_1jjn6mq'; 
        const TID = 'template_4a1wgog'; 
        
        emailjs.send(SID, TID, params)
            .then(() => showNotification(`Kode terkirim ke ${emailDest}`, 'success'))
            .catch(err => console.error(err));
    } else {
        console.log(`[SIMULASI] OTP: ${generatedOTP}`);
        showNotification('Mode Simulasi: Cek Console', 'info');
    }

    startOtpTimer();
}

async function verifyOtpAndCommit() {
    const inputOtp = document.getElementById('modal-otp-input').value;
    const msg = document.getElementById('otp-status-msg');

    if (inputOtp !== generatedOTP) {
        msg.innerHTML = '<span class="text-danger fw-bold"><i class="bi bi-x-circle"></i> Kode Salah</span>';
        return;
    }

    msg.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-check-circle"></i> Terverifikasi</span>';
    const modal = bootstrap.Modal.getInstance(document.getElementById('securityModal'));
    
    try {
        if (pendingAction === 'verify_email') {
            // Update Firestore: Email Verified
            await db.collection('users').doc(auth.currentUser.email).update({
                emailVerified: true
            });
            showNotification('✅ Email berhasil diverifikasi!', 'success');
            
        } else if (pendingAction === 'change_email') {
            // Change Email Logic (Fix Re-Auth)
            try {
                await auth.currentUser.updateEmail(pendingData);
                
                // Pindahkan data Firestore ke ID baru
                const oldDoc = await db.collection('users').doc(auth.currentUser.email).get();
                let userData = {};
                if(oldDoc.exists) userData = oldDoc.data();
                
                // Update data
                userData.email = pendingData;
                userData.emailVerified = true; 
                userData.displayName = document.getElementById('settings-name').value;
                userData.username = document.getElementById('settings-username').value;
                userData.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();

                await db.collection('users').doc(pendingData).set(userData);
                
                showNotification('✅ Email diubah! Login ulang...', 'success');
                setTimeout(() => location.reload(), 2000);

            } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    alert('Keamanan: Mohon Logout dan Login kembali untuk mengganti email.');
                    await auth.signOut();
                    location.reload();
                } else {
                    throw error;
                }
            }

        } else if (pendingAction === 'change_password') {
            try {
                await auth.currentUser.updatePassword(pendingData);
                showNotification('✅ Password berhasil diubah!', 'success');
            } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    alert('Keamanan: Mohon Logout dan Login kembali untuk ganti password.');
                    await auth.signOut();
                    location.reload();
                } else {
                    throw error;
                }
            }
        }

        modal.hide();
        if (pendingAction !== 'change_email') updateUserInfo(auth.currentUser);

    } catch (error) {
        console.error(error);
        showNotification('Gagal: ' + error.message, 'error');
        modal.hide();
    }
}

function startOtpTimer() {
    let timeLeft = RESEND_DELAY;
    const timerDisplay = document.getElementById('modal-timer');
    if (otpTimer) clearInterval(otpTimer);
    
    timerDisplay.textContent = `Resend in ${timeLeft}s`;
    
    otpTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Resend in ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            timerDisplay.innerHTML = '<a href="#" class="text-warning" onclick="requestOtpForAction()">Kirim Ulang</a>';
        }
    }, 1000);
}

// --- 4. GOOGLE UI & HELPERS ---

function updateGoogleUI(user) {
    const nameEl = document.getElementById('g-conn-name');
    const emailEl = document.getElementById('g-conn-email');
    const statusText = document.getElementById('g-conn-text');
    const statusIcon = document.getElementById('g-conn-icon');
    const statusBadge = document.getElementById('g-conn-status-badge');
    const hoverText = document.getElementById('g-hover-text');

    if (user) {
        nameEl.textContent = user.displayName || 'User';
        emailEl.textContent = user.email;
        emailEl.style.display = 'block';

        statusText.textContent = 'Terhubung';
        statusBadge.className = 'd-flex align-items-center gap-2 text-success fw-bold';
        statusIcon.className = 'bi bi-link-45deg fs-5';
        if(hoverText) hoverText.textContent = "Putuskan Sambungan";
    } else {
        nameEl.textContent = 'Tidak terhubung';
        emailEl.style.display = 'none';

        statusText.textContent = 'Terputus';
        statusBadge.className = 'd-flex align-items-center gap-2 text-secondary fw-bold';
        statusIcon.className = 'bi bi-slash-circle fs-5';
        if(hoverText) hoverText.textContent = "Hubungkan Akun";
    }
}

async function handleGoogleConnection() {
    if (currentUser) {
        if (confirm('Putuskan sambungan? Anda akan logout.')) {
            await auth.signOut();
            updateGoogleUI(null); 
            showNotification('Logout berhasil.', 'info');
        }
    } else {
        showNotification('Mengalihkan ke Login...', 'info');
        if (typeof showGoogleSignIn === 'function') showGoogleSignIn();
    }
}

// Helpers Image & Slug
window.previewImage = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('settings-profile-img').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function uploadProfileImage(file) {
    if (!file) return null;
    const fileName = `profile-images/${currentUser.uid}-${Date.now()}.jpg`;
    const storageRef = storage.ref().child(fileName);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
}

function generateSlug(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// Globals
window.showAdminPanel = showAdminPanel;
window.changePage = changePage;
window.editGame = editGame;
window.deleteGame = deleteGame;
window.resetForm = resetForm;
window.toggleComingSoon = toggleComingSoon;
window.addSection = addSection;
window.deleteSection = deleteSection;
window.addAdmin = addAdmin;