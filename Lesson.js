// -----------------------------------------------------------
// Lesson.js
// Powers Lesson.html. Reads ?shape= (required) and ?grade=
// (optional, for the back link) from the URL, then builds a
// single shape's lesson content from SHAPES + LESSONS.
// -----------------------------------------------------------

function renderLesson() {
    const container = document.getElementById('lesson-content');
    if (!container) return; // not on the lesson page

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('shape');
    const grade = params.get('grade') || 'k4';

    const shape = getShapeBySlug(slug);
    const lesson = getLessonBySlug(slug);
    const gradeHref = grade === 'grade56' ? 'Grade56.html' : 'K4.html';

    if (!shape || !lesson) {
        container.innerHTML = `
            <div class="lesson-card">
                <p class="lesson-missing">We couldn't find that shape's lesson.</p>
                <a class="card-action-button learn-button" href="${gradeHref}">&larr; Back to Shapes</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="lesson-hero" style="background:${shape.color}">
            <h1>${shape.name}</h1>
            <p class="lesson-tagline">${lesson.tagline}</p>
        </div>
        <div class="lesson-card">
            ${lesson.explanation.map(paragraph => `<p>${paragraph}</p>`).join('')}

            <div class="lesson-fact">
                <span class="lesson-fact-label">Fun Fact</span>
                <p>${lesson.funFact}</p>
            </div>

            <h2 class="lesson-subheading">Where you'll see it</h2>
            <ul class="lesson-examples">
                ${lesson.examples.map(example => `<li>${example}</li>`).join('')}
            </ul>

            <div class="lesson-actions">
                <a class="card-action-button ar-button" href="Explore.html?grade=${grade}&shape=${shape.slug}">
                    Try it in AR
                </a>
                <a class="card-action-button learn-button" href="${gradeHref}">
                    &larr; Back to Shapes
                </a>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', renderLesson);