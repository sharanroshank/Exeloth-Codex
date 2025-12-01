// assets/js/app.js - VERSION WITH FALLBACK SYSTEM

// ==================== 1. LOAD GAMES (UNTUK HOMEPAGE) ====================
function loadGames() {
    db.collection("games").orderBy("popularity", "desc").get()
        .then((querySnapshot) => {
            const gamesContainer = document.getElementById("games-container");
            const footerGamesList = document.getElementById("footer-games-list");
            
            gamesContainer.innerHTML = '';
            footerGamesList.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const game = doc.data();
                game.id = doc.id;
                
                // Create game card for popular games section
                const gameCard = document.createElement('div');
                gameCard.className = 'col-md-6 col-lg-4 mb-4';
                gameCard.innerHTML = `
                    <div class="card game-card bg-dark h-100">
                        <img src="${game.thumbnailURL}" class="card-img-top" alt="${game.title}">
                        <div class="card-body">
                            <h5 class="card-title">${game.title}</h5>
                            <p class="card-text">${game.description}</p>
                            <a href="game.html?slug=${game.slug}" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                `;
                gamesContainer.appendChild(gameCard);
                
                // Add game to footer list
                const footerGameItem = document.createElement('div');
                footerGameItem.className = 'col-6 col-md-4 mb-2';
                footerGameItem.innerHTML = `<a href="game.html?slug=${game.slug}" class="text-decoration-none">${game.title}</a>`;
                footerGamesList.appendChild(footerGameItem);
            });
        })
        .catch((error) => {
            console.error("Error loading games: ", error);
        });
}

// ==================== 2. LOAD GAME PROFILE (DENGAN FALLBACK) ====================
function loadGameProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameSlug = urlParams.get('slug');
    
    console.log('🔄 Loading game with slug:', gameSlug);
    
    if (!gameSlug) {
        console.log('⚠️ No slug found, showing default game');
        showStaticGame('wuthering-waves');
        return;
    }
    
    // Coba load dari Firestore
    if (typeof db !== 'undefined') {
        db.collection("games").where("slug", "==", gameSlug).get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    console.log('⚠️ Game not found in Firestore, using static fallback');
                    showStaticGame(gameSlug);
                    return;
                }
                
                const gameDoc = querySnapshot.docs[0];
                const game = gameDoc.data();
                game.id = gameDoc.id;
                
                console.log('✅ Game loaded from Firestore:', game.title);
                renderGameProfile(game);
            })
            .catch((error) => {
                console.error("❌ Error loading from Firestore:", error);
                console.log('🔄 Using static fallback due to error');
                showStaticGame(gameSlug);
            });
    } else {
        console.log('⚠️ Firestore not available, using static fallback');
        showStaticGame(gameSlug);
    }
}

// ==================== 3. STATIC GAMES DATA (FALLBACK) ====================
function showStaticGame(gameSlug) {
    console.log('🔄 Showing static game for slug:', gameSlug);
    
    // Data statis untuk fallback
    const staticGames = {
        'wuthering-waves': {
            title: "Wuthering Waves",
            description: "Wuthering Waves adalah game aksi open-world dengan sistem pertarungan berbasis resonansi. Jelajahi dunia pasca-apokaliptik yang luas, temukan misteri di balik bencana 'Lament', dan bangun hubungan dengan Resonator lain.",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg",
            logoURL: "assets/img/games/logo-wuthering-waves.jpg",
            status: "New Release",
            releaseDate: "22 Mei 2024",
            slug: "wuthering-waves",
            includes: ['main_story', 'character_story', 'side_story'],
            sections: {
                main_story: [
                    { 
                        title: "Prologue: The Awakening", 
                        content: `
                            <h4>Prologue: The Awakening</h4>
                            <p>Matahari terbit di atas reruntuhan kota tua, memancarkan cahaya keemasan melalui celah-celah bangunan yang telah hancur. Kamu terbaring di atas puing-puing, tubuh terasa berat dan pikiran berkabut.</p>
                            <p>Suara gemerisik membuatmu terbangun sepenuhnya. Seekor makhluk aneh dengan tubuh transparan dan mata merah mendekat. Insting bertahan hidup membuatmu berdiri, dan tanpa sadar tanganmu memancarkan energi resonansi.</p>
                            <p>"Kamu akhirnya bangun," suara perempuan terdengar dari balik pilar. Seorang perempuan dengan pakaian putih muncul, matanya memancarkan kekhawatiran. "Aku Rover. Dan kamu... kamu Resonator baru."</p>
                            <p>Dunia di sekitarmu perlahan mulai masuk ke dalam ingatanmu. Ini adalah era pasca-Lament, sebuah bencana yang mengubah segalanya. Kamu memiliki kekuatan resonansi, kemampuan langka yang bisa berinteraksi dengan gelombang suara dunia.</p>
                            <div class="mt-4 p-3 bg-dark rounded">
                                <small><i class="bi bi-info-circle me-1"></i> <strong>Lore Note:</strong> Lament adalah peristiwa besar yang mengubah struktur dunia, menyebabkan munculnya Tacet Discord dan energi resonansi tidak stabil.</small>
                            </div>
                        `
                    },
                    { 
                        title: "Chapter 1: Echoes of Huanglong", 
                        content: `
                            <h4>Chapter 1: Echoes of Huanglong</h4>
                            <p>Kota Huanglong berdiri megah di tengah dataran tinggi, arsitekturnya memadukan teknologi canggih dengan estetika tradisional. Rover membawamu melalui gerbang kota, menjelaskan bahwa Huanglong adalah salah satu dari sedikit tempat yang relatif aman setelah Lament.</p>
                            <p>"Di sini kamu bisa belajar mengendalikan resonansimu," kata Rover sambil menunjuk menara tinggi di tengah kota. "Itu Menara Bel, tempat para Resonator berlatih."</p>
                            <p>Pertemuan dengan Jiyan, komandan Pengawal Huanglong, membuka mata tentang situasi yang sebenarnya. Dunia masih penuh dengan Tacet Discord, makhluk yang lahir dari energi resonansi yang tidak stabil.</p>
                            <p>"Lament bukan hanya bencana," ujar Jiyan dengan suara serius. "Itu adalah perubahan mendasar pada alam semesta kita. Gelombang suara yang biasa sekarang membawa kekuatan dan bahaya."</p>
                            <div class="mt-4 p-3 bg-dark rounded">
                                <small><i class="bi bi-geo-alt me-1"></i> <strong>Location:</strong> Huanglong - Kota benteng utama yang selamat dari Lament, menjadi pusat perlindungan bagi para Resonator.</small>
                            </div>
                        `
                    },
                    { 
                        title: "Chapter 2: Whispers of the Past", 
                        content: `
                            <h4>Chapter 2: Whispers of the Past</h4>
                            <p>Reruntuhan peradaban lama menyimpan banyak rahasia. Bersama Rover, kamu menjelajahi situs arkeologi di pinggiran Huanglong. Tablet-tablet kuno yang ditemukan menceritakan kisah tentang "Era Resonansi", zaman ketika manusia pertama kali menemukan kekuatan gelombang suara.</p>
                            <p>"Mereka bukan hanya menggunakannya," teriak Rover dari balik tumpukan batu. "Mereka menyatu dengan resonansi!"</p>
                            <p>Penemuan itu mengubah segalanya. Lament bukan bencana alami, melainkan akibat dari eksperimen yang melampaui batas. Peradaban lama mencoba menguasai resonansi sempurna, dan dunia membayar harganya.</p>
                            <p>Di kedalaman reruntuhan, kamu menemukan ruang tersembunyi dengan perangkat yang masih aktif. Saat menyentuhnya, ingatan-ingatan asing membanjiri pikiranmu. Kamu melihat wajah-wajah dari masa lalu, mendengar suara yang sudah lama hilang.</p>
                        `
                    }
                ],
                character_story: [
                    { 
                        title: "Jiyan: Sang Pengawal", 
                        content: `
                            <h4>Jiyan: Sang Pengawal</h4>
                            <p>Jiyan adalah komandan Pengawal Huanglong yang terkenal dengan dedikasinya yang tak tergoyahkan. Di balik ketegasannya, tersimpan luka mendalam dari masa lalu.</p>
                            <p>"Aku kehilangan segalanya saat Lament," katanya suatu malam di menara pengawas. "Keluargaku, teman-temanku... semua tersapu oleh gelombang resonansi."</p>
                            <p>Janjinya untuk melindungi Huanglong bukan hanya tugas, melainkan penebusan dosa. Setiap nyawa yang dia selamatkan adalah pengampunan untuk yang tidak bisa dia lindungi.</p>
                            <p>Hubungannya dengan Rover kompleks. Mereka pernah bertarung di sisi yang berseberangan sebelum Lament, tetapi kini dipersatukan oleh misi yang sama: melindungi sisa-sisa kemanusiaan.</p>
                        `
                    },
                    { 
                        title: "Rover: Penuntun Misterius", 
                        content: `
                            <h4>Rover: Penuntun Misterius</h4>
                            <p>Rover muncul seperti hantu, tanpa masa lalu yang jelas. Dia mengenal dunia pasca-Lament lebih baik daripada siapa pun, tetapi jarang membicarakan dari mana pengetahuannya berasal.</p>
                            <p>"Aku hanya penuntun," katanya selalu. "Tujuanmu lebih penting daripada ceritaku."</p>
                            <p>Meski selalu membantu, ada jarak yang dia jaga. Matanya kadang memandang jauh, seolah mengingat sesuatu—atau seseorang—yang telah lama hilang.</p>
                            <p>Kemampuan resonansinya berbeda dengan Resonator lain. Dia bisa "mendengar" sejarah sebuah tempat, merasakan gema peristiwa masa lalu yang tertinggal di gelombang suara.</p>
                        `
                    }
                ]
            }
        },
        'reverse-1999': {
            title: "Reverse: 1999",
            description: "Game time-travel strategic RPG dengan cerita misterius di tahun 1999. Jelajahi misteri di balik 'The Storm' yang mengancam keberadaan waktu itu sendiri.",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg",
            logoURL: "assets/img/games/logo-wuthering-waves.jpg",
            status: "Ongoing",
            releaseDate: "26 Oktober 2023",
            slug: "reverse-1999",
            includes: ['main_story', 'event_story'],
            sections: {
                main_story: [
                    { 
                        title: "The Storm of 1999", 
                        content: "Sebuah badai misterius menghapus tahun 1999 dari sejarah. Sebagai Timekeeper, kamu harus memulihkan waktu yang hilang..." 
                    }
                ]
            }
        },
        'honkai-star-rail': {
            title: "Honkai: Star Rail",
            description: "Space fantasy RPG dengan cerita epik di antara bintang-bintang. Bergabunglah dengan Astral Express dalam perjalanan melintasi galaksi.",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg",
            logoURL: "assets/img/games/logo-wuthering-waves.jpg",
            status: "Ongoing",
            releaseDate: "26 April 2023",
            slug: "honkai-star-rail",
            includes: ['main_story', 'character_story'],
            sections: {
                main_story: [
                    { 
                        title: "Journey to the Stars", 
                        content: "Memulai perjalanan dengan Astral Express untuk mengungkap misteri Stellaron..." 
                    }
                ]
            }
        },
        'genshin-impact': {
            title: "Genshin Impact",
            description: "Open-world action RPG di dunia Teyvat yang penuh misteri. Jelajahi tujuh negara dan cari saudaramu yang hilang.",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg",
            logoURL: "assets/img/games/logo-wuthering-waves.jpg",
            status: "Ongoing",
            releaseDate: "28 September 2020",
            slug: "genshin-impact"
        },
        'zenless-zone-zero': {
            title: "Zenless Zone Zero",
            description: "Urban fantasy action game dengan setting metropolitan futuristik. Hadapi ancaman Hollows di kota New Eridu.",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg",
            logoURL: "assets/img/games/logo-wuthering-waves.jpg",
            status: "Coming Soon",
            releaseDate: "2024",
            slug: "zenless-zone-zero"
        }
    };
    
    // Gunakan game yang sesuai atau default ke wuthering-waves
    const gameData = staticGames[gameSlug] || staticGames['wuthering-waves'];
    renderGameProfile(gameData);
}

// ==================== 4. RENDER GAME PROFILE ====================
function renderGameProfile(game) {
    console.log('🎨 Rendering game:', game.title);
    
    // Update page title
    document.title = `${game.title} - Exeloth Codex`;
    
    // Render game profile
    const gameProfileContainer = document.getElementById('game-profile-container');
    if (gameProfileContainer) {
        gameProfileContainer.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${game.thumbnailURL || 'assets/img/games/wuthering-waves.jpg'}" 
                         class="img-fluid rounded shadow-lg" 
                         alt="${game.title}"
                         style="max-height: 300px; object-fit: cover;"
                         onerror="this.src='https://placehold.co/400x300/1a1d20/ffffff?text=${encodeURIComponent(game.title)}'">
                </div>
                <div class="col-md-8">
                    <h1 class="display-5 fw-bold text-white mb-3">${game.title}</h1>
                    <p class="lead text-white-50">${game.description}</p>
                    <div class="mb-4">
                        <span class="badge bg-${game.status === 'New Release' ? 'success' : game.status === 'Coming Soon' ? 'warning' : 'info'} fs-6 px-3 py-2 me-2">
                            ${game.status || 'Available'}
                        </span>
                        <span class="badge bg-secondary fs-6 px-3 py-2">
                            <i class="bi bi-calendar-event me-1"></i> ${game.releaseDate || 'TBA'}
                        </span>
                    </div>
                    
                    <!-- Story Sections Badges -->
                    ${game.includes && game.includes.length > 0 ? `
                    <div class="mt-4">
                        <h5 class="text-white mb-2">Story Sections Included:</h5>
                        ${game.includes.includes('main_story') ? '<span class="badge-section">📘 Main Story</span>' : ''}
                        ${game.includes.includes('character_story') ? '<span class="badge-section">👤 Character Story</span>' : ''}
                        ${game.includes.includes('side_story') ? '<span class="badge-section">🌿 Side Story</span>' : ''}
                        ${game.includes.includes('event_story') ? '<span class="badge-section">🎉 Event Story</span>' : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Render story sections jika ada
    const storySectionsContainer = document.getElementById('story-sections-container');
    if (storySectionsContainer) {
        if (game.sections) {
            let storySectionsHTML = '';
            
            if (game.sections.main_story && game.sections.main_story.length > 0) {
                storySectionsHTML += renderStorySection('main_story', '📘 Main Story', game.sections.main_story);
            }
            
            if (game.sections.character_story && game.sections.character_story.length > 0) {
                storySectionsHTML += renderStorySection('character_story', '👤 Character Story', game.sections.character_story);
            }
            
            if (game.sections.side_story && game.sections.side_story.length > 0) {
                storySectionsHTML += renderStorySection('side_story', '🌿 Side Story', game.sections.side_story);
            }
            
            if (game.sections.event_story && game.sections.event_story.length > 0) {
                storySectionsHTML += renderStorySection('event_story', '🎉 Event Story', game.sections.event_story);
            }
            
            storySectionsContainer.innerHTML = storySectionsHTML;
            
            // Add event listeners to chapter items
            document.querySelectorAll('.chapter-item').forEach(item => {
                item.addEventListener('click', function() {
                    const chapterTitle = this.getAttribute('data-title');
                    const chapterContent = this.getAttribute('data-content');
                    
                    document.getElementById('chapterModalTitle').textContent = chapterTitle;
                    document.getElementById('chapterModalContent').innerHTML = `
                        <div class="story-content">
                            ${chapterContent}
                            <div class="mt-4 pt-3 border-top border-secondary">
                                <small class="text-white-50"><i class="bi bi-info-circle me-1"></i> Bagian dari: ${game.title}</small>
                            </div>
                        </div>
                    `;
                    
                    const chapterModal = new bootstrap.Modal(document.getElementById('chapterModal'));
                    chapterModal.show();
                });
            });
        } else {
            storySectionsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Cerita untuk game ini akan segera tersedia. Kembali lagi nanti!
                </div>
            `;
        }
    }
    
    // Update game logo jika ada
    const gameLogo = document.querySelector('img[alt="Game Logo"]');
    if (gameLogo && game.logoURL) {
        gameLogo.src = game.logoURL;
        gameLogo.alt = `${game.title} Logo`;
        gameLogo.onerror = function() {
            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(game.title)}&background=6f42c1&color=fff`;
        };
    }
    
    // Update URL untuk konsistensi
    if (window.history && game.slug) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('slug', game.slug);
        window.history.replaceState({}, '', newUrl);
    }
    
    console.log('✅ Game rendered successfully');
}

// ==================== 5. RENDER STORY SECTION ====================
function renderStorySection(sectionId, sectionTitle, chapters) {
    let html = `
        <div class="story-section">
            <h3 class="mb-4 text-white">${sectionTitle}</h3>
            <div class="row">
    `;
    
    chapters.forEach((chapter, index) => {
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="chapter-item" 
                     data-title="${chapter.title.replace(/"/g, '&quot;')}" 
                     data-content="${chapter.content.replace(/"/g, '&quot;')}">
                    <h5 class="text-white">${chapter.title}</h5>
                    <p class="text-muted mb-0">
                        ${chapter.content.substring(0, 100)}${chapter.content.length > 100 ? '...' : ''}
                    </p>
                    <div class="mt-2">
                        <small class="text-info">Click to read</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// ==================== 6. LOAD COMING SOON (UNTUK HOMEPAGE) ====================
function loadComingSoonFrontend() {
    const container = document.getElementById('coming-soon-container');
    if (!container) return;

    // Coba load dari Firestore
    if (typeof db !== 'undefined') {
        db.collection('upcoming_games').orderBy('createdAt', 'desc').get()
            .then((snapshot) => {
                container.innerHTML = '';

                if (snapshot.empty) {
                    // Fallback ke data statis
                    showStaticComingSoon();
                    return;
                }

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    
                    // Format Tanggal (Jika ada)
                    const dateText = data.releaseDate ? data.releaseDate : 'TBA';

                    const col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4 mb-4';
                    col.innerHTML = `
                        <div class="card-game-overlay-container rounded-4 overflow-hidden position-relative shadow-lg" style="cursor: default;">
                            
                            <div class="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2" style="z-index: 10;">
                                <span class="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm border border-light border-opacity-25">
                                    Coming Soon
                                </span>
                                <div class="px-3 py-1 rounded-pill text-white shadow-sm" 
                                     style="background: rgba(0,0,0,0.6); font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.2);">
                                    <i class="bi bi-calendar-event me-1"></i> ${dateText}
                                </div>
                            </div>

                            <img src="${data.thumbnailURL || 'assets/img/games/wuthering-waves.jpg'}" 
                                 class="w-100 h-100 object-fit-cover" 
                                 alt="${data.title}" 
                                 style="height: 250px; filter: brightness(0.6);"
                                 onerror="this.src='https://placehold.co/400x250/2c3035/ffffff?text=${encodeURIComponent(data.title)}'">
                            
                            <div class="card-overlay-text position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
                                <h3 class="text-white fw-bold fst-italic mb-1">${data.title}</h3>
                            </div>
                        </div>
                    `;
                    container.appendChild(col);
                });
            })
            .catch((error) => {
                console.error("Error loading frontend upcoming:", error);
                showStaticComingSoon();
            });
    } else {
        showStaticComingSoon();
    }
}

// ==================== 7. STATIC COMING SOON DATA ====================
function showStaticComingSoon() {
    const container = document.getElementById('coming-soon-container');
    if (!container) return;
    
    const staticComingSoon = [
        {
            title: "Zenless Zone Zero",
            releaseDate: "Q3 2024",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg"
        },
        {
            title: "Arknights: Endfield",
            releaseDate: "2025",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg"
        },
        {
            title: "Project Mugen",
            releaseDate: "TBA",
            thumbnailURL: "assets/img/games/wuthering-waves.jpg"
        }
    ];
    
    container.innerHTML = '';
    
    staticComingSoon.forEach(game => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card-game-overlay-container rounded-4 overflow-hidden position-relative shadow-lg" style="cursor: default;">
                
                <div class="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2" style="z-index: 10;">
                    <span class="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm border border-light border-opacity-25">
                        Coming Soon
                    </span>
                    <div class="px-3 py-1 rounded-pill text-white shadow-sm" 
                         style="background: rgba(0,0,0,0.6); font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.2);">
                        <i class="bi bi-calendar-event me-1"></i> ${game.releaseDate}
                    </div>
                </div>

                <img src="${game.thumbnailURL}" 
                     class="w-100 h-100 object-fit-cover" 
                     alt="${game.title}" 
                     style="height: 250px; filter: brightness(0.6);"
                     onerror="this.src='https://placehold.co/400x250/2c3035/ffffff?text=${encodeURIComponent(game.title)}'">
                
                <div class="card-overlay-text position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
                    <h3 class="text-white fw-bold fst-italic mb-1">${game.title}</h3>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// ==================== 8. INITIALIZE BASED ON CURRENT PAGE ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App.js loaded, current page:', window.location.pathname);
    
    const path = window.location.pathname;
    
    // Cek apakah di halaman index/home
    if (path.endsWith('index.html') || path === '/' || path === '/index.html') {
        console.log('🏠 Homepage detected');
        
        // JANGAN PANGGIL loadGames() - biarkan tampilan statis
        // loadGames(); 
        
        // Load Coming Soon section
        if (document.getElementById('coming-soon-container')) {
            console.log('⏳ Loading coming soon section...');
            loadComingSoonFrontend();
        }
    } 
    // Cek apakah di halaman game
    else if (path.includes('game.html')) {
        console.log('🎮 Game page detected, loading game profile...');
        loadGameProfile();
    }
    // Cek apakah di halaman games (daftar)
    else if (path.includes('games.html')) {
        console.log('📋 Games list page detected');
        // Fungsi untuk games.html di-handle oleh games.js terpisah
    }
    // Cek apakah di halaman admin
    else if (path.includes('admin.html')) {
        console.log('⚙️ Admin page detected');
        // Fungsi untuk admin.html di-handle oleh admin.js terpisah
    }
});

// ==================== 9. EXPORT FUNCTIONS FOR GLOBAL USE ====================
window.loadGames = loadGames;
window.loadGameProfile = loadGameProfile;
window.loadComingSoonFrontend = loadComingSoonFrontend;
window.showStaticGame = showStaticGame;