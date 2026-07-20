const SHAPES = [
    {
        slug: 'cone',
        name: 'Cone',
        geometry: 'primitive: cone; radiusBottom: 0.5; radiusTop: 0; height: 1',
        color: '#e74c3c',
        textureKey: 'cone',
        textureLabel: 'Cone (Candy Corn)',
        position: '0 0.42 0',
        scale: '0.78 0.78 0.78',
        rotation: '0 0 0'
    },
    {
        slug: 'sphere',
        name: 'Sphere',
        geometry: 'primitive: sphere; radius: 0.55',
        color: '#3498db',
        textureKey: 'sphere',
        textureLabel: 'Sphere (Basketball)',
        position: '0 0.45 0',
        scale: '0.82 0.82 0.82',
        rotation: '0 0 0'
    },
    {
        slug: 'cube',
        name: 'Cube',
        geometry: 'primitive: box',
        color: '#2ecc71',
        textureKey: 'cube',
        textureLabel: 'Cube (Die)',
        texturedType: 'die',
        position: '0 0.42 0',
        scale: '0.78 0.78 0.78',
        rotation: '0 25 0'
    },
    {
        slug: 'cylinder',
        name: 'Cylinder',
        geometry: 'primitive: cylinder; radius: 0.42; height: 0.5',
        color: '#06b6d4',
        textureKey: 'cylinder',
        textureLabel: 'Cylinder (Soda Can)',
        position: '0 0.45 0',
        scale: '0.86 0.86 0.86',
        rotation: '0 0 0'
    },
    {
        slug: 'pyramid',
        name: 'Pyramid',
        geometry: 'primitive: cone; radiusBottom: 0.65; radiusTop: 0; height: 1; segmentsRadial: 4',
        color: '#f1c40f',
        textureKey: 'pyramid',
        textureLabel: 'Pyramid (Egyptian Pyramid)',
        position: '0 0.42 0',
        scale: '0.86 0.86 0.86',
        rotation: '0 45 0'
    },
    {
        slug: 'prism',
        name: 'Triangular Prism',
        geometry: 'primitive: cylinder; radius: 0.6; height: 1.15; segmentsRadial: 3',
        color: '#9b59b6',
        textureKey: 'prism',
        textureLabel: 'Triangular Prism (Tent)',
        customType: 'prism',
        texturedType: 'tent',
        position: '0 0 0',
        scale: '0.9 0.9 0.9',
        rotation: '0 -20 0'
    }
];

const TEXTURE_URLS = {
    cone: 'textures/candy-corn-wrap.svg',
    sphere: 'textures/sphere.png',
    cube: 'textures/die-1.svg',
    cylinder: 'textures/soda.png',
    pyramid: 'textures/pyramid.jpg',
    prism: 'textures/tent-clipart.svg'
};

const textureCache = {};

function getShapeTexture(key) {
    if (textureCache[key]) return textureCache[key];
    const url = TEXTURE_URLS[key] || TEXTURE_URLS.cone;
    textureCache[key] = url;
    return url;
}

function getShapeBySlug(slug) {
    return SHAPES.find(shape => shape.slug === slug) || null;
}

const NET_TEXTURE_URLS = {
    cube: 'textures/cube-net.svg',
    pyramid: 'textures/pyramid-net.svg',
    prism: 'textures/prism-net.svg',
    cone: 'textures/cone-net.svg',
    cylinder: 'textures/cylinder-net.svg'
};

const netTextureCache = {};

function getNetTexture(slug) {
    if (slug === 'sphere') return null;
    if (netTextureCache[slug]) return netTextureCache[slug];
    const url = NET_TEXTURE_URLS[slug];
    if (!url) return null;
    netTextureCache[slug] = url;
    return url;
}