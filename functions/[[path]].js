// functions/[[path]].js
import nunjucks from 'nunjucks';

// TEMPLATE DEFINITIONS (Dicopy dari file .njk Anda agar bisa jalan di Edge)
const TEMPLATES = {
  'base.njk': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Exeloth Codex{% endblock %}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
        <a class="navbar-brand fw-bold text-uppercase" href="/">Exeloth Codex</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto gap-lg-3">
                <li class="nav-item"><a class="nav-link" href="/"><i class="bi bi-house-door-fill me-1"></i> Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#coming-soon"><i class="bi bi-hourglass-split me-1"></i> Coming Soon</a></li>
                <li class="nav-item"><a class="nav-link" href="https://saweria.co" target="_blank"><i class="bi bi-gift-fill me-1"></i> Saweria</a></li>
                <li class="nav-item" id="login-nav-item"><a class="nav-link" href="#" id="login-link" onclick="showGoogleSignIn()"><i class="bi bi-person-fill me-1"></i> Login</a></li>
                <li class="nav-item d-none" id="admin-nav-item"><a class="nav-link" href="/admin.html"><i class="bi bi-speedometer2 me-1"></i> Admin Panel</a></li>
            </ul>
        </div>
    </div>
    </nav>
    {% block content %}{% endblock %}
    <footer class="bg-darker py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>Games</h5>
                    <div class="row">
                        {% for game in games %}
                        <div class="col-6 col-md-4 mb-2"><a href="/game/{{ game.slug }}" class="text-decoration-none">{{ game.title }}</a></div>
                        {% endfor %}
                    </div>
                </div>
                <div class="col-md-6 text-md-end"><p class="mb-0 text-muted">© Exeloth Codex — community guides for gacha fans</p></div>
            </div>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="assets/js/firebase-config.js"></script>
    <script src="assets/js/auth-system.js"></script>
    {% block scripts %}{% endblock %}
</body>
</html>`,

  'home.njk': `
{% extends "base.njk" %}
{% block title %}Exeloth Codex - Tempat membaca cerita game favoritmu{% endblock %}
{% block content %}
<section class="hero-section d-flex align-items-center">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 pt-5">
                <h1 class="display-4 fw-bold text-white mb-4">Tempat untuk membaca cerita game-game favoritmu</h1>
                <p class="lead text-light mb-5">Exeloth Codex adalah website yang menyediakan cerita dari game seperti Honkai Star Rail, Reverse 1999, Wuthering Waves!</p>
                <a href="#codex-list" class="btn btn-primary btn-lg rounded-pill px-5 py-2 hover-scale"><i class="bi bi-book-half me-2"></i> Mulai Baca</a>
            </div>
        </div>
    </div>
</section>
<section id="codex-list" class="py-5 bg-darker">
    <div class="container py-4">
        <div class="text-center mb-5"><h2 class="fw-bold text-white"><i class="bi bi-journal-bookmark-fill me-2"></i> Codex</h2></div>
        <div class="row justify-content-center">
            {% for game in games %}
            <div class="col-md-6 col-lg-4 mb-4">
                <a href="/game/{{ game.slug }}" class="card-game-link hover-scale">
                    <div class="card-game-overlay-container rounded-4 overflow-hidden position-relative shadow-lg">
                        <img src="{{ game.thumbnailURL }}" class="w-100 h-100 object-fit-cover" alt="{{ game.title }}" style="height: 250px; filter: brightness(0.6);">
                        <div class="card-overlay-text position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
                            <h3 class="text-white fw-bold fst-italic mb-1">{{ game.title }}</h3>
                            {% if game.description %}<p class="text-light small mb-0 d-none d-md-block">{{ game.description }}</p>{% endif %}
                        </div>
                    </div>
                </a>
            </div>
            {% endfor %}
        </div>
    </div>
</section>
{% endblock %}`,

  'game.njk': `
{% extends "base.njk" %}
{% block title %}{{ game.title }} - Exeloth Codex{% endblock %}
{% block content %}
<section class="py-5 mt-5">
    <div class="container">
        <div class="row">
            <div class="col-md-4"><img src="{{ game.thumbnailURL }}" class="img-fluid rounded" alt="{{ game.title }}"></div>
            <div class="col-md-8">
                <h1 class="display-5 fw-bold">{{ game.title }}</h1>
                <p class="lead">{{ game.description }}</p>
                <div class="mb-4">
                    <h5>Story Sections Included:</h5>
                    {% if 'main_story' in game.includes %}<span class="badge-section">📘 Main Story</span>{% endif %}
                    {% if 'character_story' in game.includes %}<span class="badge-section">👤 Character Story</span>{% endif %}
                    {% if 'side_story' in game.includes %}<span class="badge-section">🌿 Side Story</span>{% endif %}
                    {% if 'event_story' in game.includes %}<span class="badge-section">🎉 Event Story</span>{% endif %}
                </div>
            </div>
        </div>
    </div>
</section>
<section class="py-5 bg-dark">
    <div class="container">
        <div id="story-sections-container">
            {% if sections.main_story %}
            <div class="story-section">
                <h3 class="mb-4">📘 Main Story</h3>
                <div class="row">
                    {% for chapter in sections.main_story %}
                    <div class="col-md-6 col-lg-4 mb-3">
                       <div class="chapter-item" data-bs-toggle="modal" data-bs-target="#chapterModal" 
                             data-title="{{ chapter.title }}" data-content="{{ chapter.content }}">
                            <h5>{{ chapter.title }}</h5>
                            <p class="text-muted mb-0">Click to read</p>
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </div>
            {% endif %}
        </div>
    </div>
</section>
<div class="modal fade" id="chapterModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content bg-dark">
            <div class="modal-header">
                <h5 class="modal-title" id="chapterModalTitle">Chapter Title</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="chapterModalContent"></div>
        </div>
    </div>
</div>
{% endblock %}
{% block scripts %}
<script>
document.addEventListener('DOMContentLoaded', function() {
    const chapterModal = document.getElementById('chapterModal');
    if (chapterModal) {
        chapterModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const title = button.getAttribute('data-title');
            const content = button.getAttribute('data-content');
            document.getElementById('chapterModalTitle').textContent = title;
            document.getElementById('chapterModalContent').innerHTML = content;
        });
    }
});
</script>
{% endblock %}`
};

// Custom Loader untuk Nunjucks
const WebLoader = nunjucks.Loader.extend({
    getSource: function(name) {
        if (TEMPLATES[name]) {
            return { src: TEMPLATES[name], path: name, noCache: false };
        }
        throw new Error("Template not found: " + name);
    }
});

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Jika request adalah file statis (assets, js, css), biarkan Cloudflare menangani
  if (path.startsWith('/assets/') || path.includes('.') || path === '/admin.html') {
    return context.next();
  }

  const env = new nunjucks.Environment(new WebLoader(), { autoescape: true });

  try {
    let html = '';
    
    // Route: Game Profile (/game/slug)
    if (path.startsWith('/game/')) {
      const slug = path.split('/').pop();
      // Mock data dasar, detailnya akan diload oleh app.js via Firebase di client side
      const templateData = {
        game: {
          title: 'Loading...',
          slug: slug,
          description: '',
          thumbnailURL: '', 
          includes: []
        },
        sections: {}
      };
      html = env.render('game.njk', templateData);
    } 
    // Route: Home (/)
    else if (path === '/' || path === '/index.html') {
       const templateData = {
        games: [
          {
            title: 'Wuthering Waves', 
            slug: 'wuthering-waves',
            description: 'Open-world action RPG', 
            thumbnailURL: '/assets/img/games/wuthering-waves.jpg'
          }
        ]
      };
      html = env.render('home.njk', templateData);
    } else {
       // Halaman tidak ditemukan, biarkan Cloudflare handle (biasanya 404)
       return context.next();
    }

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    return new Response('Error rendering: ' + error.message, { status: 500 });
  }
}