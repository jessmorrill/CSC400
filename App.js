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

let currentShapeIndex = 0;
let currentGrade = 'k4';

// K-4 only. Untouched from before — its own flag, its own function.
let textureMode = false;

// 5-6 only. Two completely independent flags/functions — neither
// calls the other, neither shares state with textureMode. A user
// can have skeleton ON and net ON and OFF in any combination.
let skeletonMode = false;
let netMode = false;

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

// -----------------------------------------------------------
// 5-6 skeleton geometry helpers.
// Straight-edge solids (cube, pyramid, prism) build real flat
// geometry and use EdgesGeometry, which is accurate for them
// because their faces are genuinely flat/planar.
// Curved solids (cone, cylinder) do NOT use EdgesGeometry — a
// cone/cylinder mesh is triangulated to approximate the curve,
// so EdgesGeometry would wrongly flag every triangle seam on the
// curved surface as an "edge". Instead their true curved edges
// (circular rims) are drawn by hand as line loops.
// Sphere has no entry anywhere here: 0 edges, 0 vertices.
// -----------------------------------------------------------

function boxCorners(hx, hy, hz) {
    const corners = [];
    [-hx, hx].forEach(x => [-hy, hy].forEach(y => [-hz, hz].forEach(z =>
        corners.push(new THREE.Vector3(x, y, z))
    )));
    return corners;
}

function pyramidBaseCorners(halfBase, height) {
    const halfHeight = height / 2;
    const corners = [];
    // square base corners, offset 45 degrees to match ConeGeometry(radialSegments:4)'s orientation
    const r = halfBase * Math.SQRT2;
    for (let i = 0; i < 4; i++) {
        const theta = Math.PI / 4 + (i / 4) * Math.PI * 2;
        corners.push(new THREE.Vector3(r * Math.cos(theta), -halfHeight, r * Math.sin(theta)));
    }
    corners.push(new THREE.Vector3(0, halfHeight, 0)); // apex
    return corners;
}

function makeCircleLine(radius, y, color, segments = 64) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
}

function prismCorners(length, halfBase, height) {
    const halfLength = length / 2;
    return {
        bl: new THREE.Vector3(-halfLength, 0, -halfBase),
        br: new THREE.Vector3(halfLength, 0, -halfBase),
        fl: new THREE.Vector3(-halfLength, 0, halfBase),
        fr: new THREE.Vector3(halfLength, 0, halfBase),
        rl: new THREE.Vector3(-halfLength, height, 0),
        rr: new THREE.Vector3(halfLength, height, 0)
    };
}

function buildPrismFaceGeometry(length, halfBase, height) {
    const p = prismCorners(length, halfBase, height);
    const order = [p.bl, p.br, p.fl, p.fr, p.rl, p.rr];
    const positions = [];
    order.forEach(v => positions.push(v.x, v.y, v.z));

    const indices = [
        0, 1, 5, 0, 5, 4, // left roof
        4, 5, 3, 4, 3, 2, // right roof
        2, 3, 1, 2, 1, 0, // base
        1, 3, 5,          // right end
        2, 0, 4           // left end
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

// Returns { faceGeometry, vertexPositions, edgeObjects } or null
// (sphere) if the shape has no skeleton representation at all.
// edgeObjects is an array of THREE.Object3D (Line/LineSegments)
// ready to add to a group directly — built per-shape rather than
// derived generically, so curved vs. straight edges are correct.
function getSkeletonData(slug) {
    const edgeColor = 0x111827;

    switch (slug) {
        case 'cube': {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            return {
                faceGeometry: geometry,
                vertexPositions: boxCorners(0.5, 0.5, 0.5),
                edgeObjects: [new THREE.LineSegments(
                    new THREE.EdgesGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: edgeColor })
                )]
            };
        }
        case 'pyramid': {
            const geometry = new THREE.ConeGeometry(0.65 * Math.SQRT1_2, 1, 4);
            geometry.rotateY(Math.PI / 4);
            return {
                faceGeometry: geometry,
                vertexPositions: pyramidBaseCorners(0.65 * Math.SQRT1_2, 1),
                edgeObjects: [new THREE.LineSegments(
                    new THREE.EdgesGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: edgeColor })
                )]
            };
        }
        case 'cone': {
            // 1 vertex (the apex), 1 curved edge (the circular base rim).
            // No straight edges at all.
            return {
                faceGeometry: new THREE.ConeGeometry(0.5, 1, 48),
                vertexPositions: [new THREE.Vector3(0, 0.5, 0)],
                edgeObjects: [makeCircleLine(0.5, -0.5, edgeColor, 64)]
            };
        }
        case 'cylinder': {
            // 0 vertices, 2 curved edges (top rim + bottom rim).
            return {
                faceGeometry: new THREE.CylinderGeometry(0.42, 0.42, 0.5, 48),
                vertexPositions: [],
                edgeObjects: [
                    makeCircleLine(0.42, 0.25, edgeColor, 64),
                    makeCircleLine(0.42, -0.25, edgeColor, 64)
                ]
            };
        }
        case 'prism': {
            const geometry = buildPrismFaceGeometry(1.65, 0.52, 0.82);
            return {
                faceGeometry: geometry,
                vertexPositions: Object.values(prismCorners(1.65, 0.52, 0.82)),
                edgeObjects: [new THREE.LineSegments(
                    new THREE.EdgesGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: edgeColor })
                )]
            };
        }
        case 'sphere':
        default:
            return null;
    }
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

    // ---------------------------------------------------------
    // 5-6 skeleton component. Independent feature — knows nothing
    // about netMode. Faces render semi-transparent; vertices and
    // edges render fully opaque, built per-shape via getSkeletonData
    // so curved edges/vertex counts are geometrically correct.
    // ---------------------------------------------------------
    AFRAME.registerComponent('shape-skeleton', {
        schema: { slug: { type: 'string' } },
        init: function () {
            const data = getSkeletonData(this.data.slug);
            const group = new THREE.Group();
            if (!data) {
                this.el.setObject3D('mesh', group);
                return;
            }

            const faceMaterial = new THREE.MeshStandardMaterial({
                color: '#94a3b8',
                transparent: true,
                opacity: 0.22,
                depthWrite: false,
                side: THREE.DoubleSide,
                roughness: 0.8
            });
            group.add(new THREE.Mesh(data.faceGeometry, faceMaterial));

            data.edgeObjects.forEach(edgeObject => group.add(edgeObject));

            const dotGeometry = new THREE.SphereGeometry(0.035, 12, 12);
            const dotMaterial = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
            data.vertexPositions.forEach(point => {
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.copy(point);
                group.add(dot);
            });

            this.el.setObject3D('mesh', group);
        },
        remove: function () {
            this.el.removeObject3D('mesh');
        }
    });

    // ---------------------------------------------------------
    // 5-6 net component. Independent feature — knows nothing
    // about skeletonMode. Loads an actual 2D net image (not a
    // canvas drawing) and maps it onto a flat plane. Never
    // registered/used for sphere.
    // ---------------------------------------------------------
    AFRAME.registerComponent('shape-net', {
        schema: { slug: { type: 'string' } },
        init: function () {
            const url = getNetTexture(this.data.slug);
            const group = new THREE.Group();
            if (!url) {
                this.el.setObject3D('mesh', group);
                return;
            }

            const loader = new THREE.TextureLoader();
            const texture = loader.load(url);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), material);
            plane.rotation.x = -Math.PI / 2; // lies flat, like a printed net on paper
            group.add(plane);

            this.el.setObject3D('mesh', group);
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

    const params = new URLSearchParams(window.location.search);
    const requestedShape = params.get('shape');
    if (requestedShape) {
        const requestedIndex = SHAPES.findIndex(shape => shape.slug === requestedShape);
        if (requestedIndex !== -1) {
            currentShapeIndex = requestedIndex;
        }
    }

    currentGrade = params.get('grade') === 'grade56' ? 'grade56' : 'k4';

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
                <a-entity id="net-entity" position="1.3 -0.15 0" scale="0.9 0.9 0.9" visible="false"></a-entity>
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

    // Show/hide the right buttons for this grade and wire each one
    // to its own independent toggle function.
    const textureBtn = document.getElementById('btn-texture-toggle');
    const skeletonBtn = document.getElementById('btn-skeleton-toggle');
    const netBtn = document.getElementById('btn-net-toggle');

    if (currentGrade === 'grade56') {
        if (textureBtn) textureBtn.style.display = 'none';
        if (skeletonBtn) {
            skeletonBtn.style.display = '';
            skeletonBtn.addEventListener('click', toggleSkeleton);
        }
        if (netBtn) {
            netBtn.style.display = '';
            netBtn.addEventListener('click', toggleNet);
        }
    } else {
        if (skeletonBtn) skeletonBtn.style.display = 'none';
        if (netBtn) netBtn.style.display = 'none';
        if (textureBtn) {
            textureBtn.style.display = '';
            textureBtn.addEventListener('click', toggleTexture);
        }
    }

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
            container.innerHTML = '';
            window.location.href = backHref;
        });
    }
}

function renderShape() {
    const shape = SHAPES[currentShapeIndex];
    const entity = document.getElementById('shape-entity');
    const netEntity = document.getElementById('net-entity');
    if (!entity) return;

    entity.removeAttribute('geometry');
    entity.removeAttribute('material');
    entity.innerHTML = '';
    entity.setAttribute('position', shape.position);
    entity.setAttribute('scale', shape.scale);
    entity.setAttribute('rotation', shape.rotation);

    // ---- Main shape body ----
    if (currentGrade === 'grade56' && skeletonMode) {
        entity.innerHTML = `<a-entity shape-skeleton="slug: ${shape.slug}"></a-entity>`;
    } else if (textureMode && shape.texturedType === 'die') {
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

    // ---- Net panel: fully independent of skeletonMode/textureMode ----
    if (netEntity) {
        if (currentGrade === 'grade56' && netMode && shape.slug !== 'sphere') {
            netEntity.setAttribute('visible', 'true');
            netEntity.innerHTML = `<a-entity shape-net="slug: ${shape.slug}"></a-entity>`;
        } else {
            netEntity.setAttribute('visible', 'false');
            netEntity.innerHTML = '';
        }
    }

    // ---- Sphere note: shown only when a 5-6 toggle would otherwise be a no-op for sphere ----
    const noteEl = document.getElementById('skeleton-note');
    if (noteEl) {
        if (currentGrade === 'grade56' && shape.slug === 'sphere' && (skeletonMode || netMode)) {
            noteEl.hidden = false;
            noteEl.textContent = 'A sphere has no edges, no vertices, and no net — it can\u2019t be unfolded flat!';
        } else {
            noteEl.hidden = true;
        }
    }

    const label = document.getElementById('shape-label');
    if (label) {
        if (currentGrade === 'grade56') {
            const tags = [];
            if (skeletonMode) tags.push('Skeleton');
            if (netMode && shape.slug !== 'sphere') tags.push('Net');
            label.textContent = tags.length ? `${shape.name} \u2014 ${tags.join(' + ')}` : shape.name;
        } else {
            label.textContent = textureMode ? shape.textureLabel : shape.name;
        }
    }
}

function changeShape(direction) {
    currentShapeIndex = (currentShapeIndex + direction + SHAPES.length) % SHAPES.length;
    renderShape();
}

// K-4 only. Untouched.
function toggleTexture() {
    textureMode = !textureMode;
    const btn = document.getElementById('btn-texture-toggle');
    if (btn) {
        btn.classList.toggle('on', textureMode);
        btn.textContent = textureMode ? 'Show Shape' : 'Show Object';
    }
    renderShape();
}

// 5-6 only. Independent of toggleNet() — does not read or write netMode.
function toggleSkeleton() {
    skeletonMode = !skeletonMode;
    const btn = document.getElementById('btn-skeleton-toggle');
    if (btn) {
        btn.classList.toggle('on', skeletonMode);
        btn.textContent = skeletonMode ? 'Hide Skeleton' : 'Show Skeleton';
    }
    renderShape();
}

// 5-6 only. Independent of toggleSkeleton() — does not read or write skeletonMode.
function toggleNet() {
    netMode = !netMode;
    const btn = document.getElementById('btn-net-toggle');
    if (btn) {
        btn.classList.toggle('on', netMode);
        btn.textContent = netMode ? 'Hide Net' : 'Show Net';
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