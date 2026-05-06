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
  // On calcule la position de la souris par rapport au centre de l'écran
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

// Tableau pour mémoriser les objets et pouvoir les animer plus tard
const loadedObjects = [];

// NOUVEAU PLACEMENT : [X (gauche/droite), Y (haut/bas), Z (profondeur)]
const character = [
  { file: "superman.glb", position: [0, 8, -10], scale: 3 }, // Centre haut
  { file: "wonde woman lasso.glb", position: [0, -6, -5], scale: 5 }, // Centre bas
  { file: "Aquaman tridant.glb", position: [12, 2, -10], scale: 2 }, // Droite
  { file: "arc de arrow.glb", position: [-12, 2, -10], scale: 5 }, // Gauche
  { file: "bague de flash.glb", position: [7, 12, -15], scale: 5 },
  { file: "cape de raven.glb", position: [-7, 12, -15], scale: 5 },
  { file: "costume nightwing.glb", position: [18, -4, -12], scale: 2 },
  { file: "deathstrke mask.glb", position: [-18, -4, -12], scale: 2 },
  { file: "Lobo moto.glb", position: [8, -12, -15], scale: 1 },
  { file: "masque de bane.glb", position: [-8, -12, -15], scale: 5 },
  { file: "Masque de Fathe.glb", position: [24, 6, -18], scale: 5 },
  { file: "massue hawkman (1).glb", position: [-24, 6, -18], scale: 5 },
];

character.forEach(({ file, position, scale }) => {
  loader.load(
    `./${file}`,
    (gltf) => {
      const obj = gltf.scene;
      obj.position.set(...position);
      obj.scale.setScalar(scale);
      scene.add(obj);
      loadedObjects.push(obj); // On sauvegarde l'objet pour l'animation
    },
    undefined,
    (error) => console.error(`Erreur avec le fichier ${file}:`, error),
  );
});

const controls = new OrbitControls(camera, renderer.domElement);

// --- BOUCLE D'ANIMATION ---
function animate() {
  requestAnimationFrame(animate);

  // 1. Fait tourner les étoiles
  starParticles.rotation.y -= 0.0005;
  starParticles.rotation.x -= 0.0002;

  // 2. EFFET PARALLAXE : La scène bouge doucement en suivant la souris
  scene.rotation.y += (mouseX * 0.1 - scene.rotation.y) * 0.05;
  scene.rotation.x += (-mouseY * 0.1 - scene.rotation.x) * 0.05;

  // 3. EFFET APESANTEUR : Fait flotter les objets DC
  const time = Date.now() * 0.001;
  loadedObjects.forEach((obj, index) => {
    obj.position.y += Math.sin(time + index) * 0.005;
  });

  controls.update();
  renderer.render(scene, camera);
}

// --- GÉRER LE REDIMENSIONNEMENT DE LA FENÊTRE ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lancement
animate();
