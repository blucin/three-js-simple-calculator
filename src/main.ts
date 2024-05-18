import * as THREE from "three";
import "./style.css";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// scene
const scene = new THREE.Scene();

// Calculator Body Geometry and Material
const bodyGeometry = new THREE.BoxGeometry(15, 18, 2);
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x444444,
  roughness: 0.3,
  metalness: 0.6
});
const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
bodyMesh.position.set(0, -5, -1);
scene.add(bodyMesh);

// Screen Geometry and Material
const screenGeometry = new THREE.PlaneGeometry(15, 5);
const screenMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888,
  roughness: 0.2,
  metalness: 0.5
});
const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
screenMesh.position.set(0, 3, 0.1); // Positioned slightly in front of the body
scene.add(screenMesh);

// light
const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(0, 0, 5);
scene.add(light);

// camera
const camera = new THREE.PerspectiveCamera(
  75,
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

// Load font and create text
const loader = new FontLoader();
let textMesh: THREE.Mesh;
let expression = "0";

// Function to create and update text
const updateText = (text: string) => {
  if (textMesh) {
    scene.remove(textMesh);
  }

  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: 1,
      height: 0.2
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-5.5, 2.5, 0.2);
    scene.add(textMesh);
  });
};
updateText(expression); // Initial text

// Button Geometry and Material
const buttonGeometry = new THREE.BoxGeometry(2, 2, 0.5);
const buttonMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  roughness: 0.3,
  metalness: 0.6
});

const buttons = [
  { label: "1", position: [-3, -2, 1] },
  { label: "2", position: [0, -2, 1] },
  { label: "3", position: [3, -2, 1] },
  { label: "4", position: [-3, -5, 1] },
  { label: "5", position: [0, -5, 1] },
  { label: "6", position: [3, -5, 1] },
  { label: "7", position: [-3, -8, 1] },
  { label: "8", position: [0, -8, 1] },
  { label: "9", position: [3, -8, 1] },
  { label: "0", position: [0, -11, 1] },
  { label: "C", position: [-6, -2, 1] },
  { label: "CE", position: [6, -2, 1] },
  { label: "+", position: [6, -5, 1] },
  { label: "-", position: [6, -8, 1] },
  { label: "/", position: [-6, -5, 1] },
  { label: "x", position: [-6, -8, 1] },
  { label: "(+/-)", position: [-6, -11, 1] },
  { label: "=", position: [6, -11, 1] }
];

// Create buttons
buttons.forEach(button => {
  const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
  buttonMesh.position.set(button.position[0], button.position[1], button.position[2]);
  scene.add(buttonMesh);

  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry(button.label, {
      font: font,
      size: 0.6,
      height: 0.1
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textGeometry.computeBoundingBox();
    const offset = textGeometry.boundingBox.max.clone().add(textGeometry.boundingBox.min).multiplyScalar(-0.5);
    textMesh.position.set(offset.x, offset.y, 0.3);
    buttonMesh.add(textMesh);
  });

  buttonMesh.userData.label = button.label;
});

// Function to evaluate the expression
const evaluateExpression = () => {
  try {
    expression = eval(expression.replace('x', '*')).toString();
  } catch {
    expression = "Error";
  }
  updateText(expression);
};

// Function to handle input
const handleInput = (input: string) => {
  if (input === 'C') {
    expression = "0";
  } else if (input === 'CE') {
    expression = expression.slice(0, -1) || "0";
  } else if (input === "=") {
    evaluateExpression();
    return;
  } else {
    if (expression === "0") {
      expression = input;
    } else {
      expression += input;
    }
  }
  updateText(expression);
};

// Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for mouse clicks
canvas.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject.userData.label) {
      handleInput(intersectedObject.userData.label);
    }
  }
});

// Add keydown event listener
window.addEventListener('keydown', (event) => {
  if ((event.key >= '0' && event.key <= '9') || ['+', '-', '*', '/'].includes(event.key)) {
    handleInput(event.key === '*' ? 'x' : event.key);
  } else if (event.key === 'Enter') {
    handleInput('=');
  } else if (event.key === 'Backspace') {
    handleInput('CE');
  }
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update controls
  renderer.render(scene, camera);
}
animate();

