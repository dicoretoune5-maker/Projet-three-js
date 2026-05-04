import * as THREE from 'three';
// Création de l'univers (la scène)
const scene = new THREE.Scene();
// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- AJOUT DE LUMIÈRE ---
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
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
    starArray.push(star);
  }
}
addStars();

// --- L'OBJET CENTRAL (Un marque-place pour un héros) ---
const geometry = new THREE.OctahedronGeometry(2, 0); // Une forme de diamant
const material = new THREE.MeshStandardMaterial({ color: 0x3366ff }); // Bleu
const centralObject = new THREE.Mesh(geometry, material);
scene.add(centralObject);

// --- BOUCLE D'ANIMATION ---
function animate() {
  requestAnimationFrame(animate);
  
  centralObject.rotation.y += 0.01;
  centralObject.rotation.z += 0.005;

  // Animation des étoiles pour créer un effet de mouvement
  // On parcourt les étoiles stockées
  for (let i=0; i < starArray.length; i++) {
    const star = starArray[i];
    star.position.z += 0.5; // Avance les étoiles vers la caméra
    // Si l'étoile dépasse la caméra, on la replace loin derrère
    if (star.position.z > 50) {
      star.position.z = -150; // Repositionner loin derrière
    }
  }

  renderer.render(scene, camera);
}

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
