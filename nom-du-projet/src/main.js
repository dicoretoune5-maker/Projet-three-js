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

// --- CRÉATION DES ÉTOILES (Formation) ---
const starArray = [];
function addStars() {
  const geometry = new THREE.SphereGeometry(0.1, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < 1000; i++) {
    const star = new THREE.Mesh(geometry, material);
    // Positionnement aléatoire pour simuler l'immensité
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
    starArray.push(star);
  }
}
addStars();
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
  { file: "Aquaman_tridant.glb", position: [20, 5, -10], scale: 2 },
  { file: "arc_de_arrow.glb", position: [-20, -5, 10], scale: 5 },
  { file: "bague_de_flash.glb", position: [10, 15, -20], scale: 5 },
  { file: "cape_de_raven.glb", position: [10, -15, 20], scale: 5 },
  { file: "costume_nightwing.glb", position: [25, 0, 15], scale: 2 },
  { file: "deathstrke_mask.glb", position: [-25, 10, -15], scale: 2 },
  { file: "Lobo_moto.glb", position: [15, -20, 5], scale: 1 },
  { file: "masque_de_bane.glb", position: [-15, 20, -5], scale: 5 },
  { file: "Masque_de_Fathe.glb", position: [30, -10, 0], scale: 5 },
  { file: "massue_hawkman.glb", position: [-30, 10, 0], scale: 5 },
  { file: "wonde_woman_lasso.glb", position: [0, 25, -10], scale: 5 },
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

animate();
