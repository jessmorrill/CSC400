// -----------------------------------------------------------
// lessons-data.js
// Kid-friendly explanations for each shape's lesson page.
// Keyed by the same `slug` used in shapes-data.js.
// -----------------------------------------------------------

const LESSONS = {
    cone: {
        tagline: 'One pointy tip, one round bottom!',
        explanationk4: [
            'A cone has a flat, round bottom called a base, and it comes up to a single pointy tip called an apex.',
            'If you rolled a cone on the ground, it would roll in a big circle instead of a straight line, because one end is bigger than the other.'
        ],
        explanation56: [
            'A cone is a three-dimensional shape with a circular base that comes to a singular point at the top.', 
            'It has one corner, or vertex. It has two faces: one flat circular face and one curved face that wraps around the outside.',
            'It has a singular edge, which is the curved line where the flat base meets the curved surface.',
            'Unwrapping a cone into a flat shape gives one circle and one sector, or piece, of a circle.',
            'Can you imagine folding a flat piece of paper into a cone shape? If you have ever unfolded a party hat, you have seen how the shape can be flattened into a net.',
            'A cone can be found in many places in the real world, like ice cream cones, traffic cones, and candy corn!',
            'A cone cannot roll in a straight line because of its curved surface. Instead, it rolls in a circle.',
        ]
    },
    sphere: {
        explanationk4: [
            'A sphere is perfectly round, like a ball. Every point on the outside is exactly the same distance from the middle.',
            'A sphere has no flat parts, no edges, and no corners at all, which is why it can roll smoothly in any direction.'
        ],
        explanation56: [
            'A sphere is a three-dimensional shape that is perfectly round. Every point on the surface of a sphere is the same distance from the center.',
            'A sphere has no edges, no corners, and a single face. If you cut a sphere in half, you would see a flat circular cross-section',
            'Unlike other shapes, a sphere cannot be unwrapped into a flat shape. This is because a sphere is a single curved surface. Unwrapping it would make you cut it into pieces, which would change its shape.',
            'Spheres can be found in many places in the real world, like basketballs, marbles, and globes.',
            'A sphere can roll in any direction, unlike other shapes that have flat sides and edges. This makes it perfect for playing sports! Can you imagine trying to play soccer with a cone? It would be very difficult to score a goal!'
        ]
    },
    cube: {
        explanationk4: [
            'A cube is made of 6 flat square faces that are all exactly the same size.',
            'It also has 8 corners (called vertices) and 12 straight edges where the squares meet.'
        ],
        explanation56: [
            'A cube is a three-dimensional shape that has six flat square faces, twelve straight edges, and eight corners, or vertices.',
            'A cube is a special kind of rectangular prism. All of its faces are squares, which means all its edges are the exact same length.',
            'Unwrapping a cube gives six connected squares. Each of a square\'s faces look the same!',
            'Cubes can be found in many places in the real world, like a birthday present or dice!'
        ]
    },
    cylinder: {
        explanationk4: [
            'A cylinder has two flat, round faces, one on top and one on the bottom, that are exactly the same size.',
            'A curved surface wraps around the middle and connects the two circles together.'
        ],
        explanation56: [
            'A cylinder is a three-dimensional shape that has two flat circular bases that are connected by a curved face.',
            'A cylinder has three faces, two edges, and no corners.',
            'If you unwrapped a cylinder, you would see two circles and one rectangle. If you take a piece of paper and roll it into a tube, you can see a cylinder shape!',
            'You can roll a cylinder down a hill on its curved face.'
        ]
    },
    pyramid: {
        explanationk4: [
            'A pyramid has a flat base on the bottom, usually a square, and flat triangle-shaped sides.',
            'All of the triangle sides lean inward and meet together at one point at the very top.'
        ],
        explanation56: [
            'A pyramid has a flat square base and four triangular faces that meet at a single point at the top.',
            'A pyramid has five faces, eight edges, and five corners, or vertices.',
            'If you unwrapped a pyramid, you would see one square and four triangles. The four triangles are all the same size and shape. If they were different, they couldn\'t meet at a single point at the top!',
            'The pyramid we learn about is a special kind, called a square pyramid. There are other kinds of pyramids, like triangular pyramids, that have different shapes for their bases.',
            'The most famous pyramids are the pyramids in Egypt!'
        ]
    },

    prism: {
        explanationk4: [
            'A triangular prism has two matching triangle ends, one on each side.',
            'Three flat rectangle faces connect the two triangles together, like the walls and roof of a tent.'
        ],
        explanation56: [
            'A triangular prism has two triangular bases and three rectangular faces that connect the bases together.',
            'A triangular prism is different from a pyramid because it has two triangle bases instead of a single square.',
            'If you cut a triangular prism in half horizontally, you will see a rectangular cross-section. If you cut it in half vertically, you will see a triangular cross-section!',
            'If you unfold a triangular prism into a flat shape, you will see its three rectangle faces and two triangle bases.',
            'An example of a triangular prism in the real world is a tent! The two triangle bases are the front and back of the tent, and the three rectangle sides are the walls and roof.',
            'Though we might think of the base of a shape as its bottom, this is not always the case! Bases are the flat faces that the shape gets its name from, and they can be on the top, bottom, or even the sides of a shape.'
        ]
    },

    rectangularPrism: {
        explanationk4: [
            'A rectangular prism looks like a box. It has six rectangle sides.',
            'It has flat ends that let it stand up without rolling.'
        ],
        explanation56: [
            'A rectangular prism is made up of 6 rectangular prisms. It has 12 edges and 8 corners.',
            'A rectangular prism has two matching rectangular bases and four rectangle faces that connect them!',
            'The opposite faces of a rectangular prism are always the same size and shape. The opposite faces are parallel to each other, which means they will never touch or cross each other.',
            'If you cut a rectangular prism in half, you will see a rectangle cross-section.',
            'A special kind of rectangular prism is called a cube. This is when its edges are all the exact same length.',
        ]
    }
};

function getLessonBySlug(slug) {
    return LESSONS[slug] || null;
}