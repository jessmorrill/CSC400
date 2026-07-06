const NAV_LINKS = [
    { label: 'Home', href: 'Index.html', page: 'home', icon: '🏠' },
    { label: 'K-4', href: 'K4.html', page: 'k4', icon: '🔷' },
    { label: '5-6', href: 'Grade56.html', page: 'grade56', icon: '📐' },
    { label: 'Marker', href: 'Printmarker.html', page: 'print-marker', icon: '🖨️' }
];

function renderNavbar() {
    const container = document.getElementById('navbar');
    if (!container) return;

    const currentPage = document.body.dataset.page || '';

    container.innerHTML = NAV_LINKS.map(link => {
        const activeClass = link.page === currentPage ? ' class="active"' : '';
        return `<a href="${link.href}"${activeClass}><span class="nav-icon">${link.icon}</span><span class="nav-label">${link.label}</span></a>`;
    }).join('');
}

// NOTE: shape data (SHAPES, getShapeTexture, getShapeBySlug) now lives in
// shapes-data.js, which must be loaded before this file.

let currentShapeIndex = 0;
let textureMode = false;
let arLayerObserver = null;
let customArComponentsRegistered = false;

function getArConfig() {
    const viewportWidth = Math.max(
        window.innerWidth || 320,
        document.documentElement.clientWidth || 320,
        screen.width || 320
    );
    const viewportHeight = Math.max(
        window.innerHeight || 240,
        document.documentElement.clientHeight || 240,
        screen.height || 240
    );
    const sourceWidth = 640;
    const sourceHeight = 480;

    return `sourceType: webcam; sourceWidth: ${sourceWidth}; sourceHeight: ${sourceHeight}; displayWidth: ${viewportWidth}; displayHeight: ${viewportHeight}; debugUIEnabled: false; detectionMode: mono; trackingMethod: best; maxDetectionRate: 30;`;
}

function syncArLayers() {
    const container = document.getElementById('ar-container');
    const scene = document.getElementById('ar-scene');
    const video = document.querySelector('#arjs-video, video');
    const viewportWidthValue = Math.ceil(window.visualViewport?.width || window.innerWidth || screen.width);
    const viewportHeightValue = Math.ceil(window.visualViewport?.height || window.innerHeight || screen.height);
    const viewportWidth = `${viewportWidthValue}px`;
    const viewportHeight = `${viewportHeightValue}px`;
    const setImportant = (el, property, value) => {
        el.style.setProperty(property, value, 'important');
    };
    if (!container) return false;

    document.body.classList.add('ar-body');

    if (scene) {
        setImportant(scene, 'position', 'fixed');
        setImportant(scene, 'inset', '0');
        setImportant(scene, 'width', viewportWidth);
        setImportant(scene, 'height', viewportHeight);
        setImportant(scene, 'min-width', viewportWidth);
        setImportant(scene, 'min-height', viewportHeight);
        setImportant(scene, 'z-index', '1');
        setImportant(scene, 'background', 'transparent');

        if (scene.renderer) {
            scene.renderer.setSize(viewportWidthValue, viewportHeightValue, false);
        }

        if (scene && scene.resize) {
            scene.resize();
        }
    }

    if (video) {
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('autoplay', '');
        video.muted = true;
        video.id = video.id || 'arjs-video';
        video.classList.add('ar-video');

        setImportant(video, 'position', 'fixed');
        setImportant(video, 'inset', '0');
        setImportant(video, 'width', '100%');
        setImportant(video, 'height', '100%');
        setImportant(video, 'object-fit', 'contain');
        setImportant(video, 'object-position', 'center center');
        setImportant(video, 'transform', 'none');
        setImportant(video, 'z-index', '0');
        setImportant(video, 'display', 'block');
        setImportant(video, 'opacity', '1');
        setImportant(video, 'pointer-events', 'none');
    }
    return true;
}

function startArLayerObserver() {
    if (arLayerObserver) return;

    arLayerObserver = new MutationObserver(() => {
        syncArLayers();
    });
    arLayerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}
function registerCustomArComponents() {
    if (customArComponentsRegistered || typeof AFRAME === 'undefined' || typeof THREE === 'undefined') return;
    customArComponentsRegistered = true;

    AFRAME.registerComponent('die-cube', {
        init: function () {
            const loader = new THREE.TextureLoader();
            const material = (src) => new THREE.MeshStandardMaterial({
                map: loader.load(src),
                roughness: 0.7,
                metalness: 0,
                flatShading: true
            });

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const cube = new THREE.Mesh(geometry, [
                material('textures/die-2.svg'),
                material('textures/die-5.svg'),
                material('textures/die-3.svg'),
                material('textures/die-4.svg'),
                material('textures/die-1.svg'),
                material('textures/die-6.svg')
            ]);
            const group = new THREE.Group();
            group.add(cube);
            group.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geometry),
                new THREE.LineBasicMaterial({ color: '#1c1f27', transparent: true, opacity: 0.42 })
            ));
            this.el.setObject3D('mesh', group);
        },
        remove: function () {
            this.el.removeObject3D('mesh');
        }
    });

    function addEdges(group, mesh, color = '#3b215a') {
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(mesh.geometry),
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })
        );
        edges.position.copy(mesh.position);
        edges.rotation.copy(mesh.rotation);
        edges.scale.copy(mesh.scale);
        group.add(edges);
    }

    function buildPrismGroup(options = {}) {
        const group = new THREE.Group();
        const length = options.length || 1.65;
        const halfLength = length / 2;
        const halfBase = options.halfBase || 0.52;
        const height = options.height || 0.82;
        const edgeColor = options.edgeColor || '#3b215a';

        const makeMaterial = (color) => new THREE.MeshStandardMaterial({
            color,
            roughness: 0.72,
            metalness: 0,
            side: THREE.DoubleSide,
            flatShading: true
        });

        const materials = {
            leftRoof: makeMaterial(options.leftRoof || '#9b59b6'),
            rightRoof: makeMaterial(options.rightRoof || '#7e3fb0'),
            end: makeMaterial(options.end || '#b983dc'),
            base: makeMaterial(options.base || '#6d3e91'),
            door: makeMaterial(options.door || '#2f2118'),
            trim: makeMaterial(options.trim || '#fff7ed')
        };

        const p = {
            bl: new THREE.Vector3(-halfLength, 0, -halfBase),
            br: new THREE.Vector3(halfLength, 0, -halfBase),
            fl: new THREE.Vector3(-halfLength, 0, halfBase),
            fr: new THREE.Vector3(halfLength, 0, halfBase),
            rl: new THREE.Vector3(-halfLength, height, 0),
            rr: new THREE.Vector3(halfLength, height, 0)
        };

        const makeFace = (vertices, material) => {
            const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
            geometry.setIndex(vertices.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]);
            geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
            addEdges(group, mesh, edgeColor);
        };

        makeFace([p.bl, p.br, p.rr, p.rl], materials.leftRoof);
        makeFace([p.rl, p.rr, p.fr, p.fl], materials.rightRoof);
        makeFace([p.fl, p.fr, p.br, p.bl], materials.base);
        makeFace([p.br, p.fr, p.rr], materials.end);
        makeFace([p.fl, p.bl, p.rl], materials.end);

        if (options.door) {
            const doorGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(halfLength + 0.012, 0.02, -0.22),
                new THREE.Vector3(halfLength + 0.012, 0.02, 0.22),
                new THREE.Vector3(halfLength + 0.012, 0.4, 0)
            ]);
            doorGeometry.setIndex([0, 1, 2]);
            doorGeometry.computeVertexNormals();
            const door = new THREE.Mesh(doorGeometry, materials.door);
            group.add(door);
            addEdges(group, door, '#fef3c7');
        }

        if (options.ridge) {
            const ridge = new THREE.Mesh(
                new THREE.CylinderGeometry(0.022, 0.022, length + 0.08, 12),
                materials.trim
            );
            ridge.rotation.z = Math.PI / 2;
            ridge.position.set(0, height + 0.015, 0);
            group.add(ridge);
        }

        return group;
    }

    AFRAME.registerComponent('solid-triangular-prism', {
        init: function () {
            this.el.setObject3D('mesh', buildPrismGroup());
        },
        remove: function () {
            this.el.removeObject3D('mesh');
        }
    });

    AFRAME.registerComponent('tent-prism', {
        init: function () {
            this.el.setObject3D('mesh', buildPrismGroup({
                leftRoof: '#f59e0b',
                rightRoof: '#d97706',
                end: '#fbbf24',
                base: '#4d7c3f',
                edgeColor: '#7c2d12',
                door: '#2f2118',
                ridge: true
            }));
        },
        remove: function () {
            this.el.removeObject3D('mesh');
        }
    });
}

function buildTent(entity) {
    entity.innerHTML = '<a-entity tent-prism></a-entity>';
}

function buildSolidPrism(entity) {
    entity.innerHTML = '<a-entity solid-triangular-prism></a-entity>';
}

function buildDie(entity) {
    entity.innerHTML = '<a-entity die-cube></a-entity>';
}

function initExploreMode() {
    const container = document.getElementById('ar-container');
    if (!container) return; // not on the explore page
    registerCustomArComponents();

    // If we were sent here from a shape card (Explore.html?shape=cone),
    // open Explore Mode with that shape already selected.
    const params = new URLSearchParams(window.location.search);
    const requestedShape = params.get('shape');
    if (requestedShape) {
        const requestedIndex = SHAPES.findIndex(shape => shape.slug === requestedShape);
        if (requestedIndex !== -1) {
            currentShapeIndex = requestedIndex;
        }
    }

    container.innerHTML = `
        <a-scene
            id="ar-scene"
            embedded
            arjs="${getArConfig()}"
            vr-mode-ui="enabled: false"
            renderer="antialias: true; alpha: true; precision: high; physicallyCorrectLights: true; colorManagement: true;"
            loading-screen="enabled: false">
            <a-marker preset="hiro" smooth="true" smoothCount="8" smoothTolerance="0.01" smoothThreshold="3">
                <a-entity id="shape-entity" position="0 0.5 0"></a-entity>
                <a-entity light="type: ambient; color: #ffffff; intensity: 0.3"></a-entity>
                <a-entity light="type: directional; color: #ffffff; intensity: 1.55" position="1.2 2.5 1.4"></a-entity>
                <a-entity light="type: directional; color: #bfdbfe; intensity: 0.25" position="-1 1.5 -1"></a-entity>
            </a-marker>
            <a-entity camera></a-entity>
        </a-scene>
    `;

    document.body.style.background = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.background = 'transparent';
    renderShape();
    window.setTimeout(() => {
        renderShape();
        syncArLayers();
    }, 150);
    startArLayerObserver();

    window.addEventListener('resize', () => {
        window.setTimeout(syncArLayers, 100);
    });
    window.addEventListener('orientationchange', () => {
        window.setTimeout(syncArLayers, 100);
    });
    window.visualViewport?.addEventListener('resize', syncArLayers);
    window.addEventListener('load', syncArLayers);

    // Wire up the back button to whatever grade page referred us here,
    // falling back to activities.html if we don't know.
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        const grade = params.get('grade');
        const backHref =
            grade === 'k4' ? 'K4.html' :
            grade === 'grade56' ? 'Grade56.html' :
            'Index.html';
        backBtn.addEventListener('click', () => {
            if (arLayerObserver) {
                arLayerObserver.disconnect();
                arLayerObserver = null;
            }
            container.innerHTML = ''; // stop the webcam stream
            window.location.href = backHref;
        });
    }
}

function renderShape() {
    const shape = SHAPES[currentShapeIndex];
    const entity = document.getElementById('shape-entity');
    if (!entity) return;

    entity.removeAttribute('geometry');
    entity.removeAttribute('material');

    entity.innerHTML = '';
    entity.setAttribute('position', shape.position);
    entity.setAttribute('scale', shape.scale);
    entity.setAttribute('rotation', shape.rotation);

    if (textureMode && shape.texturedType === 'die') {
        buildDie(entity);
    } else if (textureMode && shape.texturedType === 'tent') {
        buildTent(entity);
    } else if (!textureMode && shape.customType === 'prism') {
        buildSolidPrism(entity);
    } else if (textureMode) {
        entity.setAttribute('geometry', shape.geometry);
        entity.setAttribute('material', `src: ${getShapeTexture(shape.textureKey)}; roughness: 0.72; metalness: 0; flatShading: true`);
    } else {
        entity.setAttribute('geometry', shape.geometry);
        entity.setAttribute('material', `shader: standard; color: ${shape.color}; roughness: 0.72; metalness: 0; flatShading: true`);
    }

    const label = document.getElementById('shape-label');
    if (label) {
        label.textContent = textureMode ? shape.textureLabel : shape.name;
    }
}

function changeShape(direction) {
    currentShapeIndex = (currentShapeIndex + direction + SHAPES.length) % SHAPES.length;
    renderShape();
}

function toggleTexture() {
    textureMode = !textureMode;
    const btn = document.getElementById('btn-texture-toggle');
    if (btn) {
        btn.classList.toggle('on', textureMode);
        btn.textContent = textureMode ? 'Show Shape' : 'Show Object';
    }
    renderShape();
}

// -----------------------------------------------------------
// Boot
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    initExploreMode(); // no-ops on non-explore pages
});