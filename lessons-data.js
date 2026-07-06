// -----------------------------------------------------------
// lessons-data.js
// Kid-friendly explanations for each shape's lesson page.
// Keyed by the same `slug` used in shapes-data.js.
// -----------------------------------------------------------

const LESSONS = {
    cone: {
        tagline: 'One pointy tip, one round bottom!',
        explanation: [
            'A cone has a flat, round bottom called a base, and it comes up to a single pointy tip called an apex.',
            'If you rolled a cone on the ground, it would roll in a big circle instead of a straight line, because one end is bigger than the other.'
        ],
        funFact: 'A cone has just 1 flat face, 1 curved surface, and 1 pointy corner!',
        examples: ['Ice cream cone', 'Birthday party hat', 'Orange traffic cone']
    },
    sphere: {
        tagline: 'Perfectly round, every single way!',
        explanation: [
            'A sphere is perfectly round, like a ball. Every point on the outside is exactly the same distance from the middle.',
            'A sphere has no flat parts, no edges, and no corners at all, which is why it can roll smoothly in any direction.'
        ],
        funFact: 'A sphere has 0 edges and 0 corners, the only shape that has none of either!',
        examples: ['Basketball', 'Orange', 'Planet Earth']
    },
    cube: {
        tagline: 'Six matching square sides!',
        explanation: [
            'A cube is made of 6 flat square faces that are all exactly the same size.',
            'It also has 8 corners (called vertices) and 12 straight edges where the squares meet.'
        ],
        funFact: 'Every face on a cube is an identical square, no matter which side you look at!',
        examples: ['Dice', 'Ice cube', 'Gift box']
    },
    cylinder: {
        tagline: 'Two circles and one curvy side!',
        explanation: [
            'A cylinder has two flat, round faces, one on top and one on the bottom, that are exactly the same size.',
            'A curved surface wraps around the middle and connects the two circles together.'
        ],
        funFact: 'A cylinder can roll on its side but stands still on its flat circle ends!',
        examples: ['Soda can', 'Paper towel roll', 'Candle']
    },
    pyramid: {
        tagline: 'A flat base that rises to one point!',
        explanation: [
            'A pyramid has a flat base on the bottom, usually a square, and flat triangle-shaped sides.',
            'All of the triangle sides lean inward and meet together at one point at the very top.'
        ],
        funFact: 'The Great Pyramid of Giza in Egypt is thousands of years old and still standing today!',
        examples: ['Egyptian pyramid', 'Glass paperweight', 'Roof peak']
    },
    prism: {
        tagline: 'Triangle ends, rectangle sides!',
        explanation: [
            'A triangular prism has two matching triangle ends, one on each side.',
            'Three flat rectangle faces connect the two triangles together, like the walls and roof of a tent.'
        ],
        funFact: 'A triangular prism has 5 faces in total: 2 triangles and 3 rectangles!',
        examples: ['Camping tent', 'Toblerone chocolate bar', 'Doorstop wedge']
    }
};

function getLessonBySlug(slug) {
    return LESSONS[slug] || null;
}