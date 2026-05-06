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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 2));

// ==========================================
// 2. LA GALAXIE (VERSION AFFINÉE)
// ==========================================
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const positionArray = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
  positionArray[i] = (Math.random() - 0.5) * 500;
}
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3),
);

const starMaterial = new THREE.PointsMaterial({
  size: 0.3,
  color: 0xffffff,
  transparent: true,
  opacity: 0.6,
  sizeAttenuation: true,
});

const starParticles = new THREE.Points(starGeometry, starMaterial);
scene.add(starParticles);

// ==========================================
// 3. CHARGEMENT DES OBJETS 3D
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
controls.enableDamping = true;

function animate() {
  requestAnimationFrame(animate);
  starParticles.rotation.y -= 0.0003;
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
  const pLight = new THREE.PointLight(0xffffff, 50);
  pLight.position.set(5, 5, 5);
  miniScene.add(pLight);

  miniControls = new OrbitControls(miniCamera, miniRenderer.domElement);
  miniControls.enableZoom = true;

  loader.load(`./${file}`, (gltf) => {
    const model = gltf.scene;
    miniScene.add(model);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
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
// 5. MÉCANIQUE DE JEU
// ==========================================
const corectAnswers = {
  "superman.glb": ["superman", "clark kent", "clark"],
  "wonde woman lasso.glb": [
    "wonder woman",
    "wonderwoman",
    "diana prince",
    "wonde woman",
  ],
  "Aquaman tridant.glb": ["aquaman", "arthur curry", "aquaman tridant"],
  "arc de arrow.glb": ["green arrow", "arrow", "oliver queen"],
  "bague de flash.glb": ["flash", "the flash", "barry allen"],
  "cape de raven.glb": ["raven", "rachel roth"],
  "costume nightwing.glb": ["nightwing", "dick grayson"],
  "deathstrke mask.glb": ["deathstroke", "slade wilson", "deathstrke"],
  "Lobo moto.glb": ["lobo"],
  "masque de bane.glb": ["bane"],
  "Masque de Fathe.glb": ["doctor fate", "dr fate", "fate", "kent nelson"],
  "massue hawkman (1).glb": ["hawkman", "carter hall"],
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
      console.log("Cliqué sur :", currentObjectFile); // Debug utile
      document.getElementById("game-popup").style.display = "flex";
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
    feedback.innerText = "Bravo ! C'est le bon héros.";
    feedback.style.color = "#4ade80";
    score++;
    loadedObjects.forEach((obj) => {
      if (obj.userData.name === currentObjectFile) obj.visible = false;
    });
    setTimeout(() => {
      document.getElementById("game-popup").style.display = "none";
      cleanupMiniViewer();
      if (score === character.length) window.location.href = "page_de_fin.html";
    }, 1500);
  } else {
    feedback.innerText = "Dommage, réessaie !";
    feedback.style.color = "#f87171";
  }
});

document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("game-popup").style.display = "none";
  cleanupMiniViewer();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
