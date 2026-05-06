import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// ==========================================
// MOTEUR PRINCIPAL (La Galaxie)
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
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.PointLight(0xffffff, 100);
light.position.set(10, 10, 10);
scene.add(light);

const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const positionArray = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  positionArray[i] = (Math.random() - 0.5) * 300;
}
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3),
);
const starMaterial = new THREE.PointsMaterial({
  size: 0.3,
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true,
});
const starParticles = new THREE.Points(starGeometry, starMaterial);
scene.add(starParticles);

// --- Préparation commune pour le chargement 3D ---
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
  loader.load(
    `./${file}`,
    (gltf) => {
      const obj = gltf.scene;
      obj.position.set(...position);
      obj.scale.setScalar(scale);
      obj.userData.name = file;
      scene.add(obj);
      loadedObjects.push(obj);
    },
    undefined,
    (error) => console.error(`Erreur avec le fichier ${file}:`, error),
  );
});

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  starParticles.rotation.y -= 0.0005;
  starParticles.rotation.x -= 0.0002;
  scene.rotation.y += (mouseX * 0.1 - scene.rotation.y) * 0.05;
  scene.rotation.x += (-mouseY * 0.1 - scene.rotation.x) * 0.05;
  const time = Date.now() * 0.001;
  loadedObjects.forEach((obj, index) => {
    obj.position.y += Math.sin(time + index) * 0.005;
  });
  controls.update();
  renderer.render(scene, camera);
}
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
animate();

// ==========================================
// MÉCANIQUE DE JEU ET RAYCASTER
// ==========================================

const corectAnswers = {
  "superman.glb": ["superman", "clark kent"],
  "Aquaman tridant.glb": ["aquaman", "arthur curry"],
  "arc de arrow.glb": ["green arrow", "oliver queen"],
  "bague de flash.glb": ["flash", "barry allen"],
  "cape de raven.glb": ["raven", "rachel roth"],
  "costume nightwing.glb": ["nightwing", "dick grayson"],
  "deathstrke mask.glb": ["deathstroke", "slade wilson"],
  "Lobo moto.glb": ["lobo"],
  "masque de bane.glb": ["bane"],
  "Masque de Fathe.glb": ["doctor fate", "dr fate", "kent nelson"],
  "massue hawkman (1).glb": ["hawkman", "carter hall"],
  "wonde woman lasso.glb": ["wonder woman", "diana prince"],
};

let currentObjectFile = "";
let score = 0;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// VARIABLES POUR LE MINI-MOTEUR (Le visualiseur du pop-up)
let miniRenderer,
  miniScene,
  miniCamera,
  miniControls,
  miniAnimationId,
  miniLoadedModel;

// FONCTION POUR NETTOYER LE MINI-MOTEUR (Crucial pour la mémoire !)
function cleanupMiniViewer() {
  if (miniAnimationId) {
    cancelAnimationFrame(miniAnimationId); // Arrête la boucle d'animation
    miniAnimationId = null;
  }
  if (miniControls) {
    miniControls.dispose();
    miniControls = null;
  }
  if (miniRenderer) {
    miniRenderer.dispose(); // Détruit le renderer
    miniRenderer.forceContextLoss(); // Libère la carte graphique
    miniRenderer.domElement.remove(); // Enlève le canvas HTML
    miniRenderer = null;
  }
  if (miniScene) {
    // Traverse et détruit toutes les géométries et matériaux du modèle
    miniScene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material))
          object.material.forEach((material) => material.dispose());
        else object.material.dispose();
      }
    });
    miniScene = null;
  }
  miniCamera = null;
  miniLoadedModel = null;
}

// FONCTION POUR INITIALISER LE MINI-MOTEUR DANS LE CADRE
function setupMiniViewer(container) {
  const rect = container.getBoundingClientRect();

  // 1. Scene et Camera (Perspective Camera pour que l'objet soit bien visible)
  miniScene = new THREE.Scene();
  miniScene.background = new THREE.Color(0x1a3365); // Même fond bleu que ton pop-up

  miniCamera = new THREE.PerspectiveCamera(
    45,
    rect.width / rect.height,
    0.1,
    100,
  );
  miniCamera.position.set(0, 0, 5); // Position de base

  // 2. Renderer spécifique pour le petit cadre
  miniRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  miniRenderer.setSize(rect.width, rect.height);
  miniRenderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(miniRenderer.domElement);

  // 3. Lumières pour bien voir l'objet
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  miniScene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 50);
  pointLight.position.set(10, 10, 10);
  miniScene.add(pointLight);

  // 4. Contrôles (OrbitControls pour pouvoir faire tourner l'objet)
  miniControls = new OrbitControls(miniCamera, miniRenderer.domElement);
  miniControls.enablePan = false; // Désactive le déplacement
  miniControls.enableZoom = true; // Active le zoom
}

// FONCTION POUR CHARGER LE MODÈLE DANS LE MINI-VIEWER ET LE CENTRER
function loadModelInPopup(filename) {
  // Nettoie l'ancien modèle s'il y en a un
  if (miniLoadedModel) miniScene.remove(miniLoadedModel);

  loader.load(
    `./${filename}`,
    (gltf) => {
      miniLoadedModel = gltf.scene;
      miniScene.add(miniLoadedModel);

      // ASTUCE DE GÉNIE : Centrer et adapter automatiquement la taille du modèle
      const box = new THREE.Box3().setFromObject(miniLoadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      miniLoadedModel.position.x += miniLoadedModel.position.x - center.x;
      miniLoadedModel.position.y += miniLoadedModel.position.y - center.y;
      miniLoadedModel.position.z += miniLoadedModel.position.z - center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = miniCamera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      miniCamera.position.z = cameraZ * 2.5; // Ajustement de la distance
      miniCamera.updateProjectionMatrix();
      miniControls.target.set(0, 0, 0);
      miniControls.update();
    },
    undefined,
    (error) => console.error(`Erreur mini-load:`, error),
  );
}

// BOUCLE D'ANIMATION DU MINI-MOTEUR
function animateMini() {
  miniAnimationId = requestAnimationFrame(animateMini);
  if (miniControls) miniControls.update();
  if (miniRenderer && miniScene && miniCamera)
    miniRenderer.render(miniScene, miniCamera);
}

// --- GESTION DU CLIC SUR LA GALAXIE ---
window.addEventListener("click", (event) => {
  const popup = document.getElementById("game-popup");

  // Changement : on vérifie 'flex' pour ton centrage CSS
  if (popup.style.display === "flex") return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(loadedObjects, true);

  if (intersects.length > 0) {
    let clickedObj = intersects[0].object;
    while (clickedObj.parent && !clickedObj.userData.name) {
      clickedObj = clickedObj.parent;
    }

    if (clickedObj.userData.name) {
      currentObjectFile = clickedObj.userData.name;

      // Affiche le pop-up
      popup.style.display = "flex";

      // CHARGEMENT DU MINI-VIEWER LORS DU CLIC
      const miniContainer = document.getElementById("mini-viewer");
      setupMiniViewer(miniContainer); // Crée le 2ème moteur
      loadModelInPopup(currentObjectFile); // Charge le modèle dedans
      animateMini(); // Lance la boucle d'animation du pop-up

      document.getElementById("feedback-msg").innerText = "";
      document.getElementById("hero-input").value = "";
      document.getElementById("hero-input").focus();
    }
  }
});

// --- VALIDATION DE LA RÉPONSE ---
document.getElementById("btn-valider").addEventListener("click", () => {
  const userInput = document
    .getElementById("hero-input")
    .value.toLowerCase()
    .trim();
  const popup = document.getElementById("game-popup");

  if (
    corectAnswers[currentObjectFile] &&
    corectAnswers[currentObjectFile].includes(userInput)
  ) {
    document.getElementById("feedback-msg").innerText =
      "Bravo ! C'est le bon héros.";
    document.getElementById("feedback-msg").style.color = "#4ade80";
    score++;

    // Cache l'objet trouvé dans la galaxie principale
    loadedObjects.forEach((obj) => {
      if (obj.userData.name === currentObjectFile) obj.visible = false;
    });

    setTimeout(() => {
      popup.style.display = "none";

      // 👉 NETTOYAGE DU MINI-VIEWER QUAND LE POP-UP FERME
      cleanupMiniViewer();

      if (score === character.length) {
        window.location.href = "page_de_fin.html";
      }
    }, 1500);
  } else {
    document.getElementById("feedback-msg").innerText = "Dommage, réessaie !";
    document.getElementById("feedback-msg").style.color = "#f87171";
  }
});

// --- FERMER LE POP-UP AVEC LA CROIX ---
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("game-popup").style.display = "none";

  // NETTOYAGE DU MINI-VIEWER QUAND LE POP-UP FERME
  cleanupMiniViewer();
});
