import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Création de l'univers (la scène)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Fond noir pour simuler l'espace
// Création de la caméra
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
scene.add(new THREE.AmbientLight(0xffffff, 1.5)); // Lumière ambiante pour adoucir les ombre
const light = new THREE.PointLight(0xffffff, 100);
light.position.set(10, 10, 10);
scene.add(light);

// --- NOUVELLE CRÉATION DES ÉTOILES (Optimisée et plus belle) ---
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
// --- CHARGEMENT DU OBJET 3D ---
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);
loader.setDRACOLoader(dracoLoader);
const character = [
  { file: "superman.glb", position: [1, 20, -12], scale: 3 },
  { file: "Aquaman tridant.glb", position: [20, 5, -10], scale: 2 },
  { file: "arc de arrow.glb", position: [-20, -5, 10], scale: 5 },
  { file: "bague de flash.glb", position: [10, 15, -20], scale: 5 },
  { file: "cape de raven.glb", position: [10, -15, 20], scale: 5 },
  { file: "costume nightwing.glb", position: [25, 0, 15], scale: 2 },
  { file: "deathstrke mask.glb", position: [-25, 10, -15], scale: 2 },
  { file: "Lobo moto.glb", position: [15, -20, 5], scale: 1 },
  { file: "masque de bane.glb", position: [-15, 20, -5], scale: 5 },
  { file: "Masque de Fathe.glb", position: [30, -10, 0], scale: 5 },
  { file: "massue hawkman (1).glb", position: [-30, 10, 0], scale: 5 },
  { file: "wonde woman lasso.glb", position: [0, 25, -10], scale: 5 },
];
character.forEach(({ file, position, scale }) => {
  loader.load(
    `./${file}`,
    (gltf) => {
      const obj = gltf.scene;
      obj.position.set(...position);
      obj.scale.setScalar(scale);
      scene.add(obj);
    },
    undefined,
    (error) => console.error(`Erreur avec le fichier ${file}:`, error),
  );
});

const controls = new OrbitControls(camera, renderer.domElement);

// --- BOUCLE D'ANIMATION ---
function animate() {
  requestAnimationFrame(animate);

  // Animation des étoiles pour créer un effet de mouvement
  // On parcourt les étoiles stockées
  for (let i = 0; i < starArray.length; i++) {
    const star = starArray[i];
    star.position.z += 0.5; // Avance les étoiles vers la caméra
    // Si l'étoile dépasse la caméra, on la replace loin derrière
    if (star.position.z > 50) {
      star.position.z = -150; // Repositionner loin derrière
    }
  }
  controls.update();
  renderer.render(scene, camera);
}

// Gérer le redimensionnement de la fenêtre
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- BOUCLE D'ANIMATION ---
function animate() {
  requestAnimationFrame(animate);

  // Fait tourner tout le ciel étoilé
  starParticles.rotation.y -= 0.0005;
  starParticles.rotation.x -= 0.0002;

  controls.update();
  renderer.render(scene, camera);
}
