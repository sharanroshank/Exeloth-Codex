// assets/js/games.js

// --- DATA GAMES ---
// Catatan: Idealnya data ini diambil dari Firebase di masa depan
const publicGamesData = [
    { id: 1, title: "Arknights: Endfield", category: "Coming Soon", desc: "3D Real-time Strategy RPG", date: "2025-01-01", img: "assets/img/games/wuthering-waves.jpg" },
    { id: 2, title: "Wuthering Waves", category: "New Release", desc: "Open-world Action RPG", date: "2024-05-22", img: "assets/img/games/wuthering-waves.jpg"},
    { id: 3, title: "Reverse: 1999", category: "Ongoing", desc: "Time-travel Strategic RPG", date: "2023-10-26", img: "assets/img/games/wuthering-waves.jpg"},
    { id: 4, title: "Genshin Impact", category: "Ongoing", desc: "Open-world Adventure", date: "2020-09-28", img: "assets/img/games/wuthering-waves.jpg" },
    { id: 5, title: "Honkai: Star Rail", category: "Ongoing", desc: "Space Fantasy RPG", date: "2023-04-26", img: "assets/img/games/wuthering-waves.jpg" },
    { id: 6, title: "Zenless Zone Zero", category: "Coming Soon", desc: "Urban Fantasy Action", date: "2024-07-04", img: "assets/img/games/wuthering-waves.jpg" },
];

let publicCurrentPage = 1;
const publicItemsPerPage = 3; 
let publicFilteredData = [...publicGamesData];

document.addEventListener('DOMContentLoaded', () => {
    renderPublicGames();
    
    const searchInput = document.getElementById('publicSearchName');
    const categoryFilter = document.getElementById('publicFilterCategory');
    const dateFilter = document.getElementById('publicFilterDate');

    if(searchInput) searchInput.addEventListener('input', applyPublicFilters);
    if(categoryFilter) categoryFilter.addEventListener('change', applyPublicFilters);
    if(dateFilter) dateFilter.addEventListener('change', applyPublicFilters);
});

function applyPublicFilters() {
    const searchInput = document.getElementById('publicSearchName');
    const categoryFilter = document.getElementById('publicFilterCategory');
    const dateFilter = document.getElementById('publicFilterDate');

    if (!searchInput || !categoryFilter || !dateFilter) return;

    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const date = dateFilter.value;

    publicFilteredData = publicGamesData.filter(game => {
        const matchName = game.title.toLowerCase().includes(search);
        const matchCategory = category === 'all' || game.category === category;
        const matchDate = !date || game.date === date;
        return matchName && matchCategory && matchDate;
    });
    publicCurrentPage = 1;
    renderPublicGames();
}

function resetPublicFilters() {
    const searchInput = document.getElementById('publicSearchName');
    const categoryFilter = document.getElementById('publicFilterCategory');
    const dateFilter = document.getElementById('publicFilterDate');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (dateFilter) dateFilter.value = '';
    
    applyPublicFilters();
}

function renderPublicGames() {
    const container = document.getElementById('publicGamesContainer');
    if (!container) return;

    container.innerHTML = '';
    const startIndex = (publicCurrentPage - 1) * publicItemsPerPage;
    const endIndex = startIndex + publicItemsPerPage;
    const gamesToShow = publicFilteredData.slice(startIndex, endIndex);

    if (gamesToShow.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5"><i class="bi bi-emoji-frown display-4 mb-3 d-block"></i><h5>Tidak ada game yang cocok.</h5></div>`;
        renderPublicPagination(0);
        return;
    }

    gamesToShow.forEach(game => {
        let badgeClass = 'bg-secondary';
        if (game.category === 'New Release') badgeClass = 'bg-success';
        if (game.category === 'Ongoing') badgeClass = 'bg-info text-dark';
        if (game.category === 'Coming Soon') badgeClass = 'bg-warning text-dark';
        if (game.category === 'Ended') badgeClass = 'bg-danger';
        
        // Membuat slug yang aman untuk URL
        const slug = game.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const html = `
            <div class="col-md-6 col-lg-4 mb-4">
                <a href="game.html?slug=${slug}" class="card-game-link hover-scale text-decoration-none">
                    <div class="card-game-overlay-container rounded-4 overflow-hidden position-relative shadow-lg">
                        <div class="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2" style="z-index: 10;">
                            <span class="badge ${badgeClass} rounded-pill px-3 py-2 shadow-sm border border-light border-opacity-25">${game.category}</span>
                            <div class="px-3 py-1 rounded-pill text-white shadow-sm" style="background: rgba(0,0,0,0.6); font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.2);"><i class="bi bi-calendar-event me-1"></i> ${game.date}</div>
                        </div>
                        <img src="${game.img}" class="w-100 h-100 object-fit-cover" alt="${game.title}" style="height: 250px; filter: brightness(0.5); transition: filter 0.3s ease;">
                        <div class="card-overlay-text position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
                            <h3 class="text-white fw-bold fst-italic mb-1" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9); letter-spacing: 1px;">${game.title}</h3>
                            <p class="text-light small mb-0 d-none d-md-block fw-light" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8); opacity: 0.9;">${game.desc}</p>
                        </div>
                    </div>
                </a>
            </div>`;
        container.innerHTML += html;
    });
    renderPublicPagination(Math.ceil(publicFilteredData.length / publicItemsPerPage));
}

function renderPublicPagination(totalPages) {
    const container = document.getElementById('publicPaginationContainer');
    if (!container) return;

    container.innerHTML = '';
    if (totalPages <= 1) return;
    
    const prevDisabled = publicCurrentPage === 1 ? 'disabled' : '';
    // Perhatikan: href="#" dihilangkan atau event handler diperbaiki agar tidak jump ke atas jika tidak perlu
    // Tapi karena ada scrollIntoView di changePublicPage, efek jump sudah ditangani.
    
    container.innerHTML += `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" onclick="changePublicPage(${publicCurrentPage - 1}); return false;">&laquo;</a></li>`;
    
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === publicCurrentPage ? 'active' : '';
        container.innerHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="changePublicPage(${i}); return false;">${i}</a></li>`;
    }
    
    const nextDisabled = publicCurrentPage === totalPages ? 'disabled' : '';
    container.innerHTML += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" onclick="changePublicPage(${publicCurrentPage + 1}); return false;">&raquo;</a></li>`;
}

function changePublicPage(page) {
    // Hitung total halaman saat ini berdasarkan data yang difilter
    const totalPages = Math.ceil(publicFilteredData.length / publicItemsPerPage);

    if (page < 1 || (totalPages > 0 && page > totalPages)) return;
    
    publicCurrentPage = page;
    renderPublicGames();
    
    const container = document.getElementById('publicGamesContainer');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}