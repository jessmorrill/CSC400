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

    // Pick the grade-appropriate explanation. Fall back to the other
    // grade band's text (rather than nothing) if one is ever missing,
    // so a data gap never renders a blank lesson.
    const explanation =
        (grade === 'grade56' ? lesson.explanation56 : lesson.explanationk4) ||
        lesson.explanation56 ||
        lesson.explanationk4 ||
        [];


    const taglineHtml = lesson.tagline
        ? `<p class="lesson-tagline">${lesson.tagline}</p>`
        : '';

    container.innerHTML = `
        <div class="lesson-hero" style="background:${shape.color}">
            <h1>${shape.name}</h1>
            ${taglineHtml}
        </div>
        <div class="lesson-card">
            ${explanation.map(paragraph => `<p>${paragraph}</p>`).join('')}

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