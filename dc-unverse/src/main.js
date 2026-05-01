import * as THREE from 'three';
// Création de l'univers (la scène)
const scene = new THREE.Scene();
// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
