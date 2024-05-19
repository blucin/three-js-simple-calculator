import * as THREE from "three";
import "./style.css";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Calculator } from "./calculator";

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.PointLight(0xffffff, 1000, 100);
light.position.set(0, 0, 20);
scene.add(light);

// camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;
scene.add(camera);

// renderer
const canvas = document.getElementById("threejs-canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Create calculator instance
const calculator = new Calculator();

// Load the GLTF model of calculator
const loader = new GLTFLoader();
loader.load(
  "/calculator.glb",
  (gltf) => {
    const calculatorModel = gltf.scene;
    scene.add(calculatorModel);
    calculatorModel.scale.set(1.5, 1.5, 1.5);
    calculatorModel.position.set(0, 0, 0);
    calculatorModel.rotation.x = Math.PI / 2;
    updateText(calculator.getExpression()); // Initial text
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Screen
// To display the text
// We won't be using the screen from the model
// Instead, we will create a separate screen 
const screenGeometry = new THREE.PlaneGeometry(7, 2.5);
const screenMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888,
  roughness: 0.4,
  metalness: 0.5,
});
const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
screenMesh.position.set(0, 3.4, 0.68);
screenMesh.rotation.x = Math.PI / 25;
scene.add(screenMesh);

// Text
// To display the expression on the screen
const fontLoader = new FontLoader();
let textMesh: THREE.Mesh;
const updateText = (text: string) => {
  if (textMesh) {
    scene.remove(textMesh);
  }
  if (text.length === 11) {
    text = "Overflow";
  }
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.7,
        height: 0.15,
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000, // Bright color for visibility
        roughness: 0.3,
        metalness: 0.5,
      });
      textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-2.7, 3, 0.5);
      textMesh.rotation.x = Math.PI / 25;
      textMesh.rotation.z = Math.PI / 2000;
      scene.add(textMesh);
    }
  );
};

// Raycaster and mouse vector
// To detect mouse clicks on the buttons
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for mouse clicks
canvas.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true); // Ensure recursive check

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject.userData.label) {
      calculator.handleInput(intersectedObject.userData.label);
      updateText(calculator.getExpression());
    }
  }
});

// Add keydown event listener
window.addEventListener("keydown", (event) => {
  if (
    (event.key >= "0" && event.key <= "9") ||
    ["+", "-", "*", "/"].includes(event.key)
  ) {
    calculator.handleInput(event.key === "*" ? "x" : event.key);
  } else if (event.key === "Enter") {
    calculator.handleInput("=");
  } else if (event.key === "Backspace") {
    calculator.handleInput("CE");
  }
  updateText(calculator.getExpression());
});

// Resize event listener
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update controls
  renderer.render(scene, camera);
}
animate();
