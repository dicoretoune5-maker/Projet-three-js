import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// --- CRÉATION DE L'UNIVERS (LA SCÈNE) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// --- VARIABLES POUR L'INTERACTIVITÉ SOURIS ---
let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- CRÉATION DE LA CAMÉRA ---
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

// --- AJOUT DE LUMIÈRE ---
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.PointLight(0xffffff, 100);
light.position.set(10, 10, 10);
scene.add(light);

// --- CRÉATION DES ÉTOILES ---
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

// --- CHARGEMENT DES OBJETS 3D ---
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

      // L'étiquette magique pour reconnaître l'objet au clic !
      obj.userData.name = file;

      scene.add(obj);
      loadedObjects.push(obj);
    },
    undefined,
    (error) => console.error(`Erreur avec le fichier ${file}:`, error),
  );
});

const controls = new OrbitControls(camera, renderer.domElement);

// --- BOUCLE D'ANIMATION ---
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

window.addEventListener("click", (event) => {
  // Changement ici : On vérifie si c'est déjà affiché en flex
  if (document.getElementById("game-popup").style.display === "flex") return;

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

      const popup = document.getElementById("game-popup");

      // MODIFICATION VITAL POUR LE CENTRAGE : On utilise 'flex' au lieu de 'block'
      popup.style.display = "flex";

      document.getElementById("feedback-msg").innerText = "";
      document.getElementById("hero-input").value = "";
      document.getElementById("hero-input").focus();
    }
  }
});

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

    loadedObjects.forEach((obj) => {
      if (obj.userData.name === currentObjectFile) {
        obj.visible = false;
      }
    });

    setTimeout(() => {
      popup.style.display = "none";
      if (score === character.length) {
        window.location.href = "page_de_fin.html";
      }
    }, 1500);
  } else {
    document.getElementById("feedback-msg").innerText = "Dommage, réessaie !";
    document.getElementById("feedback-msg").style.color = "#f87171";
  }
});

document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("game-popup").style.display = "none";
});
