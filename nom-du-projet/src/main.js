import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// ==========================================
// 1. CONFIGURATION DE LA SCÈNE (PRINCIPALE)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 40;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// On garde ça pour que le rendu soit net sur ton écran Retina
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 2));

// ==========================================
// 2. LA GALAXIE (VERSION AFFINÉE ET PLUS RÉALISTE)
// ==========================================
const starGeometry = new THREE.BufferGeometry();
// On augmente un peu le nombre pour compenser la taille (10,000 au lieu de 6,000)
const starCount = 10000;
const positionArray = new Float32Array(starCount * 3);

// On disperse les étoiles sur une zone plus large pour la profondeur
for (let i = 0; i < starCount * 3; i++) {
  positionArray[i] = (Math.random() - 0.5) * 500;
}
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3),
);

// J'AI CHANGÉ LA TAILLE ICI 👉 size: 0.3 (au lieu de 1.0)
// On la rend aussi un peu moins opaque pour plus de douceur
const starMaterial = new THREE.PointsMaterial({
  size: 0.3, // Plus petites pour la profondeur
  color: 0xffffff,
  transparent: true,
  opacity: 0.6, // Un peu plus discret
  sizeAttenuation: true, // Important pour que les étoiles lointaines paraissent plus petites
});

const starParticles = new THREE.Points(starGeometry, starMaterial);
scene.add(starParticles);

// ==========================================
// 3. CHARGEMENT DES OBJETS 3D (Les Héros)
// ==========================================
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);
loader.setDRACOLoader(dracoLoader);

const loadedObjects = [];
const character = [
  { file: "superman.glb", position: [0, 8, -10], scale: 3 },
  { file: "wonde woman lasso.glb", position: [0, -6, -5], scale: 5 },
  { file: "Aquaman tridant.glb", position: [12, 2, -10], scale: 2 },
  { file: "arc de arrow.glb", position: [-12, 2, -10], scale: 5 },
  { file: "bague de flash.glb", position: [7, 12, -15], scale: 5 },
  { file: "cape de raven.glb", position: [-7, 12, -15], scale: 5 },
  { file: "costume nightwing.glb", position: [18, -4, -12], scale: 2 },
  { file: "deathstrke mask.glb", position: [-18, -4, -12], scale: 2 },
  { file: "Lobo moto.glb", position: [8, -12, -15], scale: 1 },
  { file: "masque de bane.glb", position: [-15, 20, -5], scale: 5 },
  { file: "Masque de Fathe.glb", position: [24, 6, -18], scale: 5 },
  { file: "massue hawkman (1).glb", position: [-30, 10, 0], scale: 5 },
];

character.forEach(({ file, position, scale }) => {
  loader.load(`./${file}`, (gltf) => {
    const obj = gltf.scene;
    obj.position.set(...position);
    obj.scale.setScalar(scale);
    obj.userData.name = file;
    scene.add(obj);
    loadedObjects.push(obj);
  });
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Pour plus de fluidité

// Boucle d'animation principale
function animate() {
  requestAnimationFrame(animate);

  // Animation de fond
  starParticles.rotation.y -= 0.0003;

  // Inclinaison de la scène avec la souris
  scene.rotation.y += (mouseX * 0.05 - scene.rotation.y) * 0.05;
  scene.rotation.x += (-mouseY * 0.05 - scene.rotation.x) * 0.05;

  const time = Date.now() * 0.001;
  loadedObjects.forEach((obj, i) => {
    obj.position.y += Math.sin(time + i) * 0.005;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ==========================================
// 4. MINI-MOTEUR 3D POUR LE POP-UP
// ==========================================
let miniRenderer, miniScene, miniCamera, miniControls, miniAnimId;

function setupMiniViewer(container, file) {
  cleanupMiniViewer();
  miniScene = new THREE.Scene();

  // Fond bleu nuit pour le mini-viewer
  miniScene.background = new THREE.Color(0x0a192f);

  const rect = container.getBoundingClientRect();
  // On s'assure que la largeur et la hauteur ne sont pas nulles
  const width = rect.width || 120;
  const height = rect.height || 120;

  miniCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  miniCamera.position.z = 5;

  miniRenderer = new THREE.WebGLRenderer({ antialias: true });
  miniRenderer.setSize(width, height);
  container.appendChild(miniRenderer.domElement);

  miniScene.add(new THREE.AmbientLight(0xffffff, 2.5));
  const pLight = new THREE.PointLight(0xffffff, 50);
  pLight.position.set(5, 5, 5);
  miniScene.add(pLight);

  miniControls = new OrbitControls(miniCamera, miniRenderer.domElement);
  miniControls.enableZoom = true;

  loader.load(`./${file}`, (gltf) => {
    const model = gltf.scene;
    miniScene.add(model);

    // Auto-centrage de l'objet
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // On adapte la caméra pour que l'objet remplisse bien le carré
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    miniCamera.position.z = maxDim * 2.8;
  });

  function miniAnimate() {
    miniAnimId = requestAnimationFrame(miniAnimate);
    if (miniControls) miniControls.update();
    if (miniRenderer) miniRenderer.render(miniScene, miniCamera);
  }
  miniAnimate();
}

function cleanupMiniViewer() {
  if (miniAnimId) cancelAnimationFrame(miniAnimId);
  if (miniRenderer) {
    miniRenderer.dispose();
    miniRenderer.domElement.remove();
    miniRenderer = null;
  }
  miniScene = null;
}

// ==========================================
// 5. MÉCANIQUE DE JEU (CLIC & VALIDATION)
// ==========================================
const corectAnswers = {
  "superman.glb": ["superman"],
  "Aquaman tridant.glb": ["aquaman"],
  "arc de arrow.glb": ["green arrow"],
  "bague de flash.glb": ["flash"],
  "cape de raven.glb": ["raven"],
  "costume nightwing.glb": ["nightwing"],
  "deathstrke mask.glb": ["deathstroke"],
  "Lobo moto.glb": ["lobo"],
  "masque de bane.glb": ["bane"],
  "Masque de Fathe.glb": ["doctor fate"],
  "massue hawkman (1).glb": ["hawkman"],
  "wonder woman lasso.glb": ["wonder woman"],
};

let currentObjectFile = "",
  score = 0;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener("click", (event) => {
  if (document.getElementById("game-popup").style.display === "flex") return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(loadedObjects, true);

  if (intersects.length > 0) {
    let clickedObj = intersects[0].object;
    while (clickedObj.parent && !clickedObj.userData.name)
      clickedObj = clickedObj.parent;

    if (clickedObj.userData.name) {
      currentObjectFile = clickedObj.userData.name;
      const popup = document.getElementById("game-popup");
      popup.style.display = "flex";

      // Micro-délai pour laisser le temps au pop-up de s'ouvrir
      setTimeout(() => {
        setupMiniViewer(
          document.getElementById("mini-viewer"),
          currentObjectFile,
        );
      }, 100);

      document.getElementById("feedback-msg").innerText = "";
      document.getElementById("hero-input").value = "";
      document.getElementById("hero-input").focus();
    }
  }
});

// Bouton Valider
document.getElementById("btn-valider").addEventListener("click", () => {
  const userInput = document
    .getElementById("hero-input")
    .value.toLowerCase()
    .trim();
  const popup = document.getElementById("game-popup");

  if (corectAnswers[currentObjectFile]?.includes(userInput)) {
    document.getElementById("feedback-msg").innerText =
      "Bravo ! C'est le bon héros.";
    document.getElementById("feedback-msg").style.color = "#4ade80";
    score++;
    loadedObjects.forEach((obj) => {
      if (obj.userData.name === currentObjectFile) obj.visible = false;
    });

    setTimeout(() => {
      popup.style.display = "none";
      cleanupMiniViewer();
      if (score === character.length) window.location.href = "page_de_fin.html";
    }, 1500);
  } else {
    document.getElementById("feedback-msg").innerText = "Dommage, réessaie !";
    document.getElementById("feedback-msg").style.color = "#f87171";
  }
});

// Croix de fermeture
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("game-popup").style.display = "none";
  cleanupMiniViewer();
});

// Redimensionnement
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
