document.addEventListener('DOMContentLoaded', () => {
    const tinderCards = document.querySelector('.tinder-cards');
    const likeButton = document.querySelector('.tinder-button.like');
    const nopeButton = document.querySelector('.tinder-button.nope');
    const superlikeButton = document.querySelector('.tinder-button.superlike');
    let currentCardIndex = 0;

    function createCard(project) {
        const card = document.createElement('div');
        card.className = 'tinder-card';
        card.innerHTML = `
            <img src="${project.images[0]}" alt="${project.title}" class="card-photo">
            <div class="card-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
            <div class="emoji-overlay like">❤️</div>
            <div class="emoji-overlay nope">❌</div>
            <div class="emoji-overlay superlike">⭐</div>
        `;
        return card;
    }

    function loadNextCard() {
        if (currentCardIndex < projectsData.length) {
            const card = createCard(projectsData[currentCardIndex]);
            tinderCards.appendChild(card);
            currentCardIndex++;
            initializeCard(card);
        }
    }

    function initializeCard(card) {

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    // Gestion du drag & drop
    card.addEventListener('mousedown', startDragging);
    card.addEventListener('mousemove', drag);
    card.addEventListener('mouseup', stopDragging);
    card.addEventListener('mouseleave', stopDragging);

    // Support tactile
    card.addEventListener('touchstart', (e) => {
        startDragging(e.touches[0]);
    });
    card.addEventListener('touchmove', (e) => {
        e.preventDefault();
        drag(e.touches[0]);
    });
    card.addEventListener('touchend', stopDragging);

    // Boutons d'action
    likeButton.addEventListener('click', () => {
        const currentCard = document.querySelector('.tinder-card');
        if (currentCard) swipeCard(currentCard, 'right');
    });
    nopeButton.addEventListener('click', () => {
        const currentCard = document.querySelector('.tinder-card');
        if (currentCard) swipeCard(currentCard, 'left');
    });
    superlikeButton.addEventListener('click', () => {
        const currentCard = document.querySelector('.tinder-card');
        if (currentCard) swipeCard(currentCard, 'up');
    });

    // Charger la première carte
    loadNextCard();

    function startDragging(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        card.style.transition = '';
    }

    function drag(e) {
        if (!isDragging) return;

        currentX = e.clientX;
        currentY = e.clientY;

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const rotation = deltaX * 0.1;

        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;

        // Affichage des emojis en fonction du swipe
        const likeOverlay = card.querySelector('.emoji-overlay.like');
        const nopeOverlay = card.querySelector('.emoji-overlay.nope');
        const superlikeOverlay = card.querySelector('.emoji-overlay.superlike');

        if (deltaX > 50) {
            likeOverlay.style.opacity = Math.min(deltaX / 100, 1);
            likeOverlay.style.transform = `translate(-50%, -50%) scale(${Math.min(deltaX / 100, 1)})`;
        } else if (deltaX < -50) {
            nopeOverlay.style.opacity = Math.min(-deltaX / 100, 1);
            nopeOverlay.style.transform = `translate(-50%, -50%) scale(${Math.min(-deltaX / 100, 1)})`;
        } else if (deltaY < -50) {
            superlikeOverlay.style.opacity = Math.min(-deltaY / 100, 1);
            superlikeOverlay.style.transform = `translate(-50%, -50%) scale(${Math.min(-deltaY / 100, 1)})`;
        }
    }

    function stopDragging() {
        if (!isDragging) return;

        isDragging = false;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > 100) {
            swipeCard(deltaX > 0 ? 'right' : 'left');
        } else if (absDeltaY > 100 && deltaY < 0) {
            swipeCard('up');
        } else {
            resetCard();
        }
    }

    function swipeCard(card, direction) {
        const rotation = direction === 'left' ? -30 : direction === 'right' ? 30 : 0;
        const translateX = direction === 'left' ? -150 : direction === 'right' ? 150 : 0;
        const translateY = direction === 'up' ? -150 : 0;

        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `translate(${translateX}%, ${translateY}%) rotate(${rotation}deg)`;

        const overlay = card.querySelector(`.emoji-overlay.${direction === 'right' ? 'like' : direction === 'left' ? 'nope' : 'superlike'}`);
        overlay.style.opacity = '1';
        overlay.style.transform = 'translate(-50%, -50%) scale(1)';

        setTimeout(() => {
            card.remove();
            loadNextCard();
        }, 500);
    }

    function resetCard() {
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = '';

        // Réinitialiser les emojis
        const overlays = card.querySelectorAll('.emoji-overlay');
        overlays.forEach(overlay => {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translate(-50%, -50%) scale(0)';
        });
    }
});