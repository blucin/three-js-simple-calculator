import * as THREE from "three";
import "./style.css";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Calculator } from "./calculator";
import { initTabs } from "./flowbite";
import { initThemeToggling } from "./theme";

// Theme toggling
initThemeToggling();

// html calculator (to be kept in sync with the 3D model)
initTabs();
const buttonTypes = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "add",
  "subtract",
  "multiply",
  "divide",
  "modulo",
  "clear",
  "clear-entry",
  "equal",
];
const htmlScreen = document.getElementById("htmlScreen");
const htmlButtons = buttonTypes.map((type) =>
  document.getElementById("button-" + type)
);
htmlButtons.forEach((button) => {
  button?.addEventListener("click", () => {
    calculator.handleInput(button.innerText);
    updateText(calculator.getExpression());
  });
});

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
camera.position.set(0, 0, 20);
scene.add(camera);

// renderer
const canvas = document.getElementById("threejs-canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas,  antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;

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
    calculatorModel.position.set(0, 5, 0);
    calculatorModel.rotation.x = Math.PI / 2;
    updateText(calculator.getExpression()); // Initial text
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Invisible buttons to detect clicks
// We will use the userData property to store the label
// This will help us to identify the button clicked
// If DEBUG_BTN is true then the buttons will be visible to debug
const DEBUG_BTN = false; // Change this to false to hide the boxes and labels
const buttonGeometry = new THREE.BoxGeometry(1, 1, 0.5);
const debugMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
});
const transparentMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
});
const buttonMaterial = DEBUG_BTN ? debugMaterial : transparentMaterial;
const buttonMeshes: THREE.Mesh[] = [];
const buttonLabels = [
  "", // _
  "", // _
  "", // _
  "%",
  "/",
  "", // _
  "7",
  "8",
  "9",
  "x",
  "", // _
  "4",
  "5",
  "6",
  "-",
  "CE",
  "1",
  "2",
  "3",
  "+", // _
  "C",
  "0",
  ".",
  "=",
  "+",
];
for (let i = 0; i < buttonLabels.length; i++) {
  if (buttonLabels[i] === "") {
    continue;
  }
  // Make the + button larger than the rest
  const buttonMesh = new THREE.Mesh(
    buttonLabels[i] === "+"
      ? new THREE.BoxGeometry(1, 1.2, 0.5)
      : buttonGeometry,
    buttonMaterial
  );
  // Adjust the x-position based on the column index using the modulus operator
  buttonMesh.position.set(
    -3.5 + (i % 5) * 1.5 + (i % 5 === 0 ? 0.3 : i % 5 === 4 ? 0.7 : 0.5), // 5 columns, each 1.5 units wide, with extra spacing on the first and last columns
    5 - Math.floor(i / 5) * 1.2, // 5 rows, each 1.5 units high
    0.4
  );

  buttonMesh.userData.label = buttonLabels[i];
  scene.add(buttonMesh);
  buttonMeshes.push(buttonMesh);

  // Load the font and create the text mesh only when DEBUG_BTN is true
  if (DEBUG_BTN) {
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const textGeometry = new TextGeometry(buttonLabels[i], {
          font: font,
          size: 0.5,
          depth: 0.1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
        });
        // Adjust the x-position of the text mesh based on the column index using the modulus operator
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(
          -3.5 + (i % 5) * 1.5 + (i % 5 === 0 ? 0.3 : i % 5 === 4 ? 0.7 : 0.5), // 5 columns, each 1.5 units wide, with extra spacing on the first and last columns
          5 - 0.3 /*offset*/ - Math.floor(i / 5) * 1.2, // 5 rows, each 1.5 units high
          0.6 // Slightly above the button
        );
        scene.add(textMesh);
      }
    );
  }
}

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
screenMesh.position.set(0, 8.4, 0.68);
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
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const textGeometry = new TextGeometry(
        text.length > 10 ? "Overflow" : text,
        {
          font: font,
          size: 0.7,
          depth: 0.15,
        }
      );

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000, // Bright color for visibility
        roughness: 0.3,
        metalness: 0.5,
      });
      textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-2.7, 8, 0.5);
      textMesh.rotation.x = Math.PI / 25;
      textMesh.rotation.z = Math.PI / 2000;
      scene.add(textMesh);
    }
  );
  if (htmlScreen) {
    htmlScreen.innerText = text;
  }
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
    ["+", "-", "*", "/", "%"].includes(event.key)
  ) {
    calculator.handleInput(event.key === "*" ? "x" : event.key);
  } else if (event.key === "Enter") {
    calculator.handleInput("=");
  } else if (event.key === "Backspace") {
    calculator.handleInput("CE");
  } else if (event.key === "Escape") {
    calculator.handleInput("C");
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
