import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// --- SCÈNE ET CAMÉRA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a14);

let mouseX = 0,
  mouseY = 0;
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

// --- RENDERER ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- LUMIÈRES ---
scene.add(new THREE.AmbientLight(0xffffff, 2));

// --- GALAXIE DE FOND ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const positionArray = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++)
  positionArray[i] = (Math.random() - 0.5) * 500;
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3),
);
const starMaterial = new THREE.PointsMaterial({
  size: 0.6,
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true,
});
const starParticles = new THREE.Points(starGeometry, starMaterial);
scene.add(starParticles);

// ==========================================
// 🔥 LA NOUVELLE BULLE D'ÉNERGIE 🔥
// ==========================================
// Création d'une sphère translucide avec des reflets
const bubbleGeometry = new THREE.SphereGeometry(28, 64, 64);
const bubbleMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00d4ff, // Bleu électrique
  transmission: 0.9, // Effet verre/transparent
  opacity: 1,
  metalness: 0.1,
  roughness: 0.1,
  ior: 1.5,
  thickness: 0.5,
  specularIntensity: 2,
  transparent: true,
  side: THREE.DoubleSide,
});
let bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
scene.add(bubble);

let gameStarted = false; // Bloque le jeu tant que la bulle est là
let isBursting = false; // Pour l'animation d'éclatement

// --- CHARGEMENT DES OBJETS (GLTF) ---
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);
loader.setDRACOLoader(dracoLoader);

const loadedObjects = [];
const character = [
  { file: "superman.glb", position: [0, 10, -10], scale: 3 },
  { file: "wonder woman lasso.glb", position: [0, -10, -10], scale: 5 },
  { file: "Aquaman tridant.glb", position: [12, 8, -10], scale: 3 },
  { file: "arc de arrow.glb", position: [-12, 8, -10], scale: 5 },
  { file: "bague de flash.glb", position: [18, 0, -10], scale: 5 },
  { file: "cape de raven.glb", position: [-18, 0, -10], scale: 5 },
  { file: "costume nightwing.glb", position: [12, -8, -10], scale: 3 },
  { file: "deathstrke mask.glb", position: [-12, -8, -10], scale: 3 },
  { file: "Lobo moto.glb", position: [8, 0, -10], scale: 4 },
  { file: "masque de bane.glb", position: [-8, 0, -10], scale: 5 },
  { file: "Masque de Fathe.glb", position: [15, 8, -10], scale: 5 },
  { file: "massue hawkman (1).glb", position: [-15, 8, -10], scale: 5 },
];

character.forEach(({ file, position, scale }) => {
  loader.load(`./${file}`, (gltf) => {
    const obj = gltf.scene;
    obj.position.set(...position);
    obj.scale.setScalar(scale);

    // On stocke le nom du fichier dans userData pour l'identifier au clic
    obj.userData.name = file;

    // Appliquer le nom à tous les enfants (Mesh) du modèle pour le raycaster
    obj.traverse((child) => {
      if (child.isMesh) {
        child.userData.name = file;
      }
    });

    scene.add(obj);
    loadedObjects.push(obj);
  });
});

// --- CONTRÔLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- BOUCLE D'ANIMATION ---
function animate() {
  requestAnimationFrame(animate);

  // Animation de la galaxie et du tangage de la scène
  starParticles.rotation.y -= 0.0003;
  scene.rotation.y += (mouseX * 0.05 - scene.rotation.y) * 0.05;
  scene.rotation.x += (-mouseY * 0.05 - scene.rotation.x) * 0.05;

  // Flottaison légère des objets
  const time = Date.now() * 0.001;
  loadedObjects.forEach((obj, i) => {
    obj.position.y += Math.sin(time + i) * 0.005;
  });

  // Animation de la bulle (Rotation et Éclatement)
  if (bubble) {
    if (!isBursting) {
      // Rotation lente tant que le jeu n'a pas commencé
      bubble.rotation.y += 0.002;
      bubble.rotation.x += 0.001;
    } else {
      // L'effet d'éclatement : la bulle grossit et devient transparente
      bubble.scale.multiplyScalar(1.08);
      bubble.material.opacity -= 0.05;
      if (bubble.material.opacity <= 0) {
        scene.remove(bubble);
        bubble = null; // On supprime définitivement la bulle
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- MINI-VIEWER (Code précédent conservé) ---
let miniRenderer, miniScene, miniCamera, miniControls, miniAnimId;

function setupMiniViewer(container, file) {
  cleanupMiniViewer();

  miniScene = new THREE.Scene();
  miniScene.background = new THREE.Color(0x0a192f);

  const rect = container.getBoundingClientRect();
  const width = rect.width || 120;
  const height = rect.height || 120;

  miniCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  miniCamera.position.z = 5;

  miniRenderer = new THREE.WebGLRenderer({ antialias: true });
  miniRenderer.setSize(width, height);
  container.appendChild(miniRenderer.domElement);

  miniScene.add(new THREE.AmbientLight(0xffffff, 2.5));
  const light = new THREE.PointLight(0xffffff, 50);
  light.position.set(5, 5, 5);
  miniScene.add(light);

  miniControls = new OrbitControls(miniCamera, miniRenderer.domElement);
  miniControls.enableZoom = true;

  loader.load(`./${file}`, (gltf) => {
    const model = gltf.scene;
    miniScene.add(model);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y);
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

// --- LOGIQUE DE JEU ---
const corectAnswers = {
  "superman.glb": ["superman", "clark kent", "clark"],
  "wonder woman lasso.glb": ["wonder woman", "wonderwoman", "diana prince"],
  "Aquaman tridant.glb": ["aquaman", "arthur curry"],
  "arc de arrow.glb": ["green arrow", "arrow", "oliver queen"],
  "bague de flash.glb": ["flash", "the flash", "barry allen"],
  "cape de raven.glb": ["raven", "rachel roth"],
  "costume nightwing.glb": ["nightwing", "dick grayson"],
  "deathstrke mask.glb": ["deathstroke", "slade wilson"],
  "Lobo moto.glb": ["lobo"],
  "masque de bane.glb": ["bane"],
  "Masque de Fathe.glb": ["doctor fate", "dr fate", "fate", "kent nelson"],
  "massue hawkman (1).glb": ["hawkman", "carter hall"],
};

let currentObjectFile = "";
let score = 0;
const totalObjects = character.length;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// --- GESTION DU CLIC ---
window.addEventListener("click", (event) => {
  // Ignorer si un pop-up est ouvert
  if (document.getElementById("game-popup").style.display === "flex") return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  // 1. SI LE JEU N'A PAS COMMENCÉ : On cherche le clic sur la bulle
  if (!gameStarted) {
    if (bubble) {
      const intersectsBubble = raycaster.intersectObject(bubble);
      if (intersectsBubble.length > 0) {
        // 💥 ÉCLATEMENT DE LA BULLE !
        isBursting = true;
        gameStarted = true; // Le jeu commence !

        // On cache le texte d'intro "Clique sur la bulle..."
        const textIntro = document.querySelector(".text-intro");
        if (textIntro) {
          textIntro.style.opacity = "0";
          setTimeout(() => (textIntro.style.display = "none"), 500);
        }
      }
    }
    return; // On arrête là, on ne peut pas cliquer sur les objets tant que la bulle est là
  }

  // 2. SI LE JEU A COMMENCÉ : On cherche le clic sur les objets 3D
  const intersects = raycaster.intersectObjects(loadedObjects, true);

  if (intersects.length > 0) {
    const clickedObj = intersects[0].object;
    if (clickedObj.userData.name) {
      currentObjectFile = clickedObj.userData.name;

      // Ouvrir le pop-up et le mini-viewer
      document.getElementById("game-popup").style.display = "flex";
      setTimeout(() => {
        setupMiniViewer(
          document.getElementById("mini-viewer"),
          currentObjectFile,
        );
      }, 100);

      // Reset input et feedback
      document.getElementById("feedback-msg").innerText = "";
      document.getElementById("hero-input").value = "";
      document.getElementById("hero-input").focus();
    }
  }
});

// --- LOGIQUE DE VALIDATION ---
document.getElementById("btn-valider").addEventListener("click", () => {
  const userInput = document
    .getElementById("hero-input")
    .value.toLowerCase()
    .trim();
  const feedback = document.getElementById("feedback-msg");

  if (
    corectAnswers[currentObjectFile] &&
    corectAnswers[currentObjectFile].includes(userInput)
  ) {
    // BONNE RÉPONSE
    feedback.innerText = "Bravo ! C'est le bon héros.";
    feedback.style.color = "#4ade80"; // Vert
    score++;

    // Faire disparaître l'objet correspondant dans la scène
    loadedObjects.forEach((obj) => {
      if (obj.userData.name === currentObjectFile) {
        obj.visible = false;
      }
    });

    // Fermer le pop-up après un délai et vérifier la fin du jeu
    setTimeout(() => {
      document.getElementById("game-popup").style.display = "none";
      cleanupMiniViewer();
      // Si tous les objets ont été trouvés, on va à la page de fin
      if (score === totalObjects) {
        window.location.href = "page_de_fin.html";
      }
    }, 1500);
  } else {
    // MAUVAISE RÉPONSE
    feedback.innerText = "Dommage, réessaie !";
    feedback.style.color = "#f87171"; // Rouge
  }
});

// --- FERMER LE POP-UP ---
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("game-popup").style.display = "none";
  cleanupMiniViewer();
});

// --- RESIZE ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
