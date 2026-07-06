// -----------------------------------------------------------
// Cards.js
// Renders the shape-card list on grade landing pages (K4.html,
// and Grade56.html in the future). Depends on SHAPES /
// getShapeTexture from shapes-data.js.
// -----------------------------------------------------------

/**
 * Placeholder for the future "read the shape name aloud" feature.
 * Intentionally does nothing yet — wiring up a text-to-speech / audio
 * reader is a separate task. Keeping this as its own named function
 * means that future work only has to touch one place.
 */
function handleVoiceButtonClick(event, shape) {
    event.stopPropagation(); // don't let the click also expand/collapse the card
    // TODO: hook up a reader (e.g. SpeechSynthesis or a recorded clip) here.
}

function buildShapeCard(shape, grade) {
    const card = document.createElement('div');
    card.className = 'shape-card';
    card.dataset.slug = shape.slug;

    card.innerHTML = `
        <button class="shape-card-header" aria-expanded="false">
            <span class="shape-card-swatch" style="background:${shape.color}"></span>
            <span class="shape-card-name">${shape.name}</span>
            <span class="voice-button" role="button" tabindex="0" aria-label="Hear the shape name">🔊</span>
            <span class="shape-card-chevron">&#9662;</span>
        </button>
        <div class="shape-card-body">
            <p class="shape-card-hint">Tap below to see ${shape.name.toLowerCase()} up close.</p>
            <div class="shape-card-actions">
                <a class="card-action-button ar-button" href="Explore.html?grade=${grade}&shape=${shape.slug}">
                    View in AR
                </a>
                <a class="card-action-button learn-button" href="Lesson.html?grade=${grade}&shape=${shape.slug}">
                    Learn
                </a>
            </div>
        </div>
    `;

    const header = card.querySelector('.shape-card-header');
    const voiceButton = card.querySelector('.voice-button');

    header.addEventListener('click', () => {
        const isExpanded = card.classList.toggle('expanded');
        header.setAttribute('aria-expanded', String(isExpanded));
    });

    voiceButton.addEventListener('click', (event) => handleVoiceButtonClick(event, shape));
    voiceButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleVoiceButtonClick(event, shape);
        }
    });

    return card;
}

function renderShapeCards(containerId, grade) {
    const container = document.getElementById(containerId);
    if (!container) return; // not on a page with a card list

    container.innerHTML = '';
    SHAPES.forEach(shape => {
        container.appendChild(buildShapeCard(shape, grade));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderShapeCards('shape-card-list', document.body.dataset.grade || 'k4');
});